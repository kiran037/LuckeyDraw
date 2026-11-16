import { NextRequest } from "next/server";
import { count, eq, or, ilike, and, desc, asc, SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, draw, drawproduct, auditlog } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

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

    const conditions: SQL[] = [];

    if (drawId) {
      conditions.push(eq(drawproduct.drawId, BigInt(drawId)));
    }

    if (search) {
      conditions.push(
        or(
          ilike(drawproduct.name, `%${search}%`),
          ilike(drawproduct.description, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause = desc(drawproduct.createdAt);
    if (sortBy === "name") {
      orderByClause = order === "asc" ? asc(drawproduct.name) : desc(drawproduct.name);
    } else if (sortBy === "quantity") {
      orderByClause = order === "asc" ? asc(drawproduct.quantity) : desc(drawproduct.quantity);
    } else {
      orderByClause = order === "asc" ? asc(drawproduct.createdAt) : desc(drawproduct.createdAt);
    }

    const [totalRes, productsList] = await Promise.all([
      db.select({ count: count() }).from(drawproduct).where(whereClause),
      db.query.drawproduct.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [orderByClause],
        with: {
          draw: {
            columns: { id: true, title: true, status: true },
          },
          winners: {
            columns: { id: true },
          },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    const formattedProducts = productsList.map((p) => {
      const winnersCount = (p.winners || []).length;
      return {
        ...p,
        winnersCount,
        remainingQuantity: p.quantity - winnersCount,
      };
    });

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

    if (!drawId || !name || quantity === undefined)
      return errorResponse("Missing required fields", 400);
    if (Number(quantity) < 1)
      return errorResponse("Quantity must be at least 1", 400);

    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, BigInt(drawId)),
    });
    if (!foundDraw) return errorResponse("Draw not found", 404);

    const [createdProduct] = await db
      .insert(drawproduct)
      .values({
        drawId: BigInt(drawId),
        name: name.trim(),
        image: image || null,
        quantity: Number(quantity),
        description: description?.trim() || null,
      })
      .returning();

    await db.insert(auditlog).values({
      action: "CREATE",
      entity: "DRAW_PRODUCT",
      entityId: createdProduct.id,
      adminId: BigInt(admin.id),
      meta: JSON.stringify({ drawId, name, quantity }),
    });

    const productWithDraw = await db.query.drawproduct.findFirst({
      where: eq(drawproduct.id, createdProduct.id),
      with: {
        draw: { columns: { id: true, title: true, status: true } },
      },
    });

    return jsonResponse(
      {
        success: true,
        message: "Product created successfully",
        product: productWithDraw,
      },
      201
    );
  } catch (error) {
    console.error("ADMIN CREATE PRODUCT ERROR:", error);
    return errorResponse("Failed to create product", 500);
  }
}
