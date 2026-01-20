import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const userId = BigInt(id); // BigInt as per schema

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tickets: {
          include: { draw: true },
          orderBy: { createdAt: "desc" },
        },
        payment: {
          include: { draw: true },
          orderBy: { createdAt: "desc" },
        },
        walletTransactions: {
          orderBy: { createdAt: "desc" },
        },
        winners: {
          include: {
            draw: true,
            drawproduct: true,
          },
        },
      },
    });

    if (!user) return errorResponse("User not found", 404);

    return jsonResponse({ user });
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

        // ✅ IMPORTANT: unwrap params
        const { id } = await context.params;

        if (!id) {
            return errorResponse("User ID required", 400);
        }

        // ⚠️ Use BigInt ONLY if your Prisma ID is BigInt
        const userId = BigInt(id);

        const body = await request.json();
        const { isActive } = body;

        if (typeof isActive !== "boolean") {
            return errorResponse("Invalid isActive value", 400);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return errorResponse("User not found", 404);
        }

        // 🔒 Admin self-protection
        if (user.id === BigInt(admin.id)) {
            return errorResponse("You cannot block yourself", 400);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            },
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
