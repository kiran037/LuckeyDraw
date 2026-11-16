import { count, eq, lte, gt, and, or, inArray, desc, asc, SQL } from "drizzle-orm";
import { db, draw, draw_status, ticket } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "live";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const now = new Date();

    let whereClause: SQL | undefined = undefined;

    // --- Tab Logic ---
    if (tab === "live") {
      whereClause = and(
        eq(draw.status, draw_status.LIVE),
        lte(draw.startTime, now),
        gt(draw.endTime, now)
      );
    } else if (tab === "upcoming") {
      whereClause = and(eq(draw.status, draw_status.LIVE), gt(draw.startTime, now));
    } else if (tab === "closed") {
      whereClause = or(
        inArray(draw.status, [draw_status.CLOSED, draw_status.RESULT_DECLARED]),
        lte(draw.endTime, now)
      );
    }

    const [totalRes, drawsList] = await Promise.all([
      db.select({ count: count() }).from(draw).where(whereClause),
      db.query.draw.findMany({
        where: whereClause,
        offset: skip,
        limit,
        orderBy: [tab === "upcoming" ? asc(draw.startTime) : desc(draw.startTime)],
        columns: {
          id: true,
          title: true,
          bannerImage: true,
          entryFee: true,
          startTime: true,
          endTime: true,
          status: true,
          maxTickets: true,
          resultAt: true,
        },
        with: {
          tickets: {
            where: eq(ticket.status, "ACTIVE"),
            columns: { id: true },
          },
          drawproducts: {
            limit: 1,
            columns: { name: true, image: true },
          },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    const formattedDraws = drawsList.map((d) => {
      const sold = (d.tickets || []).length;
      const totalTickets = d.maxTickets || 1;
      const progress = Math.min(Math.round((sold / totalTickets) * 100), 100);

      return {
        id: d.id,
        title: d.title,
        bannerImage: d.bannerImage,
        entryFee: d.entryFee,
        startTime: d.startTime,
        endTime: d.endTime,
        status: d.status,
        maxTickets: d.maxTickets,
        resultAt: d.resultAt,
        drawproduct: d.drawproducts || [],
        stats: { sold, total: totalTickets, progress, percentage: progress },
      };
    });

    return jsonResponse({
      draws: formattedDraws,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET DRAWS ERROR:", error);
    return errorResponse("Failed to fetch draws", 500);
  }
}
