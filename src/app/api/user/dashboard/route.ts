// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  payment_status,
  draw_status,
} from "@/generated/client/client";

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
      totalTickets,
      winningTickets,
      totalSpentAgg,
      liveDrawsCount,
      recentWinners,
    ] = await Promise.all([
      // Total tickets purchased
      prisma.ticket.count({
        where: { userId },
      }),

      // Winning tickets
      prisma.ticket.count({
        where: {
          userId,
          isWinner: true,
        },
      }),

      // Total amount spent (approved payments only)
      prisma.payment.aggregate({
        where: {
          userId,
          status: payment_status.APPROVED,
        },
        _sum: {
          amount: true,
        },
      }),

      // Live draws count
      prisma.draw.count({
        where: {
          status: draw_status.LIVE,
        },
      }),

      // Recent winners (last 5)
      prisma.winner.findMany({
        take: 5,
        orderBy: {
          declaredAt: "desc",
        },
        include: {
          ticket: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              draw: {
                select: {
                  title: true,
                },
              },
            },
          },
          drawproduct: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const winRate =
      totalTickets > 0
        ? Number(((winningTickets / totalTickets) * 100).toFixed(1))
        : 0;

    const formattedWinners = recentWinners.map((winner) => ({
      id: winner.id.toString(),
      name: winner.ticket.user.name,
      prize: winner.drawproduct.name,
      drawTitle: winner.ticket.draw.title,
      winDate: winner.declaredAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTickets,
          winningTickets,
          totalSpent: totalSpentAgg._sum.amount ?? 0,
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