// src/app/api/admin/draws/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma, draw_status } from "@/generated/client/client";

/* =========================
   GET — Draw by ID
========================= */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid draw id" },
        { status: 400 }
      );
    }

    const draw = await prisma.draw.findUnique({
      where: { id: BigInt(id) },
      include: { 
        _count: { select: { ticket: true } },
        drawproduct: true,
      },
    });

    if (!draw) {
      return NextResponse.json(
        { success: false, message: "Draw not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: draw.id.toString(),
        title: draw.title,
        description: draw.description ?? "",
        bannerImage: draw.bannerImage,
        rules: draw.rules,
        entryFee: draw.entryFee,
        maxTickets: draw.maxTickets,
        startTime: draw.startTime.toISOString(),
        endTime: draw.endTime.toISOString(),
        resultAt: draw.resultAt?.toISOString() || null,
        status: draw.status,
        ticketCount: draw._count.ticket,
        createdAt: draw.createdAt.toISOString(),
        updatedAt: draw.updatedAt.toISOString(),
        products: draw.drawproduct.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          image: p.image,
          quantity: p.quantity,
          description: p.description,
        })),
      },
    });
  } catch (err) {
    console.error("ADMIN GET DRAW ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT — Update draw
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid draw id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const existing = await prisma.draw.findUnique({
      where: { id: BigInt(id) },
      select: { 
        status: true,
        _count: { select: { ticket: true } }
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Draw not found" },
        { status: 404 }
      );
    }

    const ticketCount = existing._count.ticket;

    /* =========================
       Validation
    ========================= */
    if (body.startTime && body.endTime) {
      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);
      
      if (startTime >= endTime) {
        return NextResponse.json(
          { success: false, message: "End time must be after start time" },
          { status: 400 }
        );
      }
    }

    if (body.maxTickets !== undefined && body.maxTickets < ticketCount) {
      return NextResponse.json(
        { success: false, message: `Cannot reduce max tickets below ${ticketCount} (already sold)` },
        { status: 400 }
      );
    }

    /* =========================
       Build update payload
    ========================= */
    const updateData: Prisma.drawUpdateInput = {};

    if (typeof body.title === "string" && body.title.trim()) {
      updateData.title = body.title.trim();
    }

    if ("description" in body) {
      updateData.description = body.description?.trim() || null;
    }

    if ("bannerImage" in body) {
      updateData.bannerImage = body.bannerImage || null;
    }

    if ("rules" in body) {
      updateData.rules = body.rules?.trim() || null;
    }

    // Don't allow changing entry fee if tickets already sold
    if (body.entryFee !== undefined && ticketCount === 0) {
      updateData.entryFee = Number(body.entryFee);
    }

    if (body.maxTickets !== undefined) {
      updateData.maxTickets = Number(body.maxTickets);
    }

    if (body.startTime) {
      updateData.startTime = new Date(body.startTime);
    }

    if (body.endTime) {
      updateData.endTime = new Date(body.endTime);
    }

    if (body.status) {
      updateData.status = body.status as draw_status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.draw.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Draw updated successfully",
      data: {
        id: updated.id.toString(),
        title: updated.title,
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("ADMIN UPDATE DRAW ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — Delete draw
========================= */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid draw id" },
        { status: 400 }
      );
    }

    const draw = await prisma.draw.findUnique({
      where: { id: BigInt(id) },
      select: { _count: { select: { ticket: true } } },
    });

    if (!draw) {
      return NextResponse.json(
        { success: false, message: "Draw not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion if tickets exist
    if (draw._count.ticket > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete draw with existing tickets" },
        { status: 400 }
      );
    }

    await prisma.draw.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Draw deleted successfully",
    });
  } catch (err) {
    console.error("ADMIN DELETE DRAW ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}