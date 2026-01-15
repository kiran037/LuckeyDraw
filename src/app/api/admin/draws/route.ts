// src/app/api/admin/draws/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { draw_status } from "@/generated/client/client";

/* =========================
   GET — List all draws (Admin)
========================= */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const draws = await prisma.draw.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        _count: { select: { ticket: true } },
        drawproduct: {
          select: {
            id: true,
            name: true,
            image: true,
            quantity: true,
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: draws.map((d) => ({
        id: d.id.toString(),
        title: d.title,
        description: d.description ?? "",
        bannerImage: d.bannerImage,
        rules: d.rules,
        entryFee: d.entryFee,
        maxTickets: d.maxTickets,
        status: d.status,
        ticketCount: d._count.ticket,
        startTime: d.startTime.toISOString(),
        endTime: d.endTime.toISOString(),
        resultAt: d.resultAt?.toISOString() || null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        products: d.drawproduct.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          image: p.image,
          quantity: p.quantity,
        })),
      })),
    });
  } catch (err) {
    console.error("ADMIN GET DRAWS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — Create draw
========================= */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();

    // Validation
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!body.entryFee || body.entryFee < 0) {
      return NextResponse.json(
        { success: false, message: "Valid entry fee is required" },
        { status: 400 }
      );
    }

    if (!body.maxTickets || body.maxTickets < 1) {
      return NextResponse.json(
        { success: false, message: "Max tickets must be at least 1" },
        { status: 400 }
      );
    }

    if (!body.startTime || !body.endTime) {
      return NextResponse.json(
        { success: false, message: "Start and end times are required" },
        { status: 400 }
      );
    }

    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, message: "End time must be after start time" },
        { status: 400 }
      );
    }

    const draw = await prisma.draw.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        bannerImage: body.bannerImage || null,
        rules: body.rules?.trim() || null,
        entryFee: Number(body.entryFee),
        maxTickets: Number(body.maxTickets),
        startTime,
        endTime,
        status: body.status || draw_status.DRAFT,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Draw created successfully",
      data: {
        id: draw.id.toString(),
        title: draw.title,
        status: draw.status,
      },
    });
  } catch (err) {
    console.error("ADMIN CREATE DRAW ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}