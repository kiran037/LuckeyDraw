import { NextRequest } from "next/server";
import { count, sum, eq, gte, lte, and, desc, SQL } from "drizzle-orm";
import { db, payment, payment_status } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const conditions: SQL[] = [eq(payment.status, payment_status.APPROVED)];

    if (from) {
      conditions.push(gte(payment.createdAt, new Date(from)));
    }
    if (to) {
      conditions.push(lte(payment.createdAt, new Date(new Date(to).setHours(23, 59, 59, 999))));
    }

    const whereClause = and(...conditions);

    const [aggRes, paymentsList] = await Promise.all([
      db
        .select({
          totalRevenue: sum(payment.amount),
          totalTransactions: count(),
        })
        .from(payment)
        .where(whereClause),

      db.query.payment.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(payment.createdAt)],
        with: {
          user: { columns: { id: true, name: true, email: true } },
          draw: { columns: { id: true, title: true } },
        },
      }),
    ]);

    const totalRevenue = Number(aggRes[0]?.totalRevenue ?? 0);
    const totalTransactions = Number(aggRes[0]?.totalTransactions ?? 0);

    return jsonResponse({
      summary: {
        totalRevenue,
        totalTransactions,
      },
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalTransactions / limit),
      },
      data: paymentsList,
    });
  } catch (err) {
    console.error("REPORT SALES ERROR:", err);
    return errorResponse("Failed to generate sales report", 500);
  }
}
