import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const draws = await prisma.draw.findMany({
    include: {
      // FIX 1: 'products' -> 'drawproduct' (matches schema)
      drawproduct: {
        include: {
          // FIX 2: 'winners' -> 'winner' (matches schema)
          winner: {
            include: {
              ticket: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: true,
    data: serializeBigInt(draws),
  });
}