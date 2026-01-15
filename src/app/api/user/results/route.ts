// src/app/api/user/results/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { draw_status } from "@/generated/client/client";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUserId = BigInt(user.id);

    const draws = await prisma.draw.findMany({
      where: {
        status: draw_status.RESULT_DECLARED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        endTime: true,
        status: true,
        drawproduct: {
          select: {
            id: true,
            name: true,
            image: true,
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

    const formattedResults = draws.map((draw) => ({
      id: draw.id.toString(),
      title: draw.title,
      description: draw.description,
      endTime: draw.endTime.toISOString(),
      status: draw.status,
      products: draw.drawproduct.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        image: product.image,
        quantity: product.quantity,
        winners: product.winner.map((winner) => ({
          id: winner.id.toString(),
          ticketCode: winner.ticket.ticketCode,
          declaredAt: winner.declaredAt.toISOString(),
          winnerName: winner.ticket.user.name,
          isCurrentUser:
            winner.ticket.userId === currentUserId,
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    console.error("GET RESULTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}