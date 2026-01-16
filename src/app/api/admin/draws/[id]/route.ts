import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { draw_status, Prisma } from "@/generated/client/client";

export async function GET(
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
        drawproduct: true,
        _count: { select: { ticket: true } },
      },
    });

    if (!draw) return errorResponse("Draw not found", 404);

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

    const serializedDraw = {
      id: draw.id.toString(),
      title: draw.title,
      description: draw.description,
      bannerImage: draw.bannerImage,
      rules: draw.rules,
      entryFee: draw.entryFee,
      maxTickets: draw.maxTickets,
      startTime: draw.startTime.toISOString(),
      endTime: draw.endTime.toISOString(),
      status: draw.status,
      createdAt: draw.createdAt.toISOString(),
      drawproduct: draw.drawproduct.map(p => ({
        id: p.id.toString(),
        name: p.name,
        image: p.image,
        quantity: p.quantity,
        description: p.description
      }))
    };

    return jsonResponse({
      draw: serializedDraw,
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

    const existingDraw = await prisma.draw.findUnique({
      where: { id: drawId },
      select: {
        _count: { select: { ticket: true } },
        entryFee: true,
        drawproduct: { select: { id: true } }
      }
    });

    if (!existingDraw) return errorResponse("Draw not found", 404);
    const soldCount = existingDraw._count.ticket;

    if (body.maxTickets && body.maxTickets < soldCount) {
      return errorResponse(`Cannot reduce max tickets below sold count (${soldCount})`, 400);
    }
    if (soldCount > 0 && body.entryFee !== undefined && body.entryFee !== existingDraw.entryFee) {
      return errorResponse("Cannot change Entry Fee after tickets have been sold", 400);
    }
    if (body.startTime && body.endTime) {
      if (new Date(body.startTime) >= new Date(body.endTime)) {
        return errorResponse("End time must be after start time", 400);
      }
    }

    const updateData: Prisma.drawUpdateInput = {};
    if (body.title) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    if (body.rules !== undefined) updateData.rules = body.rules;
    if (body.status) updateData.status = body.status as draw_status;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.maxTickets) updateData.maxTickets = Number(body.maxTickets);
    if (soldCount === 0 && body.entryFee !== undefined) updateData.entryFee = Number(body.entryFee);

    await prisma.$transaction(async (tx) => {
      await tx.draw.update({
        where: { id: drawId },
        data: updateData,
      });

      if (Array.isArray(body.productIds)) {
        const incomingIds = body.productIds.map((pid: string | number) => BigInt(pid));
        const currentIds = existingDraw.drawproduct.map(p => p.id);

        const toAdd = incomingIds.filter((id: bigint) => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !incomingIds.includes(id));

        if (toAdd.length > 0) {
          await tx.drawproduct.updateMany({
            where: { id: { in: toAdd } },
            data: { drawId: drawId }
          });
        }

        if (toRemove.length > 0) {
          const safeToDelete = await tx.drawproduct.findMany({
            where: { 
              id: { in: toRemove },
              winner: { none: {} }
            },
            select: { id: true }
          });
          
          const safeIds = safeToDelete.map(p => p.id);

          if (safeIds.length > 0) {
            await tx.drawproduct.deleteMany({
              where: { id: { in: safeIds } }
            });
          }
        }
      }
    });

    const updatedDraw = await prisma.draw.findUnique({
      where: { id: drawId },
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