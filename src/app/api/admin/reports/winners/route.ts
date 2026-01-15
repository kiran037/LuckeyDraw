///Users/xeoren/Desktop/draw/src/app/api/admin/reports/winners/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const draws = await prisma.draw.findMany({
    include: {
      products: {
        include: {
          winners: {
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
