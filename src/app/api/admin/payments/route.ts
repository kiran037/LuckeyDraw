///Users/xeoren/Desktop/lucky_draw/src/app/api/admin/payments/route.ts
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
    const status = searchParams.get("status") as payment_status | undefined;
    const search = searchParams.get("search") || "";
    const drawId = searchParams.get("drawId");

    // Build Filter
    const where: Prisma.paymentWhereInput = {};

    if (status && Object.values(payment_status).includes(status)) {
      where.status = status;
    }

    if (drawId) {
      where.drawId = BigInt(drawId);
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search } }, // Case sensitive in MySQL
        { gatewayOrderId: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    // Execute Query
    const [total, payments] = await prisma.$transaction([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" }, // Newest first
        include: {
          user: {
            select: { id: true, name: true, mobile: true, email: true }
          },
          draw: {
            select: { id: true, title: true, entryFee: true }
          }
        }
      }),
    ]);

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      payments
    });

  } catch (err) {
    console.error("ADMIN GET PAYMENTS ERROR:", err);
    return errorResponse("Failed to fetch payments", 500);
  }
}