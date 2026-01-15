// src/app/api/user/draws/route.ts

import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
// 1. Add 'Prisma' to the imports here 👇
import { Prisma, draw_status } from '@/generated/client/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'live'; 
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
    const skip = (page - 1) * limit;

    const now = new Date();

    // 2. Change 'any' to 'Prisma.drawWhereInput' 👇
    let whereClause: Prisma.drawWhereInput = {};

    // --- Tab Logic ---
    if (tab === 'live') {
      whereClause = {
        status: draw_status.LIVE,
        startTime: { lte: now },
        endTime: { gt: now },
      };
    } else if (tab === 'upcoming') {
      whereClause = {
        status: draw_status.LIVE,
        startTime: { gt: now },
      };
    } else if (tab === 'closed') {
      whereClause = {
        OR: [
          { status: { in: [draw_status.CLOSED, draw_status.RESULT_DECLARED] } },
          { endTime: { lte: now } }
        ]
      };
    }

    // --- Parallel Fetching ---
    const [draws, total] = await Promise.all([
      prisma.draw.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { startTime: tab === 'upcoming' ? 'asc' : 'desc' },
        select: {
          id: true,
          title: true,
          bannerImage: true,
          entryFee: true,
          startTime: true,
          endTime: true,
          status: true,
          maxTickets: true,
          resultAt: true,
          _count: {
            select: { ticket: { where: { status: 'ACTIVE' } } }
          },
          drawproduct: {
            take: 1,
            select: { name: true, image: true }
          }
        }
      }),
      prisma.draw.count({ where: whereClause })
    ]);

    // --- Format Data ---
    const formattedDraws = draws.map((draw) => {
      const sold = draw._count.ticket;
      const total = draw.maxTickets || 1;
      const progress = Math.min(Math.round((sold / total) * 100), 100);

      return {
        ...draw,
        stats: { sold, total, progress }
      };
    });

    return jsonResponse({
      draws: formattedDraws,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    console.error("GET DRAWS ERROR:", error);
    return errorResponse("Failed to fetch draws", 500);
  }
}