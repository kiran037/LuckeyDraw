import { NextRequest } from "next/server";
import { count, sum, gte, eq, and } from "drizzle-orm";
import {
  db,
  user,
  draw,
  ticket,
  payment,
  payment_status,
  draw_status,
} from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    // Date calculations
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const [
      totalUsersRes,
      newUsersTodayRes,
      activeDrawsRes,
      totalTicketsRes,
      ticketsTodayRes,
      pendingPaymentsRes,
      revenueStatsRes,
      todayRevenueRes,
    ] = await Promise.all([
      db.select({ val: count() }).from(user),
      db.select({ val: count() }).from(user).where(gte(user.createdAt, startOfDay)),
      db.select({ val: count() }).from(draw).where(eq(draw.status, draw_status.LIVE)),
      db.select({ val: count() }).from(ticket),
      db.select({ val: count() }).from(ticket).where(gte(ticket.createdAt, startOfDay)),
      db.select({ val: count() }).from(payment).where(eq(payment.status, payment_status.PENDING)),
      db.select({ total: sum(payment.amount) }).from(payment).where(eq(payment.status, payment_status.APPROVED)),
      db.select({ total: sum(payment.amount) }).from(payment).where(
        and(eq(payment.status, payment_status.APPROVED), gte(payment.createdAt, startOfDay))
      ),
    ]);

    const totalUsers = Number(totalUsersRes[0]?.val ?? 0);
    const newUsersToday = Number(newUsersTodayRes[0]?.val ?? 0);
    const activeDraws = Number(activeDrawsRes[0]?.val ?? 0);
    const totalTickets = Number(totalTicketsRes[0]?.val ?? 0);
    const ticketsToday = Number(ticketsTodayRes[0]?.val ?? 0);
    const pendingPayments = Number(pendingPaymentsRes[0]?.val ?? 0);
    const totalRevenue = Number(revenueStatsRes[0]?.total ?? 0);
    const todayRevenue = Number(todayRevenueRes[0]?.total ?? 0);

    return jsonResponse({
      kpi: {
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
        },
        users: {
          total: totalUsers,
          newToday: newUsersToday,
        },
        tickets: {
          total: totalTickets,
          soldToday: ticketsToday,
        },
        draws: {
          active: activeDraws,
        },
        actionItems: {
          pendingPayments: pendingPayments,
        },
      },
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD STATS ERROR:", err);
    return errorResponse("Failed to load dashboard stats", 500);
  }
}
