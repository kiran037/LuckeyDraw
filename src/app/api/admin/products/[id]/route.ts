// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

const { id } = await params;

    // Fetch product with full details
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
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    mobile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedProduct = {
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
            description: product.draw.description,
            status: product.draw.status,
            startTime: product.draw.startTime.toISOString(),
            endTime: product.draw.endTime.toISOString(),
            entryFee: product.draw.entryFee,
          }
        : null,
      winners: product.winner.map((w) => ({
        id: w.id.toString(),
        ticketId: w.ticketId.toString(),
        ticketCode: w.ticket.ticketCode,
        declaredAt: w.declaredAt.toISOString(),
        declaredBy: w.declaredBy.toString(),
        user: {
          id: w.ticket.user.id.toString(),
          name: w.ticket.user.name,
          email: w.ticket.user.email,
          mobile: w.ticket.user.mobile,
        },
      })),
      winnersCount: product.winner.length,
      remainingQuantity: product.quantity - product.winner.length,
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

const { id } = await params;
    const body = await request.json();
    const { name, image, quantity, description } = body;

    // Check if product exists
    const existingProduct = await prisma.drawproduct.findUnique({
      where: { id: BigInt(id) },
      include: {
        winner: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Validate quantity if being updated
    if (quantity !== undefined) {
      const winnersCount = existingProduct.winner.length;
      if (quantity < winnersCount) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reduce quantity below ${winnersCount} (current winners count)`,
          },
          { status: 400 }
        );
      }
    }

    // Build update data
    type UpdateData = {
      name?: string;
      image?: string | null;
      quantity?: number;
      description?: string | null;
    };

    const updateData: UpdateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image || null;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (description !== undefined)
      updateData.description = description?.trim() || null;

    // Update product
    const product = await prisma.drawproduct.update({
      where: { id: BigInt(id) },
      data: updateData,
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
        action: "UPDATE",
        entity: "DRAW_PRODUCT",
        entityId: product.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
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
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

const { id } = await params;

    // Check if product exists and has winners
    const product = await prisma.drawproduct.findUnique({
      where: { id: BigInt(id) },
      include: {
        winner: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if winners exist
    if (product.winner.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete product with declared winners",
        },
        { status: 400 }
      );
    }

    // Delete product
    await prisma.drawproduct.delete({
      where: { id: BigInt(id) },
    });

    // Log audit
    await prisma.auditlog.create({
      data: {
        action: "DELETE",
        entity: "DRAW_PRODUCT",
        entityId: BigInt(id),
        adminId: BigInt(admin.id),
        meta: JSON.stringify({
          productName: product.name,
          drawId: product.drawId.toString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}