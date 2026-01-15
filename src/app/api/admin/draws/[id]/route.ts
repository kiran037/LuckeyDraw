import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { draw_status, Prisma } from "@/generated/client/client";

// Interface for incoming product updates
interface ProductUpdateInput {
  id?: string;
  name: string;
  image?: string | null;
  quantity?: number | string;
  description?: string | null;
}

/* =========================
   GET — Single Draw Details + Stats
========================= */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    if (!id) return errorResponse("Invalid ID", 400);

    const drawId = BigInt(id);

    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        drawproduct: true,
        _count: { select: { ticket: true } },
      },
    });

    if (!draw) return errorResponse("Draw not found", 404);

    // Calculate Revenue
    const revenueAgg = await prisma.ticket.aggregate({
      where: { 
        drawId: drawId,
        status: { in: ['ACTIVE'] }
      },
      _sum: { pricePaid: true }
    });

    const sold = draw._count.ticket;
    const totalRevenue = revenueAgg._sum.pricePaid || 0;
    const percentage = draw.maxTickets > 0 ? (sold / draw.maxTickets) * 100 : 0;

    return jsonResponse({
      draw,
      stats: {
        sold,
        remaining: draw.maxTickets - sold,
        percentage: parseFloat(percentage.toFixed(2)),
        totalRevenue
      }
    });

  } catch (err) {
    console.error("ADMIN GET DRAW ERROR:", err);
    return errorResponse("Server error", 500);
  }
}

/* =========================
   PUT — Update Draw & Products
========================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const drawId = BigInt(id);
    const body = await req.json();

    // 1. Fetch current state
    const existing = await prisma.draw.findUnique({
      where: { id: drawId },
      select: { 
        _count: { select: { ticket: true } },
        status: true,
        entryFee: true
      }
    });

    if (!existing) return errorResponse("Draw not found", 404);

    const soldCount = existing._count.ticket;

    // 2. Logic Validation
    if (body.maxTickets && body.maxTickets < soldCount) {
      return errorResponse(`Cannot reduce max tickets below sold count (${soldCount})`, 400);
    }

    if (soldCount > 0 && body.entryFee !== undefined && body.entryFee !== existing.entryFee) {
      return errorResponse("Cannot change Entry Fee after tickets have been sold", 400);
    }

    if (body.startTime && body.endTime) {
      if (new Date(body.startTime) >= new Date(body.endTime)) {
        return errorResponse("End time must be after start time", 400);
      }
    }

    // 3. Prepare Update Object
    const updateData: Prisma.drawUpdateInput = {};
    if (body.title) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    if (body.rules !== undefined) updateData.rules = body.rules;
    if (body.status) updateData.status = body.status as draw_status;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.maxTickets) updateData.maxTickets = Number(body.maxTickets);
    
    if (soldCount === 0 && body.entryFee !== undefined) {
      updateData.entryFee = Number(body.entryFee);
    }

    // 4. Handle Products (Create New or Update Existing)
    if (Array.isArray(body.products)) {
      const updates: Promise<unknown>[] = [];
      const creates: Prisma.drawproductCreateWithoutDrawInput[] = [];

      body.products.forEach((p: ProductUpdateInput) => {
        if (p.id) {
          // Update existing product
          updates.push(prisma.drawproduct.update({
            where: { id: BigInt(p.id) },
            data: {
              name: p.name,
              image: p.image,
              quantity: Number(p.quantity),
              description: p.description
            }
          }));
        } else {
          // Create new product for this draw
          creates.push({
            name: p.name,
            image: p.image,
            quantity: Number(p.quantity || 1),
            description: p.description
          });
        }
      });

      if (creates.length > 0) {
        updateData.drawproduct = { create: creates };
      }

      // Execute product updates (parallel)
      await Promise.all(updates);
    }

    // 5. Execute Main Draw Update
    const updatedDraw = await prisma.draw.update({
      where: { id: drawId },
      data: updateData,
      include: { drawproduct: true }
    });

    return jsonResponse({
      success: true,
      message: "Draw updated successfully",
      draw: updatedDraw
    });

  } catch (err) {
    console.error("ADMIN UPDATE DRAW ERROR:", err);
    return errorResponse("Failed to update draw", 500);
  }
}

/* =========================
   DELETE — Delete Draw
========================= */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const drawId = BigInt(id);

    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: { 
        _count: { select: { ticket: true } }
      }
    });

    if (!draw) return errorResponse("Draw not found", 404);

    if (draw._count.ticket > 0) {
      return errorResponse("Cannot delete a draw that has active tickets.", 400);
    }

    await prisma.$transaction([
      prisma.drawproduct.deleteMany({ where: { drawId } }),
      prisma.draw.delete({ where: { id: drawId } })
    ]);

    return jsonResponse({
      success: true,
      message: "Draw deleted successfully"
    });

  } catch (err) {
    console.error("ADMIN DELETE DRAW ERROR:", err);
    return errorResponse("Failed to delete draw", 500);
  }
}