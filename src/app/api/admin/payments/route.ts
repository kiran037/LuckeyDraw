import { NextRequest } from "next/server";
import { count, eq, ilike, or, and, desc, SQL } from "drizzle-orm";
import { db, payment, user, payment_status } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const status = searchParams.get("status") as payment_status | undefined;
    const search = searchParams.get("search") || "";
    const drawId = searchParams.get("drawId");

    const conditions: SQL[] = [];

    if (status && Object.values(payment_status).includes(status)) {
      conditions.push(eq(payment.status, status));
    }

    if (drawId) {
      conditions.push(eq(payment.drawId, BigInt(drawId)));
    }

    if (search) {
      const matchingUsers = await db.query.user.findMany({
        where: or(
          ilike(user.name, `%${search}%`),
          ilike(user.mobile, `%${search}%`),
          ilike(user.email, `%${search}%`)
        ),
        columns: { id: true },
      });
      const uIds = matchingUsers.map((u) => u.id);

      const searchConditions: SQL[] = [
        ilike(payment.transactionId, `%${search}%`),
        ilike(payment.gatewayOrderId, `%${search}%`),
      ];
      if (uIds.length > 0) {
        searchConditions.push(
          or(...uIds.map((uid) => eq(payment.userId, uid)))!
        );
      }
      conditions.push(or(...searchConditions)!);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes, paymentsList] = await Promise.all([
      db.select({ count: count() }).from(payment).where(whereClause),
      db.query.payment.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(payment.createdAt)],
        with: {
          user: {
            columns: { id: true, name: true, mobile: true, email: true },
          },
          draw: {
            columns: { id: true, title: true, entryFee: true },
          },
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
      payments: paymentsList,
    });
  } catch (err) {
    console.error("ADMIN GET PAYMENTS ERROR:", err);
    return errorResponse("Failed to fetch payments", 500);
  }
}
