import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { 
  payment_status, 
  ticket_status, 
  ticket_source, 
  payment_method,
} from '@/generated/client/client';

export const dynamic = 'force-dynamic';

/**
 * Type-safe BigInt serializer for JSON response
 */
const serializeBigInt = (data: unknown): string => {
  return JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

/**
 * Generates a high-entropy unique ticket code.
 * Format: TKT-TIMESTAMP-RANDOM (e.g., TKT-1704460000-A1B2)
 * This drastically reduces collision probability.
 */
function generateTicketCode(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6); // Last 6 digits of timestamp
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();   // 6 chars hex
  return `TKT-${timestamp}-${random}`;
}

interface CompletePurchaseBody {
  paymentId: string | number;
  gatewayPaymentId: string;
  gatewaySignature?: string; // Essential for security in prod
}

export async function POST(request: Request) {
  try {
    const body: CompletePurchaseBody = await request.json();
    const { paymentId, gatewayPaymentId } = body;

    // ---------------------------------------------------------
    // AUTHENTICATION
    // ---------------------------------------------------------
    const currentUserId = BigInt(1); // MOCKED: Replace with actual session ID
    // ---------------------------------------------------------

    if (!paymentId || !gatewayPaymentId) {
      return NextResponse.json(
        { success: false, error: "Missing payment details" }, 
        { status: 400 }
      );
    }

    const pId = BigInt(paymentId);

    // 1. Fetch Payment (Read-only check first)
    const existingPayment = await prisma.payment.findUnique({
      where: { id: pId },
    });

    if (!existingPayment) {
      return NextResponse.json({ success: false, error: "Payment record not found" }, { status: 404 });
    }

    // 2. Security: Ownership Check
    if (existingPayment.userId !== currentUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized access to this payment" }, { status: 403 });
    }

    // 3. Security: Check if already processed
    // This prevents double-ticketing if the user refreshes the page
    if (existingPayment.status === payment_status.APPROVED) {
      // If already approved, attempt to find the existing ticket to return it
      const existingTicket = await prisma.ticket.findUnique({
        where: { paymentId: pId }
      });
      
      if (existingTicket) {
        return new NextResponse(serializeBigInt({ 
          success: true, 
          message: "Payment already processed",
          data: {
            ticketCode: existingTicket.ticketCode,
            ticketId: existingTicket.id
          }
        }), { headers: { 'Content-Type': 'application/json' }});
      }
    }

    // ---------------------------------------------------------
    // SECURITY: SIGNATURE VERIFICATION (CRITICAL)
    // ---------------------------------------------------------
    // In production, you verify that 'gatewayPaymentId' is valid using the signature.
    // Example for Razorpay:
    // const generatedSignature = hmac_sha256(order_id + "|" + payment_id, secret);
    // if (generatedSignature !== gatewaySignature) throw new Error("Invalid Signature");
    // ---------------------------------------------------------


    // 4. ATOMIC TRANSACTION
    // We update payment AND create ticket together. If one fails, both fail.
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Verify Status again inside Lock/Transaction to prevent race conditions
      const paymentToUpdate = await tx.payment.findUniqueOrThrow({
        where: { id: pId }
      });

      if (paymentToUpdate.status === payment_status.APPROVED) {
        throw new Error("ALREADY_PROCESSED");
      }

      // B. Update Payment Status to APPROVED
      const updatedPayment = await tx.payment.update({
        where: { id: pId },
        data: {
          status: payment_status.APPROVED,
          gatewayPaymentId: gatewayPaymentId,
          method: payment_method.UPI, // Or derive from gateway details
          updatedAt: new Date(),
        }
      });

      // C. Generate Unique Ticket Code with Retry Logic
      // We try to generate a code. In the highly unlikely event of a collision, we try once more.
      let ticketCode = generateTicketCode();
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 3) {
        // Check if exists
        const exists = await tx.ticket.findUnique({
          where: { ticketCode: ticketCode }
        });

        if (!exists) {
          isUnique = true;
        } else {
          ticketCode = generateTicketCode(); // Regenerate
          attempts++;
        }
      }

      if (!isUnique) {
        throw new Error("Failed to generate unique ticket code after multiple attempts");
      }

      // D. Create the Ticket
      const ticket = await tx.ticket.create({
        data: {
          ticketCode: ticketCode,
          userId: paymentToUpdate.userId,
          drawId: paymentToUpdate.drawId,
          paymentId: paymentToUpdate.id,
          pricePaid: paymentToUpdate.amount,
          status: ticket_status.ACTIVE,
          source: ticket_source.USER_PURCHASE,
          isWinner: false,
        }
      });

      return { payment: updatedPayment, ticket };
    });

    // 5. Return Success Response
    return new NextResponse(serializeBigInt({ 
      success: true, 
      message: "Purchase successful",
      data: {
        ticketCode: result.ticket.ticketCode,
        ticketId: result.ticket.id,
        drawId: result.ticket.drawId
      } 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error("Purchase completion error:", error);

    // Handle specific transaction errors
    if (error instanceof Error && error.message === "ALREADY_PROCESSED") {
      return NextResponse.json({ success: false, error: "Payment was already processed" }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to complete purchase transaction" }, 
      { status: 500 }
    );
  }
}