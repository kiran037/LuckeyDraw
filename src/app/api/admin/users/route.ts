import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { Prisma, user_role } from "@/generated/client/client";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as user_role | undefined;

    const where: Prisma.userWhereInput = {};

    if (role && Object.values(user_role).includes(role)) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

    return jsonResponse({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      users,
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}
