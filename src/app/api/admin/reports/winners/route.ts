import { NextRequest } from "next/server";
import { count, eq, and, desc, SQL, ilike, inArray } from "drizzle-orm";
import { db, winner, user } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const drawId = searchParams.get("drawId");
    const search = searchParams.get("search");

    const conditions: SQL[] = [];
    if (drawId) conditions.push(eq(winner.drawId, BigInt(drawId)));

    // If search by winner name, we can filter by user name
    if (search) {
      // Find matching user IDs
      const matchingUsers = await db.query.user.findMany({
        where: ilike(user.name, `%${search}%`),
        columns: { id: true },
      });
      const userIds = matchingUsers.map((u) => u.id);
      if (userIds.length > 0) {
        conditions.push(inArray(winner.userId, userIds));
      } else {
        return jsonResponse({
          meta: { total: 0, page, limit, totalPages: 0 },
          data: [],
        });
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes, winnersList] = await Promise.all([
      db.select({ count: count() }).from(winner).where(whereClause),
      db.query.winner.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(winner.declaredAt)],
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              mobile: true,
              avatar: true,
            },
          },
          draw: {
            columns: { id: true, title: true },
          },
          drawproduct: {
            columns: { id: true, name: true, image: true },
          },
          ticket: {
            columns: { ticketCode: true },
          },
          admin: {
            columns: { name: true },
          },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    return jsonResponse({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: winnersList,
    });
  } catch (err) {
    console.error("REPORT WINNERS ERROR:", err);
    return errorResponse("Failed to generate winners report", 500);
  }
}
