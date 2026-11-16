import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, user } from "@/db";

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(authUser.id);

    const referrals = await db.query.user.findMany({
      where: eq(user.referredById, userId),
      columns: {
        id: true,
        name: true,
        mobile: true,
        createdAt: true,
      },
      orderBy: [desc(user.createdAt)],
    });

    const safeData = referrals.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      mobile: u.mobile,
      joinedAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (err) {
    console.error("REFERRALS API ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
