import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: BigInt(user.id) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        method: true,
        createdAt: true,
        failureReason: true, // 👈 remark (reject case)
        draw: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: payments.map(p => ({
        id: p.id.toString(),
        amount: p.amount,
        status: p.status,
        method: p.method,
        drawTitle: p.draw?.title ?? "-",
        remark: p.failureReason ?? "—", // ✅ remark
        createdAt: p.createdAt
      }))
    });

  } catch (e) {
    console.error("PAYMENT TX ERROR:", e);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
