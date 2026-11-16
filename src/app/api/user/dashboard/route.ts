import { NextResponse } from "next/server";
import { count, sum, eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  db,
  ticket,
  payment,
  draw,
  winner,
  payment_status,
  draw_status,
} from "@/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(user.id);

    const [
      totalTicketsRes,
      winningTicketsRes,
      totalSpentRes,
      liveDrawsRes,
      recentWinners,
    ] = await Promise.all([
      db.select({ count: count() }).from(ticket).where(eq(ticket.userId, userId)),
      db
        .select({ count: count() })
        .from(ticket)
        .where(and(eq(ticket.userId, userId), eq(ticket.isWinner, true))),
      db
        .select({ total: sum(payment.amount) })
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            eq(payment.status, payment_status.APPROVED)
          )
        ),
      db
        .select({ count: count() })
        .from(draw)
        .where(eq(draw.status, draw_status.LIVE)),
      db.query.winner.findMany({
        limit: 5,
        orderBy: [desc(winner.declaredAt)],
        with: {
          ticket: {
            with: {
              user: { columns: { name: true } },
              draw: { columns: { title: true } },
            },
          },
          drawproduct: { columns: { name: true } },
        },
      }),
    ]);

    const totalTickets = Number(totalTicketsRes[0]?.count ?? 0);
    const winningTickets = Number(winningTicketsRes[0]?.count ?? 0);
    const totalSpent = Number(totalSpentRes[0]?.total ?? 0);
    const liveDrawsCount = Number(liveDrawsRes[0]?.count ?? 0);

    const winRate =
      totalTickets > 0
        ? Number(((winningTickets / totalTickets) * 100).toFixed(1))
        : 0;

    const formattedWinners = recentWinners.map((w) => ({
      id: w.id.toString(),
      name: w.ticket?.user?.name || "Unknown",
      prize: w.drawproduct?.name || "Prize",
      drawTitle: w.ticket?.draw?.title || "Draw",
      winDate: new Date(w.declaredAt).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTickets,
          winningTickets,
          totalSpent,
          liveDrawsCount,
          winRate,
        },
        recentWinners: formattedWinners,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
