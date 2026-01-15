import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { draw_status, Prisma } from "@/generated/client/client";

// Interface for incoming product data
interface ProductInput {
  name: string;
  image?: string | null;
  quantity?: number | string;
  description?: string | null;
}

/* =========================
   GET — List draws (Advanced)
   Query Params: page, limit, search, status
========================= */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as draw_status | undefined;

    // Build Query
    const where: Prisma.drawWhereInput = {};

    if (search) {
      where.title = { contains: search }; 
    }

    if (status && Object.values(draw_status).includes(status)) {
      where.status = status;
    }

    // Transaction for Count + Data
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

    // Calculate generic stats for the list view
    const formattedDraws = draws.map((d) => {
      const sold = d._count.ticket;
      const totalTickets = d.maxTickets;
      const percentage = totalTickets > 0 ? Math.round((sold / totalTickets) * 100) : 0;

      return {
        ...d,
        stats: {
          sold,
          percentage,
          productCount: d._count.drawproduct
        }
      };
    });

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      draws: formattedDraws,
    });

  } catch (err) {
    console.error("ADMIN GET DRAWS ERROR:", err);
    return errorResponse("Failed to fetch draws", 500);
  }
}

/* =========================
   POST — Create Draw (with Products)
========================= */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json();

    // 1. Basic Validation
    if (!body.title?.trim()) return errorResponse("Title is required", 400);
    if (!body.startTime || !body.endTime) return errorResponse("Dates are required", 400);
    
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    if (startTime >= endTime) return errorResponse("End time must be after start time", 400);

    const entryFee = Math.max(0, Number(body.entryFee || 0));
    const maxTickets = Math.max(1, Number(body.maxTickets || 100));

    // 2. Prepare Product Data (if any)
    const productsCreate: Prisma.drawproductCreateWithoutDrawInput[] = Array.isArray(body.products) 
      ? body.products.map((p: ProductInput) => ({
          name: p.name,
          image: p.image || null,
          quantity: Number(p.quantity || 1),
          description: p.description || null
        }))
      : [];

    // 3. Create Transaction
    const draw = await prisma.draw.create({
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
        // Nested create for products
        drawproduct: {
          create: productsCreate
        }
      },
      include: {
        drawproduct: true
      }
    });

    return jsonResponse({
      message: "Draw created successfully",
      draw,
    }, 201);

  } catch (err) {
    console.error("ADMIN CREATE DRAW ERROR:", err);
    return errorResponse("Failed to create draw", 500);
  }
}