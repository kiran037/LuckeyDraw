import { NextRequest } from "next/server";
import { count, eq, ilike, or, and, desc, SQL } from "drizzle-orm";
import {
  db,
  ticket,
  draw,
  user,
  auditlog,
  notification,
  ticket_status,
  ticket_source,
} from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

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

    const conditions: SQL[] = [];

    if (status && Object.values(ticket_status).includes(status)) {
      conditions.push(eq(ticket.status, status));
    }

    if (drawId) conditions.push(eq(ticket.drawId, BigInt(drawId)));
    if (userId) conditions.push(eq(ticket.userId, BigInt(userId)));

    if (search) {
      // Find matching users first if search applies to user info
      const matchingUsers = await db.query.user.findMany({
        where: or(
          ilike(user.name, `%${search}%`),
          ilike(user.mobile, `%${search}%`),
          ilike(user.email, `%${search}%`)
        ),
        columns: { id: true },
      });
      const uIds = matchingUsers.map((u) => u.id);

      const searchConditions: SQL[] = [ilike(ticket.ticketCode, `%${search}%`)];
      if (uIds.length > 0) {
        // add user condition
        searchConditions.push(
          or(...uIds.map((uid) => eq(ticket.userId, uid)))!
        );
      }
      conditions.push(or(...searchConditions)!);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes, ticketsList] = await Promise.all([
      db.select({ count: count() }).from(ticket).where(whereClause),
      db.query.ticket.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(ticket.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              mobile: true,
              avatar: true,
            },
          },
          draw: {
            columns: {
              id: true,
              title: true,
              status: true,
              endTime: true,
            },
          },
          payment: {
            columns: {
              id: true,
              status: true,
              method: true,
              amount: true,
            },
          },
        },
      }),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      tickets: ticketsList,
    });
  } catch (err) {
    console.error("ADMIN GET TICKETS ERROR:", err);
    return errorResponse("Failed to fetch tickets", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await req.json();

    if (!body.drawId || !body.userId)
      return errorResponse("Draw ID and User ID are required", 400);
    const ticketCount = Math.max(1, Number(body.count || 1));

    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, BigInt(body.drawId)),
      with: {
        tickets: { columns: { id: true } },
      },
    });

    if (!foundDraw) return errorResponse("Draw not found", 404);

    const soldCount = (foundDraw.tickets || []).length;
    if (soldCount + ticketCount > foundDraw.maxTickets) {
      return errorResponse(
        `Not enough tickets remaining. Left: ${foundDraw.maxTickets - soldCount}`,
        400
      );
    }

    const ticketsData: (typeof ticket.$inferInsert)[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < ticketCount; i++) {
      ticketsData.push({
        drawId: BigInt(body.drawId),
        userId: BigInt(body.userId),
        ticketCode: `ADM-${timestamp}-${i}-${Math.floor(Math.random() * 10000)}`,
        pricePaid:
          body.pricePaid !== undefined
            ? Number(body.pricePaid)
            : foundDraw.entryFee,
        status: ticket_status.ACTIVE,
        source: ticket_source.ADMIN_MANUAL,
        createdByAdminId: BigInt(admin.id),
      });
    }

    await db.transaction(async (tx) => {
      await tx.insert(ticket).values(ticketsData);

      await tx.insert(notification).values({
        userId: BigInt(body.userId),
        title: "Tickets Issued 🎟️",
        message: `${ticketCount} ticket(s) have been manually issued to your account for "${foundDraw.title}".`,
      });

      await tx.insert(auditlog).values({
        action: "ADMIN_MANUAL_TICKETS",
        entity: "TICKET",
        entityId: foundDraw.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify({
          drawId: foundDraw.id.toString(),
          userId: body.userId,
          ticketCount,
          pricePaid:
            body.pricePaid !== undefined
              ? Number(body.pricePaid)
              : foundDraw.entryFee,
        }),
      });
    });

    return jsonResponse({
      success: true,
      message: `${ticketCount} ticket(s) created successfully`,
    });
  } catch (err) {
    console.error("ADMIN CREATE TICKET ERROR:", err);
    return errorResponse("Failed to create tickets manually", 500);
  }
}
