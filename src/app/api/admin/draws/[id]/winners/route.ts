import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed
import { requireAdmin } from "@/lib/auth"; // Adjust path if needed
import { jsonResponse, errorResponse } from "@/lib/api-utils"; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check Admin Auth
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    // 2. Fetch Winners with details
    const winners = await prisma.winner.findMany({
      where: {
        drawId: BigInt(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        ticket: {
          select: {
            ticketCode: true,
          },
        },
        drawproduct: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        declaredAt: 'desc',
      },
    });

    // 3. Serialize BigInts before sending
    return jsonResponse({ winners });
    
  } catch (error: unknown) {
    console.error("Error fetching winners:", error);
    return errorResponse("Failed to fetch winners", 500);
  }
}