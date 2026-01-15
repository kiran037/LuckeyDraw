import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { ticket_status, ticket_source, Prisma } from "@/generated/client/client";

/* =========================
   GET — List Tickets (Advanced)
   Query: page, limit, search, status, drawId, userId
========================= */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ticket_status | undefined;
    const drawId = searchParams.get("drawId");
    const userId = searchParams.get("userId");

    // Build Filter Query
    const where: Prisma.ticketWhereInput = {};

    if (status && Object.values(ticket_status).includes(status)) {
      where.status = status;
    }

    if (drawId) where.drawId = BigInt(drawId);
    if (userId) where.userId = BigInt(userId);

    // Advanced Search (Ticket Code OR User Name OR User Mobile)
    if (search) {
      where.OR = [
        { ticketCode: { contains: search } }, 
        { user: { name: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    // Transaction for Count + Data
    const [total, tickets] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, mobile: true, avatar: true }
          },
          draw: {
            select: { id: true, title: true, status: true, endTime: true }
          },
          payment: {
            select: { id: true, status: true, method: true, amount: true }
          }
        },
      }),
    ]);

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      tickets,
    });

  } catch (err) {
    console.error("ADMIN GET TICKETS ERROR:", err);
    return errorResponse("Failed to fetch tickets", 500);
  }
}

/* =========================
   POST — Manually Create Ticket (Admin)
   Usage: Assign tickets to a user manually (e.g. offline sale)
========================= */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    
    // Validation
    if (!body.drawId || !body.userId) return errorResponse("Draw ID and User ID are required", 400);
    const count = Math.max(1, Number(body.count || 1)); // Number of tickets to generate
    
    // Check if Draw exists and is valid
    const draw = await prisma.draw.findUnique({
      where: { id: BigInt(body.drawId) },
      select: { 
        id: true, 
        entryFee: true, 
        maxTickets: true, 
        _count: { select: { ticket: true } } 
      } 
    });

    if (!draw) return errorResponse("Draw not found", 404);

    // Check availability
    if (draw._count.ticket + count > draw.maxTickets) {
      return errorResponse(`Not enough tickets remaining. Left: ${draw.maxTickets - draw._count.ticket}`, 400);
    }

    // Generate Tickets
    const ticketsData = [];
    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
      // Added 'i' to ticketCode to ensure uniqueness in batch generation
      ticketsData.push({
        drawId: BigInt(body.drawId),
        userId: BigInt(body.userId),
        ticketCode: `ADM-${timestamp}-${i}-${Math.floor(Math.random() * 10000)}`, 
        pricePaid: body.pricePaid !== undefined ? Number(body.pricePaid) : draw.entryFee,
        status: ticket_status.ACTIVE,
        source: ticket_source.ADMIN_MANUAL,
        createdByAdminId: BigInt(admin.id),
      });
    }

    await prisma.ticket.createMany({
      data: ticketsData
    });

    return jsonResponse({
      success: true,
      message: `${count} ticket(s) created successfully`,
    });

  } catch (err) {
    console.error("ADMIN CREATE TICKET ERROR:", err);
    return errorResponse("Failed to create tickets manually", 500);
  }
}