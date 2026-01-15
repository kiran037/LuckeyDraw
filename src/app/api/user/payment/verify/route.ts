import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from 'nanoid'; // You might need to install: npm i nanoid

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { paymentId, gatewayPaymentId } = body;
    const userId = BigInt(sessionUser.id);

    // Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Payment
      const payment = await tx.payment.findUnique({
        where: { id: BigInt(paymentId) },
        include: { draw: true }
      });

      if (!payment) throw new Error("Payment not found");
      if (payment.status === 'APPROVED') throw new Error("Payment already processed");
      if (payment.userId !== userId) throw new Error("Invalid user");

      // 2. DOUBLE CHECK Availability (Race condition protection)
      const currentSold = await tx.ticket.count({
        where: { drawId: payment.drawId, status: 'ACTIVE' }
      });

      if (currentSold >= payment.draw.maxTickets) {
        // If sold out during payment, Mark payment as REJECTED/REFUND_NEEDED
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'REJECTED', failureReason: 'Sold out during processing' }
        });
        throw new Error("Draw sold out just now. Amount will be refunded.");
      }

      // 3. Update Payment to Approved
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          gatewayPaymentId: gatewayPaymentId || `PAY_${Date.now()}` // Mock ID if manual
        }
      });

      // 4. Generate Unique Ticket Code
      const ticketCode = `T-${payment.draw.title.substring(0,3).toUpperCase()}-${nanoid(6).toUpperCase()}`;

      // 5. Create Ticket
      const ticket = await tx.ticket.create({
        data: {
          userId,
          drawId: payment.drawId,
          paymentId: payment.id,
          ticketCode: ticketCode,
          pricePaid: payment.amount,
          status: 'ACTIVE',
          source: 'USER_PURCHASE'
        }
      });

      return ticket;
    });

    return NextResponse.json({
      success: true,
      data: {
        ticketId: result.id.toString(),
        ticketCode: result.ticketCode
      }
    });

  } catch (error: unknown) { // FIX: Use 'unknown' instead of 'any'
    console.error("Payment Verification Error:", error);
    
    // FIX: Type Guard to safely extract message
    const errorMessage = error instanceof Error ? error.message : "Payment verification failed";

    return NextResponse.json({ 
      success: false, 
      message: errorMessage
    }, { status: 400 });
  }
}