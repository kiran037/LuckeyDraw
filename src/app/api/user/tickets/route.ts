import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

// Keep your generated client imports
import { 
  payment_status, 
  payment_method, 
  payment_gateway, 
  ticket_status, 
  Prisma 
} from "@/generated/client/client";

/* =========================
   GET — User's tickets
========================= */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    
    // Validate status enum safely
    let status: ticket_status | undefined;
    if (statusParam && Object.values(ticket_status).includes(statusParam as ticket_status)) {
      status = statusParam as ticket_status;
    }

    // Build Where Clause
    const whereClause: Prisma.ticketWhereInput = { 
      userId: BigInt(user.id),
      ...(status ? { status } : {}) 
    };

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        draw: {
          select: {
            id: true,
            title: true,
            status: true,
            endTime: true,
            resultAt: true,
          }
        },
        payment: {
          select: {
            amount: true,
            status: true,
            method: true
          }
        }
      }
    });

    return jsonResponse(tickets);

  } catch (error) {
    console.error("GET USER TICKETS ERROR:", error);
    return errorResponse("Server error", 500);
  }
}

/* =========================
   POST — Submit payment (Requesting a Ticket)
========================= */
interface TicketRequestBody {
  drawId?: string | number;
  transactionId?: string;
  screenshot?: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body: TicketRequestBody = await req.json();
    const { drawId, transactionId, screenshot } = body;

    if (!drawId || !transactionId || !screenshot) {
      return errorResponse("Missing required fields (drawId, transactionId, screenshot)", 400);
    }

    const drawBigInt = BigInt(drawId);
    
    // 1. Validate Draw
    const draw = await prisma.draw.findUnique({
      where: { id: drawBigInt },
      select: { id: true, entryFee: true, status: true, endTime: true }
    });

    if (!draw) return errorResponse("Draw not found", 404);
    if (draw.status !== 'LIVE') return errorResponse("Draw is not live", 400);
    if (new Date() > draw.endTime) return errorResponse("Draw has ended", 400);

    // 2. Prevent Double Spend (Check if Transaction ID exists)
    const existing = await prisma.payment.findUnique({ 
      where: { transactionId } 
    });
    
    if (existing) return errorResponse("This Transaction ID has already been used", 409);

    // 3. Create Payment Record
    // Note: We do NOT create a Ticket yet. The Admin must approve the payment first.
    // Once approved, the Admin System should generate the Ticket.
    const payment = await prisma.payment.create({
      data: {
        userId: BigInt(user.id),
        drawId: drawBigInt,
        amount: draw.entryFee,
        transactionId,
        screenshot,
        status: payment_status.PENDING,
        method: payment_method.UPI,
        gateway: payment_gateway.MANUAL,
      }
    });

    return jsonResponse({
      message: "Payment submitted successfully! Ticket will be generated upon approval.",
      payment
    }, 201);

  } catch (error) {
    console.error("POST PAYMENT ERROR:", error);
    return errorResponse("Server error", 500);
  }
}