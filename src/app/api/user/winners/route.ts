// src/app/api/user/winners/route.ts
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils"; // Use the helpers we made

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    // Run queries in parallel for better performance
    const [winners, total] = await Promise.all([
      prisma.winner.findMany({
        skip,
        take: limit,
        orderBy: {
          declaredAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
              mobile: true,
            },
          },
          draw: {
            select: {
              title: true,
            },
          },
          drawproduct: {
            select: {
              name: true,
              image: true,
            },
          },
          ticket: {
            select: {
              ticketCode: true,
            },
          },
        },
      }),
      prisma.winner.count(),
    ]);

    // Transform data
    const formattedWinners = winners.map((w) => ({
      id: w.id, // jsonResponse will handle BigInt conversion automatically
      userName: w.user.name,
      userAvatar: w.user.avatar,
      // Mask mobile: 1234567890 -> ******7890
      maskedMobile: w.user.mobile.replace(/.(?=.{4})/g, "*"), 
      prizeName: w.drawproduct.name,
      prizeImage: w.drawproduct.image,
      drawTitle: w.draw.title,
      ticketCode: w.ticket.ticketCode,
      wonAt: w.declaredAt,
    }));

    return jsonResponse({
      winners: formattedWinners,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("GET WINNERS ERROR:", error);
    return errorResponse("Failed to fetch winners", 500);
  }
}