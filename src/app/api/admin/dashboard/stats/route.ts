import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { payment_status, draw_status } from "@/generated/client/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    // Date calculations
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run queries in parallel for performance
    const [
      totalUsers, 
      newUsersToday,
      activeDraws,
      totalTickets,
      ticketsToday,
      pendingPayments,
      revenueStats
    ] = await prisma.$transaction([
      // 1. User Counts
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),

      // 2. Active Draws (Live)
      prisma.draw.count({ where: { status: draw_status.LIVE } }),

      // 3. Ticket Counts
      prisma.ticket.count(),
      prisma.ticket.count({ where: { createdAt: { gte: startOfDay } } }),

      // 4. Action Item: Pending Payments (Critical for Admin)
      prisma.payment.count({ where: { status: payment_status.PENDING } }),

      // 5. Revenue Aggregation (Total & Monthly)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: payment_status.APPROVED }
      })
    ]);

    // Calculate Today's Revenue separately (cleaner query)
    const todayRevenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        status: payment_status.APPROVED,
        createdAt: { gte: startOfDay }
      }
    });

    return jsonResponse({
      kpi: {
        revenue: {
          total: revenueStats._sum.amount || 0,
          today: todayRevenueAgg._sum.amount || 0,
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
          pendingPayments: pendingPayments, // Use this for a Red Badge on your UI
        }
      }
    });

  } catch (err) {
    console.error("ADMIN DASHBOARD STATS ERROR:", err);
    return errorResponse("Failed to load dashboard stats", 500);
  }
}