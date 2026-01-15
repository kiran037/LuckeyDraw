import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { payment_status, payment_method, payment_gateway } from "@/generated/client/client";

export async function POST(request: Request) {
  try {
    // 1. Auth Check
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const { drawId, transactionId, screenshot } = body;

    // 2. Validation
    if (!drawId || !transactionId || !screenshot) {
      return errorResponse("Missing fields: drawId, transactionId, or screenshot", 400);
    }

    const dId = BigInt(drawId);
    const uId = BigInt(user.id);

    // 3. Check Draw Validity
    const draw = await prisma.draw.findUnique({
      where: { id: dId },
      include: { _count: { select: { ticket: { where: { status: 'ACTIVE' } } } } }
    });

    if (!draw) return errorResponse("Draw not found", 404);
    if (draw.status !== 'LIVE') return errorResponse("Draw is not active", 400);
    if (new Date() > draw.endTime) return errorResponse("Draw has ended", 400);
    if (draw._count.ticket >= draw.maxTickets) return errorResponse("Draw is sold out", 409);

    // 4. Check for Existing Pending Payment
    // Prevent spamming requests for the same draw
    const existingPending = await prisma.payment.findFirst({
      where: { userId: uId, drawId: dId, status: payment_status.PENDING }
    });

    if (existingPending) {
      return errorResponse("You already have a pending payment verification for this draw.", 409);
    }

    // 5. Check Duplicate Transaction ID (Global check)
    const duplicateTxn = await prisma.payment.findUnique({
      where: { transactionId: transactionId }
    });

    if (duplicateTxn) {
      return errorResponse("This Transaction ID has already been submitted.", 409);
    }

    // 6. Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        userId: uId,
        drawId: dId,
        amount: draw.entryFee,
        status: payment_status.PENDING,
        method: payment_method.UPI,
        gateway: payment_gateway.MANUAL,
        transactionId: transactionId,
        screenshot: screenshot,
      }
    });

    return jsonResponse({
      message: "Payment submitted successfully! Ticket will be assigned after admin approval.",
      paymentId: payment.id
    }, 201);

  } catch (error) {
    console.error("MANUAL PAYMENT ERROR:", error);
    return errorResponse("Server error", 500);
  }
}