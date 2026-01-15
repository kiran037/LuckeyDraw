// src/app/api/user/tickets/[id]/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const safeJson = <T>(data: T): T => JSON.parse(JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
));

export async function GET(
  req: Request,
  // Fix: Type params as a Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Fix: Await the params object
    const { id } = await params;
    
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const ticketId = BigInt(id);
    const userId = BigInt(user.id);

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: {
        draw: {
          include: {
            drawproduct: true // Show prizes
          }
        },
        payment: true,
        winner: {
          include: {
            drawproduct: true // Show won prize
          }
        }
      }
    });

    if (!ticket) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: safeJson(ticket) });

  } catch (error) {
    console.error("GET TICKET DETAIL ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}