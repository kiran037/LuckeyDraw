///Users/xeoren/Desktop/draw/src/app/api/admin/payments/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const payments = await prisma.payment.findMany({
    where: { status: "PENDING" },
    include: {
      user: true,
      draw: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: true,
    data: serializeBigInt(payments),
  });
}
