///Users/xeoren/Desktop/draw/src/app/api/user/draws/[id]/join/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  // FIX 1: Type 'params' as a Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX 2: Await the params before using them
    const { id } = await params;

    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const drawId = BigInt(id);
    const userId = BigInt(sessionUser.id);

    // 1. Validate Draw Status and Capacity
    const draw = await prisma.draw.findUnique({ where: { id: drawId } });

    if (!draw) return NextResponse.json({ success: false, message: "Draw not found" }, { status: 404 });
    
    if (draw.status !== 'LIVE') {
      return NextResponse.json({ success: false, message: "Draw is not active" }, { status: 400 });
    }

    if (new Date() > new Date(draw.endTime)) {
      return NextResponse.json({ success: false, message: "Draw has ended" }, { status: 400 });
    }

    const soldCount = await prisma.ticket.count({ where: { drawId, status: 'ACTIVE' } });
    if (soldCount >= draw.maxTickets) {
      return NextResponse.json({ success: false, message: "Draw is sold out" }, { status: 400 });
    }

    // 2. Create Pending Payment Record
    // In a real app, you would create an order with Razorpay/Stripe here
    const payment = await prisma.payment.create({
      data: {
        userId,
        drawId,
        amount: draw.entryFee,
        status: 'PENDING',
        method: 'UPI',       // Defaulting for this example
        gateway: 'MANUAL',   // Or RAZORPAY
        gatewayOrderId: `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`, 
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id.toString(), // Convert BigInt to string
        amount: draw.entryFee,
        orderId: payment.gatewayOrderId
      }
    });

  } catch (error) {
    console.error("Join Draw Error:", error);
    return NextResponse.json({ success: false, message: "Failed to initiate join" }, { status: 500 });
  }
}