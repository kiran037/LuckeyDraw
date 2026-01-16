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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as draw_status | undefined;

    const where: Prisma.drawWhereInput = {};

    if (search) {
      where.title = { contains: search };
    }

    if (status && Object.values(draw_status).includes(status)) {
      where.status = status;
    }

    const [total, draws] = await prisma.$transaction([
      prisma.draw.count({ where }),
      prisma.draw.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { ticket: true, drawproduct: true } },
        },
      }),
    ]);

    const formattedDraws = draws.map((d) => {
      const sold = d._count.ticket;
      const totalTickets = d.maxTickets;
      const percentage = totalTickets > 0 ? Math.round((sold / totalTickets) * 100) : 0;

      return {
        id: d.id.toString(),
        title: d.title,
        description: d.description,
        bannerImage: d.bannerImage,
        entryFee: d.entryFee,
        maxTickets: d.maxTickets,
        startTime: d.startTime.toISOString(),
        endTime: d.endTime.toISOString(),
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        stats: {
          sold,
          percentage,
          productCount: d._count.drawproduct
        }
      };
    });

    return jsonResponse({
      draws: formattedDraws,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("ADMIN GET DRAWS ERROR:", err);
    return errorResponse("Failed to fetch draws", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json();

    if (!body.title?.trim()) return errorResponse("Title is required", 400);
    if (!body.startTime || !body.endTime) return errorResponse("Dates are required", 400);

    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    if (startTime >= endTime) return errorResponse("End time must be after start time", 400);

    const entryFee = Math.max(0, Number(body.entryFee || 0));
    const maxTickets = Math.max(1, Number(body.maxTickets || 100));

    const productIdsToAssign: bigint[] = Array.isArray(body.productIds)
      ? body.productIds.map((id: string | number) => BigInt(id))
      : [];

    const result = await prisma.$transaction(async (tx) => {
      const newDraw = await tx.draw.create({
        data: {
          title: body.title.trim(),
          description: body.description?.trim() || null,
          bannerImage: body.bannerImage || null,
          rules: body.rules?.trim() || null,
          entryFee,
          maxTickets,
          startTime,
          endTime,
          status: (body.status as draw_status) || draw_status.DRAFT,
        },
      });

      if (productIdsToAssign.length > 0) {
        await tx.drawproduct.updateMany({
          where: { id: { in: productIdsToAssign } },
          data: { drawId: newDraw.id },
        });
      }

      return newDraw;
    });

    return jsonResponse({
      message: "Draw created successfully",
      draw: result,
    }, 201);

  } catch (err) {
    console.error("ADMIN CREATE DRAW ERROR:", err);
    return errorResponse("Failed to create draw", 500);
  }
}