import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const [recentUsers, recentPayments, recentAudit] = await prisma.$transaction([
      // 1. Last 5 Joined Users
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        }
      }),

      // 2. Last 5 Transactions
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          draw: { select: { title: true } }
        }
      }),

      // 3. Last 5 Admin Actions (Audit Log)
      prisma.auditlog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        // If your schema doesn't have a relation to Admin User in auditlog,
        // you might just get the adminId. 
        // Ideally, add relation: admin user @relation(...) to auditlog schema.
      })
    ]);

    return jsonResponse({
      activity: {
        users: recentUsers,
        transactions: recentPayments,
        auditLogs: recentAudit
      }
    });

  } catch (err) {
    console.error("ADMIN DASHBOARD ACTIVITY ERROR:", err);
    return errorResponse("Failed to load activity", 500);
  }
}