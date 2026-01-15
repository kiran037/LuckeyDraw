// src/app/api/user/notifications/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils"; // Use the helper created earlier

// 1. GET: Fetch user notifications
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const userId = BigInt(user.id);

    // Fetch data in parallel for performance
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    // jsonResponse automatically handles BigInt serialization
    return jsonResponse({
      notifications,
      unreadCount,
    });

  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return errorResponse("Server error", 500);
  }
}

// 2. PATCH: Mark notifications as read
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { notificationId } = body;
    const userId = BigInt(user.id);

    // Scenario A: Mark a SPECIFIC notification as read
    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: BigInt(notificationId),
          userId: userId, // Security: Ensure it belongs to the user
          isRead: false,  // Optimization: Only update if false
        },
        data: { isRead: true },
      });

      return jsonResponse({ message: "Notification marked as read" });
    } 
    
    // Scenario B: Mark ALL notifications as read (if no ID provided)
    else {
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return jsonResponse({ message: "All notifications marked as read" });
    }

  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return errorResponse("Server error", 500);
  }
}