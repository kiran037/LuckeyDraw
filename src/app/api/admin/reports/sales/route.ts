///Users/xeoren/Desktop/draw/src/app/api/admin/reports/sales/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const payments = await prisma.payment.findMany({
    where: { status: "APPROVED" },
    include: {
      user: true,
      draw: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalAmount = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return NextResponse.json({
    status: true,
    totalAmount,
    data: serializeBigInt(payments),
  });
}
