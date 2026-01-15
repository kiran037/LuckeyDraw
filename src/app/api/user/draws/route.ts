import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, draw_status } from '@/generated/client/client';

// Force dynamic because we rely on 'new Date()' for filtering
export const dynamic = 'force-dynamic';

/**
 * Helper to handle BigInt serialization for JSON response.
 * Uses 'unknown' instead of 'any' to satisfy strict linting.
 */
const serializeBigInt = (data: unknown): string => {
  return JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query Parameters
    const tab = searchParams.get('tab') || 'live'; // 'live' | 'upcoming' | 'closed'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const now = new Date();

    // Initialize typed WhereInput
    let whereClause: Prisma.drawWhereInput = {};

    // 1. Define Logic for Tabs
    switch (tab) {
      case 'live':
        whereClause = {
          status: draw_status.LIVE,
          startTime: { lte: now }, // Started in the past
          endTime: { gt: now },    // Ends in the future
        };
        break;

      case 'upcoming':
        whereClause = {
          status: draw_status.LIVE, // Only show published draws
          startTime: { gt: now },   // Starts in the future
        };
        break;

      case 'closed':
        whereClause = {
          OR: [
            { status: { in: [draw_status.CLOSED, draw_status.RESULT_DECLARED] } },
            { endTime: { lte: now } } // Expired time also counts as closed for users
          ]
        };
        break;

      default:
        // Fallback to live
        whereClause = {
          status: draw_status.LIVE,
          startTime: { lte: now },
          endTime: { gt: now },
        };
    }

    // 2. Database Transaction to get Data + Total Count (for pagination)
    const [draws, totalCount] = await prisma.$transaction([
      prisma.draw.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          // For upcoming, show nearest start time first. For others, show newest created/started.
          startTime: tab === 'upcoming' ? 'asc' : 'desc',
        },
        select: {
          id: true,
          title: true,
          bannerImage: true, // Main card image
          entryFee: true,
          startTime: true,
          endTime: true,
          status: true,
          maxTickets: true, // Needed to calculate % sold
          resultAt: true,   // Needed for closed tab
          _count: {
            select: { 
              ticket: {
                 where: { status: 'ACTIVE' } // Only count active tickets
              } 
            }
          },
          // Fetch the first product to show "Win a [Product Name]" on the card
          drawproduct: {
            take: 1,
            select: {
              name: true,
              image: true,
            }
          }
        }
      }),
      prisma.draw.count({ where: whereClause })
    ]);

    // 3. Format Response
    // We calculate a 'progress' percentage for the frontend to easily use
    const formattedDraws = draws.map((draw) => {
      const ticketsSold = draw._count.ticket;
      const totalTickets = draw.maxTickets || 1; // prevent divide by zero
      const progressPercentage = Math.min(Math.round((ticketsSold / totalTickets) * 100), 100);

      return {
        ...draw,
        stats: {
          sold: ticketsSold,
          total: totalTickets,
          percentage: progressPercentage
        }
      };
    });

    const responseData = {
      success: true,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      data: formattedDraws,
    };

    // 4. Return serialized JSON (handling BigInt)
    return new NextResponse(serializeBigInt(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error fetching ${request.url}:`, error);
    
    // Return a generic error message to client, log specific error on server
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}