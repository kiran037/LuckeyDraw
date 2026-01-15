import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params (Required in Next.js 15)
    const { id } = await params;
    
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    // 2. Validate ID format
    if (!id || isNaN(Number(id))) {
      return errorResponse("Invalid Ticket ID", 400);
    }

    const ticketId = BigInt(id);
    const userId = BigInt(user.id);

    // 3. Fetch Ticket with Relations
    const ticket = await prisma.ticket.findFirst({
      where: { 
        id: ticketId, 
        userId: userId // Security: Only fetch if it belongs to current user
      },
      include: {
        draw: {
          include: {
            drawproduct: true // Show prizes associated with the draw
          }
        },
        payment: true,
        winner: {
          include: {
            drawproduct: true // Show specific prize won (if any)
          }
        }
      }
    });

    if (!ticket) return errorResponse("Ticket not found", 404);

    return jsonResponse(ticket);

  } catch (error) {
    console.error("GET TICKET DETAIL ERROR:", error);
    return errorResponse("Server error", 500);
  }
}