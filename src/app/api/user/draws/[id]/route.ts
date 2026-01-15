import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 

// Helper to handle BigInt serialization safely
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function GET(
  request: Request,
  // 1. Correctly type the params as a Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 2. Await the params before accessing properties (Critical for Next.js 15)
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });
    }

    const drawId = BigInt(id);
    const sessionUser = await getCurrentUser(); 

    // 3. Fetch Draw
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        drawproduct: true,
        winner: {
          include: {
            user: { select: { name: true, avatar: true } },
            drawproduct: { select: { name: true, image: true } }
          }
        }
      }
    });

    if (!draw) {
      return NextResponse.json({ success: false, message: "Draw not found" }, { status: 404 });
    }

    // 4. Count Sold Tickets
    const soldTickets = await prisma.ticket.count({
      where: { drawId: drawId, status: 'ACTIVE' }
    });

    // 5. Check User Status
    let hasJoined = false;
    let pendingPayment = false;

    if (sessionUser) {
      const userId = BigInt(sessionUser.id);
      const ticket = await prisma.ticket.findFirst({
        where: { drawId: drawId, userId: userId, status: 'ACTIVE' }
      });
      if (ticket) hasJoined = true;

      if (!hasJoined) {
        const payment = await prisma.payment.findFirst({
          where: { drawId: drawId, userId: userId, status: 'PENDING' }
        });
        if (payment) pendingPayment = true;
      }
    }

    // 6. Construct Response
    const total = draw.maxTickets;
    const progress = total > 0 ? Math.min(Math.round((soldTickets / total) * 100), 100) : 0;
    const left = Math.max(0, total - soldTickets);

    const responseData = {
      ...draw, 
      stats: {
        sold: soldTickets,
        total: total,
        progress: progress,
        left: left
      },
      hasJoined,
      pendingPayment,
      isExpired: new Date() > new Date(draw.endTime)
    };

    return NextResponse.json(serialize({
      success: true,
      data: responseData
    }));

  } catch (error) {
    console.error("GET Draw Details Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}