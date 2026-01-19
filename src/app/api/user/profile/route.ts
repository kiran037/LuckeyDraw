import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/* =====================================================
   GET : Fetch User Profile + Stats (Wallet + Referral)
===================================================== */
export async function GET() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(sessionUser.id);

    const [
      totalTickets,
      winningTickets,
      unreadNotifications,
      dbUser,
      referredUsers,
    ] = await Promise.all([
      prisma.ticket.count({ where: { userId } }),
      prisma.ticket.count({ where: { userId, isWinner: true } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          avatar: true,
          role: true,
          isActive: true,
          wallet: true,
          address: true,
          adharcard: true,
          pancard: true,
          referralCode: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.findMany({
        where: { referredById: userId },
        select: {
          id: true,
          name: true,
          mobile: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: dbUser.id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          mobile: dbUser.mobile,
          role: dbUser.role,
          avatar: dbUser.avatar,
          isActive: dbUser.isActive,
          wallet: dbUser.wallet,
          adharcard: dbUser.adharcard,
          pancard: dbUser.pancard,
          address: dbUser.address,
          referralCode: dbUser.referralCode,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        stats: {
          totalTickets,
          winningTickets,
          unreadNotifications,
        },
      },
    });

  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* =====================================================
   PATCH : Update Profile (NO Wallet / Referral edit)
===================================================== */
interface UserUpdateData {
  name?: string;
  adharcard?: string;
  pancard?: string;
  address?: string;
  avatar?: string | null;
  email?: string;
  mobile?: string;
  password?: string;
}
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

    /* ---------- Basic Info ---------- */
    if (body.name) updateData.name = body.name;
    if (body.adharcard) updateData.adharcard = body.adharcard;
    if (body.pancard) updateData.pancard = body.pancard;
    if (body.address) updateData.address = body.address;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    /* ---------- Email ---------- */
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

    /* ---------- Mobile ---------- */
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

    /* ---------- Password ---------- */
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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
      });
    }

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
        wallet: true,
        adharcard: true,
        pancard: true,
        address: true,
        referralCode: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          ...updatedUser,
          id: updatedUser.id.toString(),
        },
      },
    });

  } catch (error) {
    console.error("PATCH PROFILE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}
