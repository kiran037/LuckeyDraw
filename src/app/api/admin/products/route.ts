import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { Prisma } from "@/generated/client/client";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const drawId = searchParams.get("drawId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    // Build Query
    const where: Prisma.drawproductWhereInput = {};

    if (drawId) {
      where.drawId = BigInt(drawId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Sort Validation
    const allowedSorts = ["createdAt", "name", "quantity"];
    const validSort = allowedSorts.includes(sortBy) ? sortBy : "createdAt";

    // Transaction
    const [total, products] = await prisma.$transaction([
      prisma.drawproduct.count({ where }),
      prisma.drawproduct.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [validSort]: order },
        include: {
          draw: {
            select: { id: true, title: true, status: true },
          },
          _count: {
            select: { winner: true }
          }
        },
      }),
    ]);

    // Format (add calculated fields)
    const formattedProducts = products.map((p) => ({
      ...p,
      winnersCount: p._count.winner,
      remainingQuantity: p.quantity - p._count.winner,
    }));

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      products: formattedProducts,
    });

  } catch (error) {
    console.error("ADMIN GET PRODUCTS ERROR:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const { drawId, name, image, quantity, description } = body;

    // Validation
    if (!drawId || !name || quantity === undefined) return errorResponse("Missing required fields", 400);
    if (Number(quantity) < 1) return errorResponse("Quantity must be at least 1", 400);

    // Check Draw
    const draw = await prisma.draw.findUnique({
      where: { id: BigInt(drawId) },
    });
    if (!draw) return errorResponse("Draw not found", 404);

    // Create
    const product = await prisma.drawproduct.create({
      data: {
        drawId: BigInt(drawId),
        name: name.trim(),
        image: image || null,
        quantity: Number(quantity),
        description: description?.trim() || null,
      },
      include: {
        draw: { select: { id: true, title: true, status: true } }
      }
    });

    // Audit Log
    await prisma.auditlog.create({
      data: {
        action: "CREATE",
        entity: "DRAW_PRODUCT",
        entityId: product.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify({ drawId, name, quantity }),
      },
    });

    return jsonResponse({
      success: true,
      message: "Product created successfully",
      product,
    }, 201);

  } catch (error) {
    console.error("ADMIN CREATE PRODUCT ERROR:", error);
    return errorResponse("Failed to create product", 500);
  }
}