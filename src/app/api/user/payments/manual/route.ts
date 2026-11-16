import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  db,
  user,
  draw,
  payment,
  ticket,
  walletTransaction,
  payment_status,
  payment_method,
  payment_gateway,
  wallet_transaction_type,
  wallet_transaction_source,
  ticket_status,
  ticket_source,
} from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    /* 1. AUTH */
    const authUser = await getCurrentUser();
    if (!authUser) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const {
      drawId,
      transactionId,
      screenshot,
      walletUsed = 0,
      processingFee = 0,
    } = body;

    if (!drawId) {
      return errorResponse("drawId is required", 400);
    }

    const uId = BigInt(authUser.id);
    const dId = BigInt(drawId);

    /* 2. DRAW VALIDATION */
    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, dId),
      with: {
        tickets: {
          where: eq(ticket.status, "ACTIVE"),
          columns: { id: true },
        },
      },
    });

    if (!foundDraw) return errorResponse("Draw not found", 404);
    if (foundDraw.status !== "LIVE") return errorResponse("Draw is not active", 400);
    if (new Date() > new Date(foundDraw.endTime))
      return errorResponse("Draw has ended", 400);

    const activeTicketsCount = (foundDraw.tickets || []).length;
    if (activeTicketsCount >= foundDraw.maxTickets)
      return errorResponse("Draw is sold out", 409);

    /* 3. USER WALLET CHECK */
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, uId),
      columns: { wallet: true },
    });

    if (!dbUser) return errorResponse("User not found", 404);

    const walletBalance = dbUser.wallet;
    const safeWalletUsed = Math.max(
      0,
      Math.min(walletUsed, walletBalance, foundDraw.entryFee)
    );

    const remainingAmount = foundDraw.entryFee - safeWalletUsed;
    const finalPayable = remainingAmount + processingFee;

    /* 4. MANUAL PAYMENT CHECK */
    if (finalPayable > 0) {
      if (!transactionId || !screenshot) {
        return errorResponse("Transaction ID and screenshot required", 400);
      }

      const duplicateTxn = await db.query.payment.findFirst({
        where: eq(payment.transactionId, transactionId),
      });

      if (duplicateTxn) {
        return errorResponse("This Transaction ID is already used", 409);
      }
    }

    const existingPending = await db.query.payment.findFirst({
      where: and(
        eq(payment.userId, uId),
        eq(payment.drawId, dId),
        eq(payment.status, payment_status.PENDING)
      ),
    });

    if (existingPending) {
      return errorResponse(
        "You already have a pending payment for this draw",
        409
      );
    }

    /* 5. DATABASE TRANSACTION */
    const result = await db.transaction(async (tx) => {
      /* ---- Wallet Deduction ---- */
      if (safeWalletUsed > 0) {
        await tx
          .update(user)
          .set({ wallet: sql`${user.wallet} - ${safeWalletUsed}` })
          .where(eq(user.id, uId));

        await tx.insert(walletTransaction).values({
          userId: uId,
          amount: -safeWalletUsed,
          balanceAfter: walletBalance - safeWalletUsed,
          type: wallet_transaction_type.DEBIT,
          source: wallet_transaction_source.DRAW_ENTRY,
          referenceId: dId,
          remark: `Used for draw #${foundDraw.id}`,
        });
      }

      /* ---- Payment Record ---- */
      const [createdPayment] = await tx
        .insert(payment)
        .values({
          userId: uId,
          drawId: dId,
          amount: finalPayable,
          status:
            finalPayable > 0
              ? payment_status.PENDING
              : payment_status.APPROVED,
          method:
            finalPayable > 0 ? payment_method.UPI : payment_method.WALLET,
          gateway: payment_gateway.MANUAL,
          walletUsed: safeWalletUsed,
          transactionId: finalPayable > 0 ? transactionId : null,
          screenshot: finalPayable > 0 ? screenshot : null,
        })
        .returning();

      /* ---- Auto Ticket (Wallet Only) ---- */
      if (finalPayable === 0) {
        const timestamp = Date.now();
        const i = 0;

        await tx.insert(ticket).values({
          userId: uId,
          drawId: dId,
          pricePaid: foundDraw.entryFee,
          status: ticket_status.ACTIVE,
          source: ticket_source.USER_PURCHASE,
          paymentId: createdPayment.id,
          ticketCode: `T-${foundDraw.id}-${timestamp}-${i}-${Math.floor(
            Math.random() * 1000
          )}`,
        });
      }

      return createdPayment;
    });

    /* 6. RESPONSE */
    return jsonResponse(
      {
        message:
          finalPayable === 0
            ? "Ticket booked using wallet successfully"
            : "Payment submitted. Ticket will be issued after admin approval.",
        paymentId: result.id.toString(),
        walletUsed: safeWalletUsed,
        payable: finalPayable,
      },
      201
    );
  } catch (error) {
    console.error("MANUAL PAYMENT ERROR:", error);
    return errorResponse("Server error", 500);
  }
}
