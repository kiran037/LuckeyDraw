import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db, winner } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    const winners = await db.query.winner.findMany({
      where: eq(winner.drawId, BigInt(id)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        ticket: {
          columns: {
            ticketCode: true,
          },
        },
        drawproduct: {
          columns: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [desc(winner.declaredAt)],
    });

    return jsonResponse({ winners });
  } catch (error: unknown) {
    console.error("Error fetching winners:", error);
    return errorResponse("Failed to fetch winners", 500);
  }
}
