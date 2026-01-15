import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch winners with all necessary relations
    const winners = await prisma.winner.findMany({
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
            mobile: true, // We will mask this in the response
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
    });

    const total = await prisma.winner.count();

    // Transform data (mask mobile, format dates)
    const formattedWinners = winners.map((w) => ({
      id: w.id,
      userName: w.user.name,
      userAvatar: w.user.avatar,
      // Mask mobile: ******1234
      maskedMobile: w.user.mobile.replace(/.(?=.{4})/g, "*"), 
      prizeName: w.drawproduct.name,
      prizeImage: w.drawproduct.image,
      drawTitle: w.draw.title,
      ticketCode: w.ticket.ticketCode,
      wonAt: w.declaredAt,
    }));

    return NextResponse.json({
      success: true,
      data: serializeBigInt({
        winners: formattedWinners,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      }),
    });
  } catch (error) {
    console.error("GET WINNERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch winners" },
      { status: 500 }
    );
  }
}