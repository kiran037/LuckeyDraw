///Users/xeoren/Desktop/lucky_draw/src/app/api/admin/reports/draws/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { draw_status, Prisma } from "@/generated/client/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const status = searchParams.get("status") as draw_status | undefined;
    const search = searchParams.get("search");

    const where: Prisma.drawWhereInput = {};

    if (status) where.status = status;
    if (search) where.title = { contains: search };

    // Get Data
    const [total, draws] = await prisma.$transaction([
      prisma.draw.count({ where }),
      prisma.draw.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          entryFee: true,
          status: true,
          startTime: true,
          endTime: true,
          maxTickets: true,
          _count: {
            select: {
              ticket: true,
              payment: true, 
              winner: true
            },
          },
          // Fetch only approved payments to calculate revenue in JS (lighter than subquery)
          payment: {
            where: { status: "APPROVED" },
            select: { amount: true }
          }
        },
      }),
    ]);

    // Format Data
    const report = draws.map(d => {
      // Calculate revenue from approved payments
      const revenue = d.payment.reduce((sum, p) => sum + p.amount, 0);
      const sold = d._count.ticket;
      const progress = d.maxTickets > 0 ? (sold / d.maxTickets) * 100 : 0;

      return {
        id: d.id,
        title: d.title,
        status: d.status,
        entryFee: d.entryFee,
        dates: {
          start: d.startTime,
          end: d.endTime
        },
        stats: {
          totalTickets: d.maxTickets,
          soldTickets: sold,
          progress: Math.round(progress),
          totalRevenue: revenue,
          winnersDeclared: d._count.winner
        }
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