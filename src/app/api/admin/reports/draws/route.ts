import { NextRequest } from "next/server";
import { count, eq, ilike, and, desc, SQL } from "drizzle-orm";
import { db, draw, payment, ticket, winner, draw_status } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const status = searchParams.get("status") as draw_status | undefined;
    const search = searchParams.get("search");

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(draw.status, status));
    if (search) conditions.push(ilike(draw.title, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes, drawsList] = await Promise.all([
      db.select({ count: count() }).from(draw).where(whereClause),
      db.query.draw.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(draw.createdAt)],
        with: {
          tickets: { columns: { id: true } },
          winners: { columns: { id: true } },
          payments: {
            where: eq(payment.status, "APPROVED"),
            columns: { amount: true },
          },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    const report = drawsList.map((d) => {
      const revenue = (d.payments || []).reduce((sum, p) => sum + p.amount, 0);
      const sold = (d.tickets || []).length;
      const progress = d.maxTickets > 0 ? (sold / d.maxTickets) * 100 : 0;

      return {
        id: d.id,
        title: d.title,
        status: d.status,
        entryFee: d.entryFee,
        dates: {
          start: d.startTime,
          end: d.endTime,
        },
        stats: {
          totalTickets: d.maxTickets,
          soldTickets: sold,
          progress: Math.round(progress),
          totalRevenue: revenue,
          winnersDeclared: (d.winners || []).length,
        },
      };
    });

    return jsonResponse({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: report,
    });
  } catch (err) {
    console.error("REPORT DRAWS ERROR:", err);
    return errorResponse("Failed to generate draw report", 500);
  }
}
