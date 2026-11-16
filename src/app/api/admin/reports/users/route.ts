import { NextRequest } from "next/server";
import { count, or, ilike, eq, desc, SQL } from "drizzle-orm";
import { db, user, payment } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy");

    let whereClause: SQL | undefined = undefined;
    if (search) {
      whereClause = or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(user.mobile, `%${search}%`)
      );
    }

    const [totalRes, usersList] = await Promise.all([
      db.select({ count: count() }).from(user).where(whereClause),
      db.query.user.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(user.createdAt)],
        with: {
          tickets: { columns: { id: true } },
          payments: {
            columns: { amount: true, status: true },
          },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    const report = usersList.map((u) => {
      const approvedPayments = (u.payments || []).filter(
        (p) => p.status === "APPROVED"
      );
      const totalSpent = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        id: u.id,
        name: u.name,
        address: u.address,
        adharcard: u.adharcard,
        pancard: u.pancard,
        contact: { email: u.email, mobile: u.mobile },
        joinedAt: u.createdAt,
        stats: {
          totalTickets: (u.tickets || []).length,
          totalTransactions: (u.payments || []).length,
          totalSpent,
        },
      };
    });

    if (sortBy === "spend") {
      report.sort((a, b) => b.stats.totalSpent - a.stats.totalSpent);
    }

    return jsonResponse({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: report,
    });
  } catch (err) {
    console.error("REPORT USERS ERROR:", err);
    return errorResponse("Failed to generate user report", 500);
  }
}
