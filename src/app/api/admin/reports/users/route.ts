///Users/xeoren/Desktop/lucky_draw/src/app/api/admin/reports/users/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { Prisma } from "@/generated/client/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy"); // 'spend' or 'date'

    const where: Prisma.userWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    // Fetch users with counts and total spend
    // Note: Sorting by "total spent" usually requires raw SQL or post-processing in Prisma.
    // For scalability, we sort by Date in DB, and can do spend sorting on current page or filtered set.
    
    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          createdAt: true,
          isActive: true,
          _count: {
            select: {
              tickets: true, // "tickets" is correct per schema @relation("UserTickets")
              payment: true  // "payment" is correct per schema
            }
          },
          // Fetch approved payments sum
          payment: {
            where: { status: "APPROVED" },
            select: { amount: true }
          }
        }
      }),
    ]);

    const report = users.map(u => ({
      id: u.id,
      name: u.name,
      contact: { email: u.email, mobile: u.mobile },
      joinedAt: u.createdAt,
      stats: {
        totalTickets: u._count.tickets,
        totalTransactions: u._count.payment,
        totalSpent: u.payment.reduce((sum, p) => sum + p.amount, 0)
      }
    }));

    // If explicit sort by spend is requested (works only on the fetched page in this method)
    if (sortBy === 'spend') {
      report.sort((a, b) => b.stats.totalSpent - a.stats.totalSpent);
    }

    return jsonResponse({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: report,
    });

  } catch (err) {
    console.error("REPORT USERS ERROR:", err);
    return errorResponse("Failed to generate user report", 500);
  }
}