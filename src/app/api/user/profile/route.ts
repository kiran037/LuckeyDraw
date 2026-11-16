import { NextResponse } from "next/server";
import { count, eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { db, user, ticket, notification } from "@/db";

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
      totalTicketsRes,
      winningTicketsRes,
      unreadNotificationsRes,
      dbUser,
    ] = await Promise.all([
      db.select({ count: count() }).from(ticket).where(eq(ticket.userId, userId)),
      db
        .select({ count: count() })
        .from(ticket)
        .where(and(eq(ticket.userId, userId), eq(ticket.isWinner, true))),
      db
        .select({ count: count() })
        .from(notification)
        .where(
          and(eq(notification.userId, userId), eq(notification.isRead, false))
        ),
      db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
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
    ]);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const totalTickets = Number(totalTicketsRes[0]?.count ?? 0);
    const winningTickets = Number(winningTicketsRes[0]?.count ?? 0);
    const unreadNotifications = Number(unreadNotificationsRes[0]?.count ?? 0);

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
      const existing = await db.query.user.findFirst({
        where: eq(user.email, body.email),
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
      const existing = await db.query.user.findFirst({
        where: eq(user.mobile, body.mobile),
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

      const dbUser = await db.query.user.findFirst({
        where: eq(user.id, BigInt(authUser.id)),
        columns: { password: true },
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

    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, BigInt(authUser.id)))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
        wallet: user.wallet,
        adharcard: user.adharcard,
        pancard: user.pancard,
        address: user.address,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
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
