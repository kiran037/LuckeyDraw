import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { Prisma } from "@/generated/client/client";

// Helper type for params
type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const product = await prisma.drawproduct.findUnique({
      where: { id: BigInt(id) },
      include: {
        draw: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            startTime: true,
            endTime: true,
            entryFee: true,
          },
        },
        winner: {
          include: {
            ticket: {
              select: {
                ticketCode: true,
                user: {
                  select: { id: true, name: true, email: true, mobile: true },
                },
              },
            },
            admin: { // Fetch who declared the winner
               select: { id: true, name: true }
            }
          },
        },
      },
    });

    if (!product) return errorResponse("Product not found", 404);

    // Format response with calculated fields
    const formattedData = {
      ...product,
      winnersCount: product.winner.length,
      remainingQuantity: product.quantity - product.winner.length,
      // Simplify winner structure for frontend if needed, 
      // but standard jsonResponse handles BigInt automatically.
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
    const body = await requestJson(req); // or await req.json()
    const { name, image, quantity, description } = body;

    // Check existence
    const existing = await prisma.drawproduct.findUnique({
      where: { id: BigInt(id) },
      include: { winner: true },
    });

    if (!existing) return errorResponse("Product not found", 404);

    // Validate Quantity
    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (newQty < existing.winner.length) {
        return errorResponse(`Cannot reduce quantity below current winner count (${existing.winner.length})`, 400);
      }
    }

    const updateData: Prisma.drawproductUpdateInput = {};
    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    const updatedProduct = await prisma.drawproduct.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { draw: true }
    });

    // Audit
    await prisma.auditlog.create({
      data: {
        action: "UPDATE",
        entity: "DRAW_PRODUCT",
        entityId: updatedProduct.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify(updateData),
      },
    });

    return jsonResponse({
      success: true,
      message: "Product updated",
      product: updatedProduct
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

    const product = await prisma.drawproduct.findUnique({
      where: { id: BigInt(id) },
      include: { _count: { select: { winner: true } } }
    });

    if (!product) return errorResponse("Product not found", 404);

    if (product._count.winner > 0) {
      return errorResponse("Cannot delete product that has declared winners", 400);
    }

    await prisma.drawproduct.delete({
      where: { id: BigInt(id) },
    });

    // Audit
    await prisma.auditlog.create({
      data: {
        action: "DELETE",
        entity: "DRAW_PRODUCT",
        entityId: BigInt(id),
        adminId: BigInt(admin.id),
        meta: JSON.stringify({ name: product.name, drawId: product.drawId.toString() }),
      },
    });

    return jsonResponse({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("ADMIN DELETE PRODUCT ERROR:", error);
    return errorResponse("Failed to delete product", 500);
  }
}

// Helper to safely parse JSON
async function requestJson(req: NextRequest) {
    try { return await req.json(); } catch { return {}; }
}