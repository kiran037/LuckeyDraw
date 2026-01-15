import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { payment_status, ticket_status, ticket_source, Prisma } from "@/generated/client/client";

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

    // Validate Status
    if (newStatus !== payment_status.APPROVED && newStatus !== payment_status.REJECTED) {
      return errorResponse("Invalid status. Must be APPROVED or REJECTED.", 400);
    }

    // 1. Fetch existing payment AND related Draw details
    const payment = await prisma.payment.findUnique({
      where: { id: BigInt(id) },
      include: {
        draw: { 
          select: { 
            id: true, 
            entryFee: true, 
            maxTickets: true, 
            _count: { select: { ticket: true } } 
          } 
        }
      }
    });

    if (!payment) return errorResponse("Payment not found", 404);

    // 2. Prevent double processing
    if (payment.status !== payment_status.PENDING) {
      return errorResponse(`Payment is already ${payment.status}`, 400);
    }

    // =================================================
    // LOGIC: REJECT
    // =================================================
    if (newStatus === payment_status.REJECTED) {
      const rejected = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: payment_status.REJECTED,
          failureReason: remark || "Rejected by Admin"
        }
      });

      // Audit Log
      await prisma.auditlog.create({
        data: {
          action: "PAYMENT_REJECTED",
          entity: "PAYMENT",
          entityId: payment.id,
          adminId: BigInt(admin.id),
          meta: JSON.stringify({ remark }),
        },
      });

      return jsonResponse({ success: true, message: "Payment Rejected", payment: rejected });
    }

    // =================================================
    // LOGIC: APPROVE (Generate Tickets)
    // =================================================
    
    // 3. Calculate Ticket Count
    const entryFee = payment.draw.entryFee;
    let ticketCount = 0;

    if (entryFee > 0) {
      ticketCount = Math.floor(payment.amount / entryFee);
    } else {
      return errorResponse("Cannot process payment for free draw via this route", 400);
    }

    if (ticketCount < 1) {
      return errorResponse(`Amount ${payment.amount} is less than entry fee ${entryFee}`, 400);
    }

    // 4. Check Ticket Availability
    const currentSold = payment.draw._count.ticket;
    const maxTickets = payment.draw.maxTickets;

    if (currentSold + ticketCount > maxTickets) {
      return errorResponse(`Not enough tickets left. Requested: ${ticketCount}, Remaining: ${maxTickets - currentSold}`, 400);
    }

    // 5. Generate Ticket Data
    // FIX: Using lowercase 'ticket' as suggested by your error message
    const ticketsData: Prisma.ticketUncheckedCreateInput[] = []; 
    const timestamp = Date.now();

    for (let i = 0; i < ticketCount; i++) {
      ticketsData.push({
        ticketCode: `T-${payment.draw.id}-${timestamp}-${i}-${Math.floor(Math.random() * 1000)}`,
        userId: payment.userId,
        drawId: payment.drawId,
        pricePaid: entryFee,
        status: ticket_status.ACTIVE,
        source: ticket_source.USER_PURCHASE,
        // Only link paymentId to the first ticket (i === 0)
        paymentId: i === 0 ? payment.id : null, 
      });
    }

    // 6. Execute Transaction
    await prisma.$transaction(async (tx) => {
      // A. Update Payment
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: payment_status.APPROVED }
      });

      // B. Create Tickets
      const [firstTicket, ...restTickets] = ticketsData;

      // Create first ticket (linked to payment)
      await tx.ticket.create({ data: firstTicket });

      // Create remaining tickets (if any)
      if (restTickets.length > 0) {
        await tx.ticket.createMany({ data: restTickets });
      }

      // C. Audit Log
      await tx.auditlog.create({
        data: {
          action: "PAYMENT_APPROVED",
          entity: "PAYMENT",
          entityId: payment.id,
          adminId: BigInt(admin.id),
          meta: JSON.stringify({ 
            ticketsGenerated: ticketCount, 
            remark 
          }),
        },
      });
    });

    return jsonResponse({
      success: true,
      message: `Payment Approved. ${ticketCount} tickets generated.`,
    });

  } catch (err) {
    console.error("ADMIN UPDATE PAYMENT ERROR:", err);
    return errorResponse("Failed to update payment", 500);
  }
}