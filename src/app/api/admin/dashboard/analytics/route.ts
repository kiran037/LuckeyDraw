import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { payment_status } from "@/generated/client/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    // Get data for last 7 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 7);

    // Fetch raw data
    const payments = await prisma.payment.findMany({
      where: {
        status: payment_status.APPROVED,
        createdAt: { gte: daysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" }
    });

    // Group by Date (YYYY-MM-DD)
    const revenueMap = new Map<string, number>();
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0]; // "2023-10-25"
      revenueMap.set(key, 0);
    }

    // Fill Data
    payments.forEach(p => {
      const key = p.createdAt.toISOString().split('T')[0];
      if (revenueMap.has(key)) {
        revenueMap.set(key, (revenueMap.get(key) || 0) + p.amount);
      }
    });

    // Convert to Array for Recharts/Chart.js
    const chartData = Array.from(revenueMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    return jsonResponse({
      charts: {
        revenueOverTime: chartData
      }
    });

  } catch (err) {
    console.error("ADMIN DASHBOARD ANALYTICS ERROR:", err);
    return errorResponse("Failed to load analytics", 500);
  }
}