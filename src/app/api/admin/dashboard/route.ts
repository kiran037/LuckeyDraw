///Users/xeoren/Desktop/draw/src/app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [users, draws, tickets, payments] = await Promise.all([
      prisma.user.count(),
      prisma.draw.count(),
      prisma.ticket.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "APPROVED" },
      }),
    ]);

    return NextResponse.json({
      users,
      draws,
      tickets,
      revenue: payments._sum.amount ?? 0,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return NextResponse.json(
      { message: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
