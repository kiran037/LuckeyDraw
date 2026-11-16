import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, user, ticket, payment, walletTransaction, winner } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const userId = BigInt(id);

    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        tickets: {
          with: { draw: true },
          orderBy: [desc(ticket.createdAt)],
        },
        payments: {
          with: { draw: true },
          orderBy: [desc(payment.createdAt)],
        },
        walletTransactions: {
          orderBy: [desc(walletTransaction.createdAt)],
        },
        winners: {
          with: {
            draw: true,
            drawproduct: true,
          },
        },
      },
    });

    if (!foundUser) return errorResponse("User not found", 404);

    return jsonResponse({
      user: {
        ...foundUser,
        payment: foundUser.payments,
      },
    });
  } catch (err) {
    console.error("GET USER VIEW ERROR:", err);
    return errorResponse("Failed to fetch user", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    if (!id) {
      return errorResponse("User ID required", 400);
    }

    const userId = BigInt(id);

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return errorResponse("Invalid isActive value", 400);
    }

    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) {
      return errorResponse("User not found", 404);
    }

    // Admin self-protection
    if (foundUser.id === BigInt(admin.id)) {
      return errorResponse("You cannot block yourself", 400);
    }

    const [updatedUser] = await db
      .update(user)
      .set({ isActive })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });

    return jsonResponse({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("ADMIN UPDATE USER ERROR:", error);
    return errorResponse("Failed to update user", 500);
  }
}
