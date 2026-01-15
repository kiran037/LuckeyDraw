import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { drawId, transactionId, screenshot } = body;

    if (!drawId || !transactionId || !screenshot) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const dId = BigInt(drawId);
    const uId = BigInt(user.id);

    // 1. Validate Draw
    const draw = await prisma.draw.findUnique({
      where: { id: dId },
      include: { _count: { select: { ticket: true } } }
    });

    if (!draw || draw.status !== 'LIVE') {
      return NextResponse.json({ success: false, message: "Draw is not active" }, { status: 400 });
    }

    // 2. Check Capacity
    if (draw._count.ticket >= draw.maxTickets) {
      return NextResponse.json({ success: false, message: "Draw is sold out" }, { status: 400 });
    }

    // 3. Check for Existing Pending Payment
    const existing = await prisma.payment.findFirst({
      where: { userId: uId, drawId: dId, status: 'PENDING' }
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "You already have a pending payment for this draw." }, { status: 409 });
    }

    // 4. Create PENDING Payment
    // Note: We store the transactionId in 'transactionId' field (ensure schema has it)
    // or map it to gatewayOrderId if your schema is strict.
    await prisma.payment.create({
      data: {
        userId: uId,
        drawId: dId,
        amount: draw.entryFee,
        status: 'PENDING',
        method: 'UPI', 
        gateway: 'MANUAL',
        transactionId: transactionId, // Ensure this column exists in schema!
        screenshot: screenshot,       // Ensure this column exists in schema!
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment submitted successfully"
    });

  } catch (error) {
    console.error("Payment Submit Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}