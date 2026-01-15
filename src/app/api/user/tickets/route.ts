// src/app/api/user/tickets/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// FIX: Added 'ticket_status' and 'Prisma' to the imports
import { 
  payment_status, 
  payment_method, 
  payment_gateway, 
  ticket_status, 
  Prisma 
} from "@/generated/client/client";

// Helper for safe JSON with BigInt handling
const safeJson = <T>(data: T): T => JSON.parse(JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
));

/* =========================
   GET — User's tickets
========================= */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    
    // Validate if the status param matches the enum, otherwise ignore it
    const status = Object.values(ticket_status).includes(statusParam as ticket_status) 
      ? (statusParam as ticket_status) 
      : undefined;

    // FIX: Prisma.ticketWhereInput is now valid because Prisma is imported
    const whereClause: Prisma.ticketWhereInput = { 
      userId: BigInt(user.id),
      ...(status && { status }) 
    };

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        draw: {
          select: {
            id: true,
            title: true,
            status: true,
            endTime: true,
            resultAt: true,
          }
        },
        payment: {
          select: {
            amount: true,
            status: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: safeJson(tickets),
    });
  } catch (error) {
    console.error("GET USER TICKETS ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* =========================
   POST — Submit payment for ticket
========================= */
interface TicketRequestBody {
  drawId?: string | number;
  transactionId?: string;
  screenshot?: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body: TicketRequestBody = await req.json();
    const { drawId, transactionId, screenshot } = body;

    if (!drawId || !transactionId || !screenshot) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const drawBigInt = BigInt(drawId);
    
    // 1. Validate Draw
    const draw = await prisma.draw.findUnique({
      where: { id: drawBigInt },
      select: { id: true, entryFee: true, status: true, endTime: true }
    });

    if (!draw) return NextResponse.json({ success: false, message: "Draw not found" }, { status: 404 });
    if (draw.status !== 'LIVE') return NextResponse.json({ success: false, message: "Draw is not live" }, { status: 400 });
    if (new Date() > draw.endTime) return NextResponse.json({ success: false, message: "Draw has ended" }, { status: 400 });

    // 2. Prevent Double Spend
    const existing = await prisma.payment.findUnique({ where: { transactionId } });
    if (existing) return NextResponse.json({ success: false, message: "Transaction ID used" }, { status: 409 });

    // 3. Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        userId: BigInt(user.id),
        drawId: drawBigInt,
        amount: draw.entryFee,
        transactionId,
        screenshot,
        status: payment_status.PENDING,
        method: payment_method.UPI,
        gateway: payment_gateway.MANUAL,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment submitted! Waiting for approval.",
      data: safeJson(payment)
    });

  } catch (error) {
    console.error("POST PAYMENT ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}