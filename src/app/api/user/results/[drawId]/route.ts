import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { draw_status } from "@/generated/client/client"; // Adjusted import path based on common patterns, ensure this matches your generated path

export async function GET(
  _req: Request,
  // 1. UPDATE TYPE: params is now a Promise
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. AWAIT PARAMS: specific to Next.js 15+
    const resolvedParams = await params;
    const drawId = resolvedParams.drawId;

    if (!drawId || isNaN(Number(drawId))) {
      return NextResponse.json(
        { success: false, message: "Invalid draw id" },
        { status: 400 }
      );
    }

    const currentUserId = BigInt(user.id);

    const draw = await prisma.draw.findFirst({
      where: {
        id: BigInt(drawId),
        status: draw_status.RESULT_DECLARED,
      },
      select: {
        id: true,
        title: true,
        description: true,
        entryFee: true,
        endTime: true,
        _count: {
          select: {
            ticket: true,
          },
        },
        drawproduct: {
          select: {
            id: true,
            name: true,
            image: true,
            description: true,
            quantity: true,
            winner: {
              select: {
                id: true,
                declaredAt: true,
                ticket: {
                  select: {
                    ticketCode: true,
                    userId: true,
                    user: {
                      select: {
                        name: true,
                        mobile: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!draw) {
      return NextResponse.json(
        {
          success: false,
          message: "Draw not found or results not yet declared",
        },
        { status: 404 }
      );
    }

    const formattedResult = {
      id: draw.id.toString(),
      title: draw.title,
      description: draw.description,
      entryFee: draw.entryFee,
      endTime: draw.endTime.toISOString(),
      totalTickets: draw._count.ticket,
      products: draw.drawproduct.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        image: product.image,
        description: product.description,
        quantity: product.quantity,
        winners: product.winner.map((winner) => ({
          id: winner.id.toString(),
          ticketCode: winner.ticket.ticketCode,
          declaredAt: winner.declaredAt.toISOString(),
          winnerName: winner.ticket.user.name,
          winnerMobile: winner.ticket.user.mobile,
          isCurrentUser: winner.ticket.userId === currentUserId,
        })),
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedResult,
    });
  } catch (error) {
    console.error("GET DRAW RESULT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}