import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; 

// Helper to handle BigInt serialization
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function GET(
  request: Request,
  // FIX 1: Update type definition to Promise<{ id: string }>
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX 2: Await the params before using them
    const { id } = await params;

    const sessionUser = await getCurrentUser(); 
    const drawId = BigInt(id);

    // 1. Fetch Draw, Products, and Winner if declared
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        drawproduct: true,
        winner: {
          include: {
            user: {
              select: { name: true, avatar: true }
            },
            drawproduct: {
              select: { name: true, image: true }
            }
          }
        }
      }
    });

    if (!draw) {
      return NextResponse.json({ success: false, message: "Draw not found" }, { status: 404 });
    }

    // 2. Count Sold Tickets
    const soldTickets = await prisma.ticket.count({
      where: { 
        drawId: drawId,
        status: 'ACTIVE'
      }
    });

    // 3. Check if current user has joined (if logged in)
    let userTicket = null;
    if (sessionUser) {
      userTicket = await prisma.ticket.findFirst({
        where: {
          drawId: drawId,
          userId: BigInt(sessionUser.id),
          status: 'ACTIVE'
        }
      });
    }

    // 4. Calculate Percentage
    const progress = Math.min(Math.round((soldTickets / draw.maxTickets) * 100), 100);

    return NextResponse.json(serialize({
      success: true,
      data: {
        ...draw,
        stats: {
          sold: soldTickets,
          total: draw.maxTickets,
          progress,
          left: draw.maxTickets - soldTickets
        },
        hasJoined: !!userTicket,
        userTicketId: userTicket?.id || null,
        isExpired: new Date() > new Date(draw.endTime)
      }
    }));

  } catch (error) {
    console.error("Draw Details Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}