import { NextRequest } from "next/server";
import { count, eq, or, ilike, and, desc, SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, user, user_role } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as user_role | undefined;

    const conditions: SQL[] = [];

    if (role && Object.values(user_role).includes(role)) {
      conditions.push(eq(user.role, role));
    }

    if (search) {
      conditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`),
          ilike(user.mobile, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes, usersList] = await Promise.all([
      db.select({ count: count() }).from(user).where(whereClause),
      db.query.user.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(user.createdAt)],
        columns: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      users: usersList,
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}
