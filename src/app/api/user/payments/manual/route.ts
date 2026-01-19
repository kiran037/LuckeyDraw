import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import {
  payment_status,
  payment_method,
  payment_gateway,
  wallet_transaction_type,
  wallet_transaction_source,
} from "@/generated/client/client";

export async function POST(request: Request) {
  try {
    /* =======================
       1. AUTH
    ======================= */
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

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

    const uId = BigInt(user.id);
    const dId = BigInt(drawId);

    /* =======================
       2. DRAW VALIDATION
    ======================= */
    const draw = await prisma.draw.findUnique({
      where: { id: dId },
      include: {
        _count: {
          select: {
            ticket: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    if (!draw) return errorResponse("Draw not found", 404);
    if (draw.status !== "LIVE") return errorResponse("Draw is not active", 400);
    if (new Date() > draw.endTime)
      return errorResponse("Draw has ended", 400);
    if (draw._count.ticket >= draw.maxTickets)
      return errorResponse("Draw is sold out", 409);

    /* =======================
       3. USER WALLET CHECK
    ======================= */
    const dbUser = await prisma.user.findUnique({
      where: { id: uId },
      select: { wallet: true },
    });

    if (!dbUser) return errorResponse("User not found", 404);

    const walletBalance = dbUser.wallet;
    const safeWalletUsed = Math.max(
      0,
      Math.min(walletUsed, walletBalance, draw.entryFee)
    );

    const remainingAmount = draw.entryFee - safeWalletUsed;
    const finalPayable = remainingAmount + processingFee;

    /* =======================
       4. MANUAL PAYMENT CHECK
    ======================= */
    if (finalPayable > 0) {
      if (!transactionId || !screenshot) {
        return errorResponse(
          "Transaction ID and screenshot required",
          400
        );
      }

      const duplicateTxn = await prisma.payment.findUnique({
        where: { transactionId },
      });

      if (duplicateTxn) {
        return errorResponse(
          "This Transaction ID is already used",
          409
        );
      }
    }

    const existingPending = await prisma.payment.findFirst({
      where: {
        userId: uId,
        drawId: dId,
        status: payment_status.PENDING,
      },
    });

    if (existingPending) {
      return errorResponse(
        "You already have a pending payment for this draw",
        409
      );
    }

    /* =======================
       5. DATABASE TRANSACTION
    ======================= */
    const result = await prisma.$transaction(async (tx) => {
      /* ---- Wallet Deduction ---- */
      if (safeWalletUsed > 0) {
        await tx.user.update({
          where: { id: uId },
          data: {
            wallet: { decrement: safeWalletUsed },
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: uId,
            amount: -safeWalletUsed,
            balanceAfter: walletBalance - safeWalletUsed,
            type: wallet_transaction_type.DEBIT,
            source: wallet_transaction_source.DRAW_ENTRY,
            referenceId: dId,
            remark: `Used for draw #${draw.id}`,
          },
        });
      }

      /* ---- Payment Record ---- */
      const payment = await tx.payment.create({
        data: {
          userId: uId,
          drawId: dId,
          amount: finalPayable,
          status:
            finalPayable > 0
              ? payment_status.PENDING
              : payment_status.APPROVED,
          method:
            finalPayable > 0
              ? payment_method.UPI
              : payment_method.WALLET,
          gateway: payment_gateway.MANUAL,
          walletUsed: safeWalletUsed,
          transactionId: finalPayable > 0 ? transactionId : null,
          screenshot: finalPayable > 0 ? screenshot : null,
        },
      });

      /* ---- Auto Ticket (Wallet Only) ---- */
      if (finalPayable === 0) {
        const timestamp = Date.now();
        const i = 0;

        await tx.ticket.create({
          data: {
            userId: uId,
            drawId: dId,
            pricePaid: draw.entryFee,
            status: "ACTIVE",
            source: "USER_PURCHASE",
            paymentId: payment.id,
            ticketCode: `T-${draw.id}-${timestamp}-${i}-${Math.floor(Math.random() * 1000)}`,
          },
        });
      }

      return payment;
    });

    /* =======================
       6. RESPONSE
    ======================= */
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
