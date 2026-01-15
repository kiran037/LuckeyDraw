///Users/xeoren/Desktop/draw/src/app/api/admin/tickets/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    include: {
      user: true,
      draw: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: true,
    data: serializeBigInt(tickets),
  });
}
