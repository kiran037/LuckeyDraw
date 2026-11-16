import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, payment } from "@/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payments = await db.query.payment.findMany({
      where: eq(payment.userId, BigInt(user.id)),
      orderBy: [desc(payment.createdAt)],
      columns: {
        id: true,
        amount: true,
        status: true,
        method: true,
        createdAt: true,
        failureReason: true,
      },
      with: {
        draw: {
          columns: { title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: payments.map((p) => ({
        id: p.id.toString(),
        amount: p.amount,
        status: p.status,
        method: p.method,
        drawTitle: p.draw?.title ?? "-",
        remark: p.failureReason ?? "—",
        createdAt: p.createdAt,
      })),
    });
  } catch (e) {
    console.error("PAYMENT TX ERROR:", e);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
