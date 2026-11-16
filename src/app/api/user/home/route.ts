import { NextResponse } from "next/server";
import { count, eq, lte, gte, ne, and, asc, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, draw, winner, ticket, draw_status } from "@/db";

type UserTicketData = {
  id: string;
  ticketCode: string;
  isWinner: boolean;
  status: string;
  createdAt: string;
  draw: {
    id: string;
    title: string;
    status: string;
    bannerImage: string | null;
    endTime: string;
    resultAt?: string;
    productImage: string | null;
  } | null;
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    const now = new Date();

    // 1. Run lightweight Count queries
    const [activeDrawsRes, totalWinnersRes] = await Promise.all([
      db
        .select({ count: count() })
        .from(draw)
        .where(
          and(
            eq(draw.status, draw_status.LIVE),
            lte(draw.startTime, now),
            gte(draw.endTime, now)
          )
        ),
      db.select({ count: count() }).from(winner),
    ]);

    const activeDrawsCount = Number(activeDrawsRes[0]?.count ?? 0);
    const totalWinnersCount = Number(totalWinnersRes[0]?.count ?? 0);

    // 2. Calculate Total Prize Pool
    const allDrawsForPool = await db.query.draw.findMany({
      where: ne(draw.status, draw_status.DRAFT),
      columns: { entryFee: true, maxTickets: true },
    });

    const totalPrizePool = allDrawsForPool.reduce(
      (sum, d) => sum + d.entryFee * d.maxTickets,
      0
    );

    // 3. Get Live Draws
    const liveDraws = await db.query.draw.findMany({
      where: and(
        eq(draw.status, draw_status.LIVE),
        lte(draw.startTime, now),
        gte(draw.endTime, now)
      ),
      limit: 5,
      orderBy: [asc(draw.endTime)],
      with: {
        drawproducts: {
          columns: { id: true, name: true, image: true, quantity: true },
        },
        tickets: { columns: { id: true } },
      },
    });

    // 4. Get Recent Winners
    const recentWinners = await db.query.winner.findMany({
      limit: 5,
      orderBy: [desc(winner.declaredAt)],
      with: {
        user: { columns: { name: true, avatar: true } },
        draw: { columns: { title: true } },
        drawproduct: { columns: { name: true } },
      },
    });

    // 5. User Specific Data
    let userTicketsCount = 0;
    let userTickets: UserTicketData[] = [];

    if (user) {
      const userIdBigInt = BigInt(user.id);

      const [countRes, tickets] = await Promise.all([
        db
          .select({ count: count() })
          .from(ticket)
          .where(eq(ticket.userId, userIdBigInt)),
        db.query.ticket.findMany({
          where: eq(ticket.userId, userIdBigInt),
          limit: 3,
          orderBy: [desc(ticket.createdAt)],
          with: {
            draw: {
              columns: {
                id: true,
                title: true,
                description: true,
                status: true,
                bannerImage: true,
                endTime: true,
                resultAt: true,
              },
              with: {
                drawproducts: {
                  columns: { id: true, name: true, image: true },
                  limit: 1,
                },
              },
            },
            payment: {
              columns: { id: true, amount: true, status: true },
            },
          },
        }),
      ]);

      userTicketsCount = Number(countRes[0]?.count ?? 0);

      userTickets = tickets.map((t) => ({
        id: t.id.toString(),
        ticketCode: t.ticketCode,
        isWinner: t.isWinner,
        status: t.status,
        createdAt: new Date(t.createdAt).toISOString(),
        draw: t.draw
          ? {
              id: t.draw.id.toString(),
              title: t.draw.title,
              status: t.draw.status,
              bannerImage: t.draw.bannerImage,
              endTime: new Date(t.draw.endTime).toISOString(),
              resultAt: t.draw.resultAt
                ? new Date(t.draw.resultAt).toISOString()
                : undefined,
              productImage: t.draw.drawproducts?.[0]?.image || null,
            }
          : null,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeDraws: activeDrawsCount,
          totalPrizePool,
          happyWinners: totalWinnersCount,
          userTickets: user ? userTicketsCount : undefined,
        },
        liveDraws: liveDraws.map((d) => ({
          id: d.id.toString(),
          title: d.title,
          description: d.description,
          bannerImage: d.bannerImage,
          entryFee: d.entryFee,
          startTime: new Date(d.startTime).toISOString(),
          endTime: new Date(d.endTime).toISOString(),
          maxTickets: d.maxTickets,
          status: d.status,
          ticketCount: (d.tickets || []).length,
          products: (d.drawproducts || []).map((p) => ({
            id: p.id.toString(),
            name: p.name,
            image: p.image,
            quantity: p.quantity,
          })),
        })),
        userTickets,
        recentWinners: recentWinners.map((w) => ({
          id: w.id.toString(),
          userName: w.user.name,
          userAvatar: w.user.avatar,
          drawTitle: w.draw.title,
          productName: w.drawproduct.name,
          declaredAt: new Date(w.declaredAt).toISOString(),
        })),
        isLoggedIn: !!user,
      },
    });
  } catch (error) {
    console.error("GET HOME DATA ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
