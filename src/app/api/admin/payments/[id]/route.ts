import { NextRequest } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import {
  db,
  payment,
  ticket,
  user,
  notification,
  auditlog,
  walletTransaction,
  payment_status,
  ticket_status,
  ticket_source,
  wallet_transaction_type,
  wallet_transaction_source,
} from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const foundPayment = await db.query.payment.findFirst({
      where: eq(payment.id, BigInt(id)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            avatar: true,
          },
        },
        draw: {
          columns: { id: true, title: true, bannerImage: true, entryFee: true },
        },
      },
    });

    if (!foundPayment) return errorResponse("Payment not found", 404);

    return jsonResponse({ payment: foundPayment });
  } catch (err) {
    console.error("ADMIN GET PAYMENT ERROR:", err);
    return errorResponse("Server error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const body = await req.json();
    const newStatus = body.status as payment_status;
    const remark = body.remark || "";

    if (
      newStatus !== payment_status.APPROVED &&
      newStatus !== payment_status.REJECTED
    ) {
      return errorResponse(
        "Invalid status. Must be APPROVED or REJECTED.",
        400
      );
    }

    const foundPayment = await db.query.payment.findFirst({
      where: eq(payment.id, BigInt(id)),
      with: {
        draw: {
          with: {
            tickets: { columns: { id: true } },
          },
        },
      },
    });

    if (!foundPayment) return errorResponse("Payment not found", 404);

    if (foundPayment.status !== payment_status.PENDING) {
      return errorResponse(`Payment is already ${foundPayment.status}`, 400);
    }

    /* REJECT */
    if (newStatus === payment_status.REJECTED) {
      await db.transaction(async (tx) => {
        const [updatedPayment] = await tx
          .update(payment)
          .set({
            status: payment_status.REJECTED,
            failureReason: remark || "Rejected by Admin",
          })
          .where(
            and(
              eq(payment.id, foundPayment.id),
              eq(payment.status, payment_status.PENDING)
            )
          )
          .returning();

        if (!updatedPayment) {
          throw new Error("Payment was already processed by another request");
        }

        if (foundPayment.walletUsed && foundPayment.walletUsed > 0) {
          const [updatedUser] = await tx
            .update(user)
            .set({
              wallet: sql`${user.wallet} + ${foundPayment.walletUsed}`,
            })
            .where(eq(user.id, foundPayment.userId))
            .returning({ wallet: user.wallet });

          const newBalance = updatedUser?.wallet ?? foundPayment.walletUsed;

          await tx.insert(walletTransaction).values({
            userId: foundPayment.userId,
            amount: foundPayment.walletUsed,
            balanceAfter: newBalance,
            type: wallet_transaction_type.CREDIT,
            source: wallet_transaction_source.REFUND,
            referenceId: foundPayment.id,
            remark: `Refund for rejected payment of draw #${foundPayment.draw.id}`,
          });
        }

        await tx.insert(notification).values({
          userId: foundPayment.userId,
          title: "Payment Rejected ❌",
          message: `Your payment for draw "${foundPayment.draw.title}" was rejected. ${
            remark ? "Reason: " + remark : ""
          }`,
        });

        await tx.insert(auditlog).values({
          action: "PAYMENT_REJECTED",
          entity: "PAYMENT",
          entityId: foundPayment.id,
          adminId: BigInt(admin.id),
          meta: JSON.stringify({ remark }),
        });
      });

      return jsonResponse({
        success: true,
        message: "Payment Rejected & User Notified",
      });
    }

    /* APPROVE */
    const entryFee = foundPayment.draw.entryFee;
    const totalPaid = (foundPayment.walletUsed || 0) + foundPayment.amount;
    const ticketCount = Math.max(1, Math.floor(totalPaid / entryFee));

    if (ticketCount < 1) {
      return errorResponse("Invalid payment amount", 400);
    }

    const currentSold = (foundPayment.draw.tickets || []).length;
    if (currentSold + ticketCount > foundPayment.draw.maxTickets) {
      return errorResponse("Not enough tickets left", 400);
    }

    const ticketsData: (typeof ticket.$inferInsert)[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < ticketCount; i++) {
      ticketsData.push({
        ticketCode: `T-${foundPayment.draw.id}-${timestamp}-${i}-${Math.floor(
          Math.random() * 10000
        )}`,
        userId: foundPayment.userId,
        drawId: foundPayment.draw.id,
        pricePaid: entryFee,
        status: ticket_status.ACTIVE,
        source: ticket_source.USER_PURCHASE,
        paymentId: foundPayment.id,
      });
    }

    await db.transaction(async (tx) => {
      const [updatedPayment] = await tx
        .update(payment)
        .set({ status: payment_status.APPROVED })
        .where(
          and(
            eq(payment.id, foundPayment.id),
            eq(payment.status, payment_status.PENDING)
          )
        )
        .returning();

      if (!updatedPayment) {
        throw new Error("Payment was already processed by another request");
      }

      await tx.insert(ticket).values(ticketsData);

      await tx.insert(notification).values({
        userId: foundPayment.userId,
        title: "Payment Approved ✅",
        message: `Your payment for draw "${foundPayment.draw.title}" has been approved. ${ticketCount} ticket(s) added to your account.`,
      });

      await tx.insert(auditlog).values({
        action: "PAYMENT_APPROVED",
        entity: "PAYMENT",
        entityId: foundPayment.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify({
          ticketsGenerated: ticketCount,
          remark,
        }),
      });
    });

    return jsonResponse({
      success: true,
      message: `Payment Approved. ${ticketCount} tickets generated & user notified.`,
    });
  } catch (err) {
    console.error("ADMIN UPDATE PAYMENT ERROR:", err);
    return errorResponse("Failed to update payment", 500);
  }
}
