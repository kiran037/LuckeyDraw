import { desc } from "drizzle-orm";
import { db, user, payment, auditlog } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const [recentUsers, recentPayments, recentAudit] = await Promise.all([
      db.query.user.findMany({
        limit: 5,
        orderBy: [desc(user.createdAt)],
        columns: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      }),

      db.query.payment.findMany({
        limit: 5,
        orderBy: [desc(payment.createdAt)],
        with: {
          user: { columns: { name: true } },
          draw: { columns: { title: true } },
        },
      }),

      db.query.auditlog.findMany({
        limit: 5,
        orderBy: [desc(auditlog.createdAt)],
      }),
    ]);

    return jsonResponse({
      activity: {
        users: recentUsers,
        transactions: recentPayments,
        auditLogs: recentAudit,
      },
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ACTIVITY ERROR:", err);
    return errorResponse("Failed to load activity", 500);
  }
}
