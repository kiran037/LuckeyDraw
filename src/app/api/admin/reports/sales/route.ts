import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { payment_status, Prisma } from "@/generated/client/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to");     // YYYY-MM-DD

    // Build Date Filter
    const where: Prisma.paymentWhereInput = {
      status: payment_status.APPROVED // Only count actual sales
    };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(new Date(to).setHours(23, 59, 59));
    }

    // 1. Aggregate Total Revenue (Database side is much faster)
    const aggregation = await prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true }
    });

    // 2. Fetch Paginated Records
    const payments = await prisma.payment.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        draw: { select: { id: true, title: true } }
      }
    });

    return jsonResponse({
      summary: {
        totalRevenue: aggregation._sum.amount || 0,
        totalTransactions: aggregation._count.id || 0,
      },
      meta: {
        page,
        limit,
        totalPages: Math.ceil((aggregation._count.id || 0) / limit),
      },
      data: payments,
    });

  } catch (err) {
    console.error("REPORT SALES ERROR:", err);
    return errorResponse("Failed to generate sales report", 500);
  }
}