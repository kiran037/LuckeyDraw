import { count, eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db, notification } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const userId = BigInt(user.id);

    const [notifications, unreadCountRes] = await Promise.all([
      db.query.notification.findMany({
        where: eq(notification.userId, userId),
        orderBy: [desc(notification.createdAt)],
        limit: 50,
      }),
      db
        .select({ count: count() })
        .from(notification)
        .where(
          and(eq(notification.userId, userId), eq(notification.isRead, false))
        ),
    ]);

    const unreadCount = Number(unreadCountRes[0]?.count ?? 0);

    return jsonResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return errorResponse("Server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { notificationId } = body;
    const userId = BigInt(user.id);

    if (notificationId) {
      await db
        .update(notification)
        .set({ isRead: true })
        .where(
          and(
            eq(notification.id, BigInt(notificationId)),
            eq(notification.userId, userId),
            eq(notification.isRead, false)
          )
        );

      return jsonResponse({ message: "Notification marked as read" });
    } else {
      await db
        .update(notification)
        .set({ isRead: true })
        .where(
          and(eq(notification.userId, userId), eq(notification.isRead, false))
        );

      return jsonResponse({ message: "All notifications marked as read" });
    }
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return errorResponse("Server error", 500);
  }
}
