import { NextRequest } from "next/server";
import { count, eq, ilike, and, desc, inArray, SQL } from "drizzle-orm";
import { db, draw, drawproduct, draw_status } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as draw_status | undefined;

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(draw.title, `%${search}%`));
    }

    if (status && Object.values(draw_status).includes(status)) {
      conditions.push(eq(draw.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes, drawsList] = await Promise.all([
      db.select({ count: count() }).from(draw).where(whereClause),
      db.query.draw.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(draw.createdAt)],
        with: {
          tickets: { columns: { id: true } },
          drawproducts: { columns: { id: true } },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    const formattedDraws = drawsList.map((d) => {
      const sold = (d.tickets || []).length;
      const totalTickets = d.maxTickets;
      const percentage =
        totalTickets > 0 ? Math.round((sold / totalTickets) * 100) : 0;

      return {
        id: d.id.toString(),
        title: d.title,
        description: d.description,
        bannerImage: d.bannerImage,
        entryFee: d.entryFee,
        maxTickets: d.maxTickets,
        startTime: new Date(d.startTime).toISOString(),
        endTime: new Date(d.endTime).toISOString(),
        status: d.status,
        createdAt: new Date(d.createdAt).toISOString(),
        stats: {
          sold,
          percentage,
          productCount: (d.drawproducts || []).length,
        },
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
    if (!body.startTime || !body.endTime)
      return errorResponse("Dates are required", 400);

    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    if (startTime >= endTime)
      return errorResponse("End time must be after start time", 400);

    const entryFee = Math.max(0, Number(body.entryFee || 0));
    const maxTickets = Math.max(1, Number(body.maxTickets || 100));

    const productIdsToAssign: bigint[] = Array.isArray(body.productIds)
      ? body.productIds.map((id: string | number) => BigInt(id))
      : [];

    const result = await db.transaction(async (tx) => {
      const [newDraw] = await tx
        .insert(draw)
        .values({
          title: body.title.trim(),
          description: body.description?.trim() || null,
          bannerImage: body.bannerImage || null,
          rules: body.rules?.trim() || null,
          entryFee,
          maxTickets,
          startTime,
          endTime,
          status: (body.status as draw_status) || draw_status.DRAFT,
        })
        .returning();

      if (productIdsToAssign.length > 0) {
        await tx
          .update(drawproduct)
          .set({ drawId: newDraw.id })
          .where(inArray(drawproduct.id, productIdsToAssign));
      }

      return newDraw;
    });

    return jsonResponse(
      {
        message: "Draw created successfully",
        draw: result,
      },
      201
    );
  } catch (err) {
    console.error("ADMIN CREATE DRAW ERROR:", err);
    return errorResponse("Failed to create draw", 500);
  }
}
