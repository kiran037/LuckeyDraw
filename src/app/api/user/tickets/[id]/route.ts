import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, ticket } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    if (!id || isNaN(Number(id))) {
      return errorResponse("Invalid Ticket ID", 400);
    }

    const ticketId = BigInt(id);
    const userId = BigInt(user.id);

    const foundTicket = await db.query.ticket.findFirst({
      where: and(eq(ticket.id, ticketId), eq(ticket.userId, userId)),
      with: {
        draw: {
          with: {
            drawproducts: true,
          },
        },
        payment: true,
        winner: {
          with: {
            drawproduct: true,
          },
        },
      },
    });

    if (!foundTicket) return errorResponse("Ticket not found", 404);

    return jsonResponse({
      ...foundTicket,
      draw: foundTicket.draw
        ? {
            ...foundTicket.draw,
            drawproduct: foundTicket.draw.drawproducts,
          }
        : null,
    });
  } catch (error) {
    console.error("GET TICKET DETAIL ERROR:", error);
    return errorResponse("Server error", 500);
  }
}
