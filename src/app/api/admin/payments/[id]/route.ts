///Users/xeoren/Desktop/lucky_draw/src/app/api/admin/payments/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { payment_status, ticket_status, ticket_source, wallet_transaction_type, wallet_transaction_source, Prisma } from "@/generated/client/client";

/* =========================
   GET — View Single Payment (For Reviewing)
========================= */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const payment = await prisma.payment.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true, mobile: true, avatar: true }
        },
        draw: {
          select: { id: true, title: true, bannerImage: true, entryFee: true }
        }
      }
    });

    if (!payment) return errorResponse("Payment not found", 404);

    return jsonResponse({ payment });

  } catch (err) {
    console.error("ADMIN GET PAYMENT ERROR:", err);
    return errorResponse("Server error", 500);
  }
}

/* =========================
   PUT — Approve/Reject Payment
========================= */
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

    const payment = await prisma.payment.findUnique({
      where: { id: BigInt(id) },
      include: {
        draw: {
          select: {
            id: true,
            title: true,
            entryFee: true,
            maxTickets: true,
            _count: { select: { ticket: true } },
          },
        },
      },
    });

    if (!payment) return errorResponse("Payment not found", 404);

    if (payment.status !== payment_status.PENDING) {
      return errorResponse(`Payment is already ${payment.status}`, 400);
    }

    /* =====================================================
       REJECT
    ===================================================== */
    if (newStatus === payment_status.REJECTED) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: payment_status.REJECTED,
            failureReason: remark || "Rejected by Admin",
          },
        });
        // 2️⃣ WALLET REFUND (VERY IMPORTANT)
        if (payment.walletUsed && payment.walletUsed > 0) {

          // 🔹 Get current wallet balance
          const user = await tx.user.findUnique({
            where: { id: payment.userId },
            select: { wallet: true },
          });

          const newBalance = user!.wallet + payment.walletUsed;

          // 🔹 Update wallet
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              wallet: newBalance,
            },
          });

          // 🔹 Wallet transaction (CREDIT)
          await tx.walletTransaction.create({
            data: {
              userId: payment.userId,
              amount: payment.walletUsed,
              balanceAfter: newBalance,
              type: wallet_transaction_type.CREDIT,
              source: wallet_transaction_source.REFUND,
              referenceId: payment.id,
              remark: `Refund for rejected payment of draw #${payment.draw.id}`,
            },
          });
        }

        // 🔔 USER NOTIFICATION
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: "Payment Rejected ❌",
            message: `Your payment for draw "${payment.draw.title}" was rejected. ${remark ? "Reason: " + remark : ""
              }`,
          },
        });

        // 🧾 AUDIT LOG
        await tx.auditlog.create({
          data: {
            action: "PAYMENT_REJECTED",
            entity: "PAYMENT",
            entityId: payment.id,
            adminId: BigInt(admin.id),
            meta: JSON.stringify({ remark }),
          },
        });
      });

      return jsonResponse({
        success: true,
        message: "Payment Rejected & User Notified",
      });
    }

    /* =====================================================
       APPROVE
    ===================================================== */

    const entryFee = payment.draw.entryFee;
    const ticketCount = Math.floor(payment.amount / entryFee);

    if (ticketCount < 1) {
      return errorResponse("Invalid payment amount", 400);
    }

    const currentSold = payment.draw._count.ticket;
    if (currentSold + ticketCount > payment.draw.maxTickets) {
      return errorResponse("Not enough tickets left", 400);
    }

    const ticketsData: Prisma.ticketUncheckedCreateInput[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < ticketCount; i++) {
      ticketsData.push({
        ticketCode: `T-${payment.draw.id}-${timestamp}-${i}-${Math.floor(
          Math.random() * 1000
        )}`,
        userId: payment.userId,
        drawId: payment.draw.id,
        pricePaid: entryFee,
        status: ticket_status.ACTIVE,
        source: ticket_source.USER_PURCHASE,
        paymentId: i === 0 ? payment.id : null,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: payment_status.APPROVED },
      });

      const [firstTicket, ...rest] = ticketsData;
      await tx.ticket.create({ data: firstTicket });
      if (rest.length > 0) await tx.ticket.createMany({ data: rest });

      // 🔔 USER NOTIFICATION
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: "Payment Approved ✅",
          message: `Your payment for draw "${payment.draw.title}" has been approved. ${ticketCount} ticket(s) added to your account.`,
        },
      });

      // 🧾 AUDIT LOG
      await tx.auditlog.create({
        data: {
          action: "PAYMENT_APPROVED",
          entity: "PAYMENT",
          entityId: payment.id,
          adminId: BigInt(admin.id),
          meta: JSON.stringify({
            ticketsGenerated: ticketCount,
            remark,
          }),
        },
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