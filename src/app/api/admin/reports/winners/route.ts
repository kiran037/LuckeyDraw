///Users/xeoren/Desktop/lucky_draw/src/app/api/admin/reports/winners/route.ts
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
    const drawId = searchParams.get("drawId");
    const search = searchParams.get("search"); // Search Winner Name

    const where: Prisma.winnerWhereInput = {};

    if (drawId) where.drawId = BigInt(drawId);
    if (search) {
      where.user = {
        name: { contains: search }
      };
    }

    // Query on 'winner' model directly for a cleaner report
    const [total, winners] = await prisma.$transaction([
      prisma.winner.count({ where }),
      prisma.winner.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { declaredAt: "desc" },
        include: {
          user: { // The Winner
            select: { id: true, name: true, email: true, mobile: true, avatar: true }
          },
          draw: { // The Draw
            select: { id: true, title: true }
          },
          drawproduct: { // The Prize
            select: { id: true, name: true, image: true }
          },
          ticket: { // The Winning Ticket
            select: { ticketCode: true }
          },
          admin: { // Who declared it
             select: { name: true }
          }
        }
      }),
    ]);

    return jsonResponse({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: winners,
    });

  } catch (err) {
    console.error("REPORT WINNERS ERROR:", err);
    return errorResponse("Failed to generate winners report", 500);
  }
}