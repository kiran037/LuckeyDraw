import { NextRequest } from "next/server";
import { eq, sum, inArray } from "drizzle-orm";
import {
  db,
  draw,
  drawproduct,
  ticket,
  draw_status,
} from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const drawId = BigInt(id);

    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, drawId),
      with: {
        drawproducts: true,
        tickets: { columns: { id: true } },
      },
    });

    if (!foundDraw) return errorResponse("Draw not found", 404);

    const revenueRes = await db
      .select({ total: sum(ticket.pricePaid) })
      .from(ticket)
      .where(eq(ticket.drawId, drawId));

    const sold = (foundDraw.tickets || []).length;
    const totalRevenue = Number(revenueRes[0]?.total ?? 0);
    const percentage =
      foundDraw.maxTickets > 0 ? (sold / foundDraw.maxTickets) * 100 : 0;

    const serializedDraw = {
      id: foundDraw.id.toString(),
      title: foundDraw.title,
      description: foundDraw.description,
      bannerImage: foundDraw.bannerImage,
      rules: foundDraw.rules,
      entryFee: foundDraw.entryFee,
      maxTickets: foundDraw.maxTickets,
      startTime: new Date(foundDraw.startTime).toISOString(),
      endTime: new Date(foundDraw.endTime).toISOString(),
      status: foundDraw.status,
      createdAt: new Date(foundDraw.createdAt).toISOString(),
      drawproduct: (foundDraw.drawproducts || []).map((p) => ({
        id: p.id.toString(),
        name: p.name,
        image: p.image,
        quantity: p.quantity,
        description: p.description,
      })),
    };

    return jsonResponse({
      draw: serializedDraw,
      stats: {
        sold,
        remaining: foundDraw.maxTickets - sold,
        percentage: parseFloat(percentage.toFixed(2)),
        totalRevenue,
      },
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

    const existingDraw = await db.query.draw.findFirst({
      where: eq(draw.id, drawId),
      with: {
        tickets: { columns: { id: true } },
        drawproducts: { columns: { id: true } },
      },
    });

    if (!existingDraw) return errorResponse("Draw not found", 404);
    const soldCount = (existingDraw.tickets || []).length;

    if (body.maxTickets && body.maxTickets < soldCount) {
      return errorResponse(
        `Cannot reduce max tickets below sold count (${soldCount})`,
        400
      );
    }
    if (
      soldCount > 0 &&
      body.entryFee !== undefined &&
      body.entryFee !== existingDraw.entryFee
    ) {
      return errorResponse(
        "Cannot change Entry Fee after tickets have been sold",
        400
      );
    }
    if (body.startTime && body.endTime) {
      if (new Date(body.startTime) >= new Date(body.endTime)) {
        return errorResponse("End time must be after start time", 400);
      }
    }

    const updateData: Partial<typeof draw.$inferInsert> = {};
    if (body.title) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    if (body.rules !== undefined) updateData.rules = body.rules;
    if (body.status) updateData.status = body.status as draw_status;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.maxTickets) updateData.maxTickets = Number(body.maxTickets);
    if (soldCount === 0 && body.entryFee !== undefined)
      updateData.entryFee = Number(body.entryFee);

    await db.transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.update(draw).set(updateData).where(eq(draw.id, drawId));
      }

      if (Array.isArray(body.productIds)) {
        const incomingIds = body.productIds.map((pid: string | number) =>
          BigInt(pid)
        );
        const currentIds = (existingDraw.drawproducts || []).map((p) => p.id);

        const toAdd = incomingIds.filter(
          (pid: bigint) => !currentIds.includes(pid)
        );
        const toRemove = currentIds.filter(
          (pid: bigint) => !incomingIds.includes(pid)
        );

        if (toAdd.length > 0) {
          await tx
            .update(drawproduct)
            .set({ drawId })
            .where(inArray(drawproduct.id, toAdd));
        }

        if (toRemove.length > 0) {
          const safeToDelete = await tx.query.drawproduct.findMany({
            where: inArray(drawproduct.id, toRemove),
            with: {
              winners: { columns: { id: true } },
            },
          });

          const safeIds = safeToDelete
            .filter((p) => !p.winners || p.winners.length === 0)
            .map((p) => p.id);

          if (safeIds.length > 0) {
            await tx
              .delete(drawproduct)
              .where(inArray(drawproduct.id, safeIds));
          }
        }
      }
    });

    const updatedDraw = await db.query.draw.findFirst({
      where: eq(draw.id, drawId),
      with: { drawproducts: true },
    });

    return jsonResponse({
      success: true,
      message: "Draw updated successfully",
      draw: updatedDraw,
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

    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, drawId),
      with: {
        tickets: { columns: { id: true } },
      },
    });

    if (!foundDraw) return errorResponse("Draw not found", 404);

    if ((foundDraw.tickets || []).length > 0) {
      return errorResponse(
        "Cannot delete a draw that has active tickets.",
        400
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(drawproduct).where(eq(drawproduct.drawId, drawId));
      await tx.delete(draw).where(eq(draw.id, drawId));
    });

    return jsonResponse({
      success: true,
      message: "Draw deleted successfully",
    });
  } catch (err) {
    console.error("ADMIN DELETE DRAW ERROR:", err);
    return errorResponse("Failed to delete draw", 500);
  }
}
