// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const drawId = searchParams.get("drawId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Build where clause
    type WhereClause = {
      drawId?: bigint;
      OR?: Array<{
        name?: { contains: string };
        description?: { contains: string };
      }>;
    };

    const where: WhereClause = {};

    if (drawId) {
      where.drawId = BigInt(drawId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Validate sortBy field
    const allowedSortFields = ["createdAt", "name", "quantity"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.drawproduct.findMany({
        where,
        include: {
          draw: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          winner: {
            select: {
              id: true,
              ticketId: true,
              declaredAt: true,
            },
          },
        },
        orderBy: { [sortField]: order },
        skip,
        take: limit,
      }),
      prisma.drawproduct.count({ where }),
    ]);

    // Format response
    const formattedProducts = products.map((product) => ({
      id: product.id.toString(),
      drawId: product.drawId.toString(),
      name: product.name,
      image: product.image,
      quantity: product.quantity,
      description: product.description,
      createdAt: product.createdAt.toISOString(),
      draw: product.draw
        ? {
            id: product.draw.id.toString(),
            title: product.draw.title,
            status: product.draw.status,
          }
        : null,
      winnersCount: product.winner.length,
      remainingQuantity: product.quantity - product.winner.length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { drawId, name, image, quantity, description } = body;

    // Validation
    if (!drawId || !name || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "drawId, name, and quantity are required",
        },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Check if draw exists
    const draw = await prisma.draw.findUnique({
      where: { id: BigInt(drawId) },
    });

    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Draw not found" },
        { status: 404 }
      );
    }

    // Create product
    const product = await prisma.drawproduct.create({
      data: {
        drawId: BigInt(drawId),
        name: name.trim(),
        image: image || null,
        quantity: parseInt(quantity),
        description: description?.trim() || null,
      },
      include: {
        draw: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditlog.create({
      data: {
        action: "CREATE",
        entity: "DRAW_PRODUCT",
        entityId: product.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify({
          drawId,
          name,
          quantity,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: {
        id: product.id.toString(),
        drawId: product.drawId.toString(),
        name: product.name,
        image: product.image,
        quantity: product.quantity,
        description: product.description,
        createdAt: product.createdAt.toISOString(),
        draw: product.draw
          ? {
              id: product.draw.id.toString(),
              title: product.draw.title,
              status: product.draw.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}