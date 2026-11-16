import { count, eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, draw, ticket, payment, payment_status } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const drawId = BigInt(id);
    const sessionUser = await getCurrentUser();

    // 1. Fetch Draw Info
    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, drawId),
      with: {
        drawproducts: true,
        winners: {
          with: {
            user: { columns: { name: true, avatar: true } },
            drawproduct: { columns: { name: true, image: true } },
          },
        },
      },
    });

    if (!foundDraw) return errorResponse("Draw not found", 404);

    // 2. Count Sold Tickets
    const soldTicketsRes = await db
      .select({ count: count() })
      .from(ticket)
      .where(and(eq(ticket.drawId, drawId), eq(ticket.status, "ACTIVE")));

    const soldTickets = Number(soldTicketsRes[0]?.count ?? 0);

    // 3. Check User Status (Joined? Pending?)
    let hasJoined = false;
    let pendingPayment = false;

    if (sessionUser) {
      const userId = BigInt(sessionUser.id);

      const foundTicket = await db.query.ticket.findFirst({
        where: and(
          eq(ticket.drawId, drawId),
          eq(ticket.userId, userId),
          eq(ticket.status, "ACTIVE")
        ),
      });
      if (foundTicket) hasJoined = true;

      if (!hasJoined) {
        const foundPayment = await db.query.payment.findFirst({
          where: and(
            eq(payment.drawId, drawId),
            eq(payment.userId, userId),
            eq(payment.status, payment_status.PENDING)
          ),
        });
        if (foundPayment) pendingPayment = true;
      }
    }

    // 4. Calculate Stats
    const total = foundDraw.maxTickets;
    const progress =
      total > 0 ? Math.min(Math.round((soldTickets / total) * 100), 100) : 0;
    const isExpired = new Date() > new Date(foundDraw.endTime);

    return jsonResponse({
      ...foundDraw,
      drawproduct: foundDraw.drawproducts || [],
      winner: foundDraw.winners || [],
      stats: {
        sold: soldTickets,
        total: total,
        progress: progress,
        left: Math.max(0, total - soldTickets),
      },
      userStatus: {
        hasJoined,
        pendingPayment,
        isGuest: !sessionUser,
      },
      isExpired,
    });
  } catch (error) {
    console.error("GET DRAW DETAILS ERROR:", error);
    return errorResponse("Server error", 500);
  }
}
