import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, walletTransaction } from "@/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const txs = await db.query.walletTransaction.findMany({
      where: eq(walletTransaction.userId, BigInt(user.id)),
      orderBy: [desc(walletTransaction.createdAt)],
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      data: txs.map((t) => ({
        id: t.id.toString(),
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        type: t.type,
        source: t.source,
        remark: t.remark,
        createdAt: t.createdAt,
      })),
    });
  } catch (e) {
    console.error("WALLET TX ERROR:", e);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
