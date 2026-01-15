import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(sessionUser.id);

    const [
      totalTickets,
      winningTickets,
      unreadNotifications,
      dbUser,
    ] = await Promise.all([
      prisma.ticket.count({
        where: { userId },
      }),

      prisma.ticket.count({
        where: {
          userId,
          isWinner: true,
        },
      }),

      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),

      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          mobile: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: sessionUser.id,
          name: dbUser.name,
          email: dbUser.email,
          mobile: dbUser.mobile,
          role: dbUser.role,
          avatar: dbUser.avatar,
          isActive: dbUser.isActive,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        stats: {
          // FIX: Wrap in Number() to prevent BigInt serialization crash
          totalTickets: Number(totalTickets),
          winningTickets: Number(winningTickets),
          unreadNotifications: Number(unreadNotifications),
        },
      },
    });
  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}