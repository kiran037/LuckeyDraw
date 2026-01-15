import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        drawproduct: true, // Prizes
        // Only fetch winners if declared
        winner: {
          include: {
            user: { select: { name: true, avatar: true } },
            drawproduct: { select: { name: true, image: true } }
          }
        }
      }
    });

    if (!draw) return errorResponse("Draw not found", 404);

    // 2. Count Sold Tickets
    const soldTickets = await prisma.ticket.count({
      where: { drawId: drawId, status: 'ACTIVE' }
    });

    // 3. Check User Status (Joined? Pending?)
    let hasJoined = false;
    let pendingPayment = false;

    if (sessionUser) {
      const userId = BigInt(sessionUser.id);
      
      // Check for Active Ticket
      const ticket = await prisma.ticket.findFirst({
        where: { drawId: drawId, userId: userId, status: 'ACTIVE' }
      });
      if (ticket) hasJoined = true;

      // Check for Pending Payment (if not joined yet)
      if (!hasJoined) {
        const payment = await prisma.payment.findFirst({
          where: { drawId: drawId, userId: userId, status: 'PENDING' }
        });
        if (payment) pendingPayment = true;
      }
    }

    // 4. Calculate Stats
    const total = draw.maxTickets;
    const progress = total > 0 ? Math.min(Math.round((soldTickets / total) * 100), 100) : 0;
    const isExpired = new Date() > new Date(draw.endTime);

    return jsonResponse({
      ...draw,
      stats: {
        sold: soldTickets,
        total: total,
        progress: progress,
        left: Math.max(0, total - soldTickets)
      },
      userStatus: {
        hasJoined,
        pendingPayment,
        isGuest: !sessionUser
      },
      isExpired
    });

  } catch (error) {
    console.error("GET DRAW DETAILS ERROR:", error);
    return errorResponse("Server error", 500);
  }
}