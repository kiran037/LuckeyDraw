import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { draw_status } from "@/generated/client/client"; // Correct Import

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
    const [activeDrawsCount, totalWinnersCount] = await Promise.all([
      prisma.draw.count({
        where: {
          status: draw_status.LIVE,
          startTime: { lte: now },
          endTime: { gte: now },
        },
      }),
      prisma.winner.count(),
    ]);

    // 2. Calculate Total Prize Pool (Efficient)
    const allDrawsForPool = await prisma.draw.findMany({
      where: { status: { not: draw_status.DRAFT } },
      select: { entryFee: true, maxTickets: true },
    });

    const totalPrizePool = allDrawsForPool.reduce(
      (sum, draw) => sum + (draw.entryFee * draw.maxTickets),
      0
    );

    // 3. Get Live Draws
    const liveDraws = await prisma.draw.findMany({
      where: {
        status: draw_status.LIVE,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      take: 5,
      orderBy: { endTime: "asc" },
      include: {
        drawproduct: { select: { id: true, name: true, image: true, quantity: true } },
        _count: { select: { ticket: true } },
      },
    });

    // 4. Get Recent Winners
    const recentWinners = await prisma.winner.findMany({
      take: 5,
      orderBy: { declaredAt: "desc" },
      include: {
        user: { select: { name: true, avatar: true } },
        draw: { select: { title: true } },
        drawproduct: { select: { name: true } },
      },
    });

    // 5. User Specific Data
    let userTicketsCount = 0;
    let userTickets: UserTicketData[] = [];

    if (user) {
        const userIdBigInt = BigInt(user.id);
        
        const [count, tickets] = await Promise.all([
            prisma.ticket.count({ where: { userId: userIdBigInt } }),
            prisma.ticket.findMany({
                where: { userId: userIdBigInt },
                take: 3,
                orderBy: { createdAt: "desc" },
                include: {
                  draw: {
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      status: true,
                      bannerImage: true,
                      endTime: true,
                      resultAt: true,
                      drawproduct: {
                        select: { id: true, name: true, image: true },
                        take: 1, // Only fetch one for thumbnail
                      },
                    },
                  },
                  payment: {
                    select: { id: true, amount: true, status: true },
                  },
                },
            })
        ]);

        userTicketsCount = count;

        userTickets = tickets.map((ticket) => ({
            id: ticket.id.toString(),
            ticketCode: ticket.ticketCode,
            isWinner: ticket.isWinner,
            status: ticket.status,
            createdAt: ticket.createdAt.toISOString(),
            draw: ticket.draw
              ? {
                  id: ticket.draw.id.toString(),
                  title: ticket.draw.title,
                  status: ticket.draw.status,
                  bannerImage: ticket.draw.bannerImage,
                  endTime: ticket.draw.endTime.toISOString(),
                  resultAt: ticket.draw.resultAt?.toISOString(),
                  // Safe access
                  productImage: ticket.draw.drawproduct[0]?.image || null,
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
        liveDraws: liveDraws.map((draw) => ({
          id: draw.id.toString(),
          title: draw.title,
          description: draw.description,
          bannerImage: draw.bannerImage,
          entryFee: draw.entryFee,
          startTime: draw.startTime.toISOString(),
          endTime: draw.endTime.toISOString(),
          maxTickets: draw.maxTickets,
          status: draw.status,
          ticketCount: draw._count.ticket,
          products: draw.drawproduct.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            image: p.image,
            quantity: p.quantity,
          })),
        })),
        userTickets,
        recentWinners: recentWinners.map((winner) => ({
          id: winner.id.toString(),
          userName: winner.user.name,
          userAvatar: winner.user.avatar,
          drawTitle: winner.draw.title,
          productName: winner.drawproduct.name,
          declaredAt: winner.declaredAt.toISOString(),
        })),
        isLoggedIn: !!user,
      },
    });
  } catch (error) {
    console.error("GET HOME DATA ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}