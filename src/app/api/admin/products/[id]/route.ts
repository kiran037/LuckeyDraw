import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, drawproduct, auditlog } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const product = await db.query.drawproduct.findFirst({
      where: eq(drawproduct.id, BigInt(id)),
      with: {
        draw: {
          columns: {
            id: true,
            title: true,
            description: true,
            status: true,
            startTime: true,
            endTime: true,
            entryFee: true,
          },
        },
        winners: {
          with: {
            ticket: {
              columns: { ticketCode: true },
              with: {
                user: {
                  columns: { id: true, name: true, email: true, mobile: true },
                },
              },
            },
            admin: {
              columns: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!product) return errorResponse("Product not found", 404);

    const formattedData = {
      ...product,
      winner: product.winners,
      winnersCount: (product.winners || []).length,
      remainingQuantity: product.quantity - (product.winners || []).length,
    };

    return jsonResponse({ product: formattedData });
  } catch (error) {
    console.error("ADMIN GET PRODUCT ERROR:", error);
    return errorResponse("Failed to fetch product", 500);
  }
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const body = await requestJson(req);
    const { name, image, quantity, description } = body;

    const existing = await db.query.drawproduct.findFirst({
      where: eq(drawproduct.id, BigInt(id)),
      with: { winners: { columns: { id: true } } },
    });

    if (!existing) return errorResponse("Product not found", 404);

    const winnerCount = (existing.winners || []).length;
    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (newQty < winnerCount) {
        return errorResponse(
          `Cannot reduce quantity below current winner count (${winnerCount})`,
          400
        );
      }
    }

    const updateData: Partial<typeof drawproduct.$inferInsert> = {};
    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (description !== undefined)
      updateData.description = description ? description.trim() : null;

    const [updatedProduct] = await db
      .update(drawproduct)
      .set(updateData)
      .where(eq(drawproduct.id, BigInt(id)))
      .returning();

    await db.insert(auditlog).values({
      action: "UPDATE",
      entity: "DRAW_PRODUCT",
      entityId: updatedProduct.id,
      adminId: BigInt(admin.id),
      meta: JSON.stringify(updateData),
    });

    const productWithDraw = await db.query.drawproduct.findFirst({
      where: eq(drawproduct.id, updatedProduct.id),
      with: { draw: true },
    });

    return jsonResponse({
      success: true,
      message: "Product updated",
      product: productWithDraw,
    });
  } catch (error) {
    console.error("ADMIN UPDATE PRODUCT ERROR:", error);
    return errorResponse("Failed to update product", 500);
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const product = await db.query.drawproduct.findFirst({
      where: eq(drawproduct.id, BigInt(id)),
      with: { winners: { columns: { id: true } } },
    });

    if (!product) return errorResponse("Product not found", 404);

    if ((product.winners || []).length > 0) {
      return errorResponse(
        "Cannot delete product that has declared winners",
        400
      );
    }

    await db.delete(drawproduct).where(eq(drawproduct.id, BigInt(id)));

    await db.insert(auditlog).values({
      action: "DELETE",
      entity: "DRAW_PRODUCT",
      entityId: BigInt(id),
      adminId: BigInt(admin.id),
      meta: JSON.stringify({
        name: product.name,
        drawId: product.drawId.toString(),
      }),
    });

    return jsonResponse({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN DELETE PRODUCT ERROR:", error);
    return errorResponse("Failed to delete product", 500);
  }
}

async function requestJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
