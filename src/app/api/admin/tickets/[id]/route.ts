import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { ticket_status } from "@/generated/client/client";

/* =========================
   GET — Single Ticket Details
========================= */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true, mobile: true, avatar: true }
        },
        draw: {
          select: { id: true, title: true, status: true, bannerImage: true }
        },
        payment: true,
        winner: true // Check if this ticket won anything
      }
    });

    if (!ticket) return errorResponse("Ticket not found", 404);

    return jsonResponse({ ticket });

  } catch (err) {
    console.error("ADMIN GET TICKET ERROR:", err);
    return errorResponse("Server error", 500);
  }
}

/* =========================
   PUT — Update Ticket Status
   Usage: Cancel or Refund ticket
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

    if (!body.status || !Object.values(ticket_status).includes(body.status)) {
      return errorResponse("Valid status is required (ACTIVE, CANCELLED, REFUNDED)", 400);
    }

    const newStatus = body.status as ticket_status;

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, isWinner: true }
    });

    if (!ticket) return errorResponse("Ticket not found", 404);

    // Prevent cancelling if it's already a winner (unless specifically intended)
    if (ticket.isWinner && (newStatus === ticket_status.CANCELLED || newStatus === ticket_status.REFUNDED)) {
      // You might want to allow this but with a warning. For now, let's block it or just proceed.
      // Logic: If we refund a winner, we should probably delete the 'winner' record too.
      // For safety, let's return a warning.
      return errorResponse("Cannot cancel a winning ticket. Remove winner status first.", 400);
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: BigInt(id) },
      data: {
        status: newStatus,
      },
    });

    return jsonResponse({
      success: true,
      message: "Ticket status updated",
      ticket: updatedTicket
    });

  } catch (err) {
    console.error("ADMIN UPDATE TICKET ERROR:", err);
    return errorResponse("Failed to update ticket", 500);
  }
}