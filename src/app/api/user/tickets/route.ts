import { eq, and, desc, SQL } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  db,
  ticket,
  draw,
  payment,
  payment_status,
  payment_method,
  payment_gateway,
  ticket_status,
} from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

/* =========================
   GET — User's tickets
========================= */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    let status: ticket_status | undefined;
    if (
      statusParam &&
      Object.values(ticket_status).includes(statusParam as ticket_status)
    ) {
      status = statusParam as ticket_status;
    }

    const conditions: SQL[] = [eq(ticket.userId, BigInt(user.id))];
    if (status) {
      conditions.push(eq(ticket.status, status));
    }

    const tickets = await db.query.ticket.findMany({
      where: and(...conditions),
      orderBy: [desc(ticket.createdAt)],
      with: {
        draw: {
          columns: {
            id: true,
            title: true,
            status: true,
            endTime: true,
            resultAt: true,
          },
        },
        payment: {
          columns: {
            amount: true,
            status: true,
            method: true,
          },
        },
      },
    });

    return jsonResponse(tickets);
  } catch (error) {
    console.error("GET USER TICKETS ERROR:", error);
    return errorResponse("Server error", 500);
  }
}

/* =========================
   POST — Submit payment (Requesting a Ticket)
========================= */
interface TicketRequestBody {
  drawId?: string | number;
  transactionId?: string;
  screenshot?: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body: TicketRequestBody = await req.json();
    const { drawId, transactionId, screenshot } = body;

    if (!drawId || !transactionId || !screenshot) {
      return errorResponse(
        "Missing required fields (drawId, transactionId, screenshot)",
        400
      );
    }

    const drawBigInt = BigInt(drawId);

    // 1. Validate Draw
    const foundDraw = await db.query.draw.findFirst({
      where: eq(draw.id, drawBigInt),
      columns: { id: true, entryFee: true, status: true, endTime: true },
    });

    if (!foundDraw) return errorResponse("Draw not found", 404);
    if (foundDraw.status !== "LIVE") return errorResponse("Draw is not live", 400);
    if (new Date() > new Date(foundDraw.endTime))
      return errorResponse("Draw has ended", 400);

    // 2. Prevent Double Spend
    const existing = await db.query.payment.findFirst({
      where: eq(payment.transactionId, transactionId),
    });

    if (existing)
      return errorResponse(
        "This Transaction ID has already been used",
        409
      );

    // 3. Create Payment Record
    const [createdPayment] = await db
      .insert(payment)
      .values({
        userId: BigInt(user.id),
        drawId: drawBigInt,
        amount: foundDraw.entryFee,
        transactionId,
        screenshot,
        status: payment_status.PENDING,
        method: payment_method.UPI,
        gateway: payment_gateway.MANUAL,
      })
      .returning();

    return jsonResponse(
      {
        message:
          "Payment submitted successfully! Ticket will be generated upon approval.",
        payment: createdPayment,
      },
      201
    );
  } catch (error) {
    console.error("POST PAYMENT ERROR:", error);
    return errorResponse("Server error", 500);
  }
}
