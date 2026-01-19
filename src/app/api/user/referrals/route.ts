import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const referrals = await prisma.user.findMany({
      where: {
        referredById: userId,
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeData = referrals.map(u => ({
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
