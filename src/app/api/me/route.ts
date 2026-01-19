import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* -------------------- Types -------------------- */

interface UserUpdateData {
  name?: string;
  avatar?: string | null;
  email?: string;
  mobile?: string;
  password?: string;
}

/* ==================== GET PROFILE ==================== */

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(authUser.id);

    const [dbUser, unreadCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          avatar: true,
          wallet: true,
          referralCode: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🔥 SAFE SERIALIZATION (NO BigInt issues)


    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        mobile: dbUser.mobile,
        role: dbUser.role,
        avatar: dbUser.avatar,
        wallet: dbUser.wallet,
        referralCode: dbUser.referralCode,
        createdAt: dbUser.createdAt,
        unreadCount:unreadCount,
      }
    });

  } catch (error) {
    console.error("ME GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* ==================== UPDATE PROFILE ==================== */

export async function PATCH(req: Request) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updateData: UserUpdateData = {};

    /* -------- Basic Info -------- */
    if (body.name) updateData.name = body.name;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    /* -------- Email -------- */
    if (body.email) {
      const existing = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existing && existing.id.toString() !== authUser.id) {
        return NextResponse.json(
          { success: false, message: "Email already taken" },
          { status: 409 }
        );
      }

      updateData.email = body.email;
    }

    /* -------- Mobile -------- */
    if (body.mobile) {
      const existing = await prisma.user.findUnique({
        where: { mobile: body.mobile },
      });

      if (existing && existing.id.toString() !== authUser.id) {
        return NextResponse.json(
          { success: false, message: "Mobile number already taken" },
          { status: 409 }
        );
      }

      updateData.mobile = body.mobile;
    }

    /* -------- Password -------- */
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password required" },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: BigInt(authUser.id) },
        select: { password: true },
      });

      if (
        !dbUser ||
        !(await bcrypt.compare(body.currentPassword, dbUser.password))
      ) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password" },
          { status: 401 }
        );
      }

      updateData.password = await bcrypt.hash(body.newPassword, 10);
    }

    /* -------- Update -------- */
    const updatedUser = await prisma.user.update({
      where: { id: BigInt(authUser.id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        ...updatedUser,
        id: updatedUser.id.toString(),
      },
    });

  } catch (error) {
    console.error("ME PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}
