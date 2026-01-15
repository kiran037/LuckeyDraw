import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      mobile: true,
      createdAt: true,
      _count: {
        select: {
          tickets: true, // This is correct (Schema has: tickets ticket[])
          payment: true, // FIX: Changed 'payments' to 'payment' (Schema has: payment payment[])
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: true,
    data: serializeBigInt(users),
  });
}