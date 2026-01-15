import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const data = await prisma.draw.findMany({
    select: {
      id: true,
      title: true,
      entryFee: true,
      status: true,
      startTime: true,
      endTime: true,
      _count: {
        select: {
          // FIX: Use singular names to match your schema definition
          ticket: true,  
          payment: true, 
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: true,
    data: serializeBigInt(data),
  });
}