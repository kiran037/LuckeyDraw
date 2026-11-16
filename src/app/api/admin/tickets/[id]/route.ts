import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, ticket, ticket_status } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const foundTicket = await db.query.ticket.findFirst({
      where: eq(ticket.id, BigInt(id)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            avatar: true,
          },
        },
        draw: {
          columns: { id: true, title: true, status: true, bannerImage: true },
        },
        payment: true,
        winner: true,
      },
    });

    if (!foundTicket) return errorResponse("Ticket not found", 404);

    return jsonResponse({ ticket: foundTicket });
  } catch (err) {
    console.error("ADMIN GET TICKET ERROR:", err);
    return errorResponse("Server error", 500);
  }
}

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
      return errorResponse(
        "Valid status is required (ACTIVE, CANCELLED, REFUNDED)",
        400
      );
    }

    const newStatus = body.status as ticket_status;

    const existingTicket = await db.query.ticket.findFirst({
      where: eq(ticket.id, BigInt(id)),
      columns: { id: true, isWinner: true },
    });

    if (!existingTicket) return errorResponse("Ticket not found", 404);

    if (
      existingTicket.isWinner &&
      (newStatus === ticket_status.CANCELLED ||
        newStatus === ticket_status.REFUNDED)
    ) {
      return errorResponse(
        "Cannot cancel a winning ticket. Remove winner status first.",
        400
      );
    }

    const [updatedTicket] = await db
      .update(ticket)
      .set({ status: newStatus })
      .where(eq(ticket.id, BigInt(id)))
      .returning();

    return jsonResponse({
      success: true,
      message: "Ticket status updated",
      ticket: updatedTicket,
    });
  } catch (err) {
    console.error("ADMIN UPDATE TICKET ERROR:", err);
    return errorResponse("Failed to update ticket", 500);
  }
}
