///Users/xeoren/Desktop/draw/src/app/api/user/draws/purchase/initiate/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { payment_gateway, payment_method, draw_status, } from '@/generated/client/client';

// Prevent caching for payment initiation
export const dynamic = 'force-dynamic';

/**
 * Type-safe BigInt serializer
 */
const serializeBigInt = (data: unknown): string => {
  return JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

interface InitiatePurchaseBody {
  drawId: string | number;
  gateway?: payment_gateway; // RAZORPAY, STRIPE, etc.
}

export async function POST(request: Request) {
  try {
    const body: InitiatePurchaseBody = await request.json();
    const { drawId: rawDrawId, gateway = payment_gateway.MANUAL } = body;

    if (!rawDrawId) {
      return NextResponse.json({ success: false, error: "Draw ID is required" }, { status: 400 });
    }

    const drawId = BigInt(rawDrawId);

    // ---------------------------------------------------------
    // AUTHENTICATION (Replace with real Session logic)
    // ---------------------------------------------------------
    const userId = BigInt(1); 
    // const session = await getServerSession(...);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // const userId = BigInt(session.user.id);
    // ---------------------------------------------------------

    // 1. Fetch Draw + Current Ticket Count
    // We need to ensure the draw exists and isn't sold out.
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        _count: {
          select: { ticket: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    // 2. Validation: Draw Existence & Status
    if (!draw) {
      return NextResponse.json({ success: false, error: "Draw not found" }, { status: 404 });
    }

    const now = new Date();
    if (draw.status !== draw_status.LIVE) {
      return NextResponse.json({ success: false, error: "Draw is not currently live" }, { status: 400 });
    }

    if (now > draw.endTime) {
      return NextResponse.json({ success: false, error: "Draw has ended" }, { status: 400 });
    }

    // 3. Validation: Sold Out Check
    // Note: High concurrency might still require database locking, but this catches 99% of cases.
    if (draw._count.ticket >= draw.maxTickets) {
      return NextResponse.json({ success: false, error: "Draw is sold out" }, { status: 409 });
    }

    // 4. Validation: User Already Purchased?
    // Check if user already holds an ACTIVE ticket
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        userId: userId,
        drawId: drawId,
        status: 'ACTIVE'
      }
    });

    if (existingTicket) {
      return NextResponse.json({ 
        success: false, 
        error: "You have already purchased a ticket for this draw." 
      }, { status: 409 });
    }

    // 5. Validation: Pending Payment Check (Idempotency)
    // If user clicked pay but closed window, let them resume the same payment ID.
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        userId: userId,
        drawId: drawId,
        status: 'PENDING'
      }
    });

    if (pendingPayment) {
      return new NextResponse(serializeBigInt({
        success: true,
        message: "Resuming existing pending payment",
        data: {
          paymentId: pendingPayment.id,
          amount: pendingPayment.amount,
          gateway: pendingPayment.gateway,
          // If you stored a Razorpay order ID previously, return it:
          // gatewayOrderId: pendingPayment.gatewayOrderId
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // ---------------------------------------------------------
    // GATEWAY INTEGRATION (Placeholder)
    // ---------------------------------------------------------
    // Here you would call Razorpay/Stripe API to create an Order.
    // const order = await razorpay.orders.create({ amount: draw.entryFee * 100, currency: "INR" });
    // const gatewayOrderId = order.id;
    const gatewayOrderId = `ORDER-${Date.now()}`; // Mock ID
    // ---------------------------------------------------------

    // 6. Create New Payment Record
    const newPayment = await prisma.payment.create({
      data: {
        userId: userId,
        drawId: drawId,
        amount: draw.entryFee,
        method: payment_method.UPI, // This is usually updated in the 'complete' step based on actual method used
        gateway: gateway,
        status: 'PENDING',
        gatewayOrderId: gatewayOrderId 
      }
    });

    // 7. Return Success
    return new NextResponse(serializeBigInt({ 
      success: true, 
      data: {
        paymentId: newPayment.id,
        amount: newPayment.amount,
        gatewayOrderId: newPayment.gatewayOrderId,
        currency: "INR" // or your specific currency
      } 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Purchase initiate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate purchase" }, 
      { status: 500 }
    );
  }
}