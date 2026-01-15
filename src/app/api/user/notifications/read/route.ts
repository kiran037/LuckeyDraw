import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const notificationId = body.notificationId;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: "Valid notification ID is required" },
        { status: 400 }
      );
    }

    const userId = BigInt(user.id);
    const id = BigInt(notificationId);

    // Use updateMany to safely update only if it belongs to the user
    const updated = await prisma.notification.updateMany({
      where: {
        id,
        userId, 
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Even if updated.count is 0 (already read), we return success to the UI
    // to prevent UI sync errors.
    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      data: {
        id: notificationId,
        isRead: true,
      },
    });
  } catch (error) {
    console.error("POST MARK NOTIFICATION READ ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}