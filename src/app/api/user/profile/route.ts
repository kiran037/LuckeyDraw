import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// --- GET: Fetch Profile & Stats ---
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
    ] = await Promise.all([
      prisma.ticket.count({
        where: { userId },
      }),

      prisma.ticket.count({
        where: {
          userId,
          isWinner: true,
        },
      }),

      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),

      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          mobile: true,
          avatar: true,
          role: true,
          isActive: true,
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

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: sessionUser.id,
          name: dbUser.name,
          email: dbUser.email,
          mobile: dbUser.mobile,
          role: dbUser.role,
          avatar: dbUser.avatar,
          isActive: dbUser.isActive,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        stats: {
          // Wrap in Number() to prevent BigInt serialization crash
          totalTickets: Number(totalTickets),
          winningTickets: Number(winningTickets),
          unreadNotifications: Number(unreadNotifications),
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

// --- PATCH: Update Profile ---
interface UserUpdateData {
  name?: string;
  avatar?: string | null;
  email?: string;
  mobile?: string;
  password?: string;
}

export async function PATCH(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updateData: UserUpdateData = {};

    // --- 1. Basic Info ---
    if (body.name) updateData.name = body.name;
    
    // Handle Avatar (allow null to remove)
    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar;
    }

    // --- 2. Unique Fields (Email/Mobile) ---
    if (body.email) {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing && existing.id.toString() !== authUser.id) {
        return NextResponse.json({ success: false, message: "Email already taken" }, { status: 409 });
      }
      updateData.email = body.email;
    }

    if (body.mobile) {
      const existing = await prisma.user.findUnique({ where: { mobile: body.mobile } });
      if (existing && existing.id.toString() !== authUser.id) {
        return NextResponse.json({ success: false, message: "Mobile number already taken" }, { status: 409 });
      }
      updateData.mobile = body.mobile;
    }

    // --- 3. Password ---
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ success: false, message: "Current password required" }, { status: 400 });
      }

      const dbUser = await prisma.user.findUnique({ 
        where: { id: BigInt(authUser.id) },
        select: { password: true } 
      });

      if (!dbUser || !(await bcrypt.compare(body.currentPassword, dbUser.password))) {
        return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 401 });
      }

      updateData.password = await bcrypt.hash(body.newPassword, 10);
    }

    // --- 4. Execute Update ---
    // If no data to update, return early
    if (Object.keys(updateData).length === 0) {
       return NextResponse.json({ success: true, message: "No changes detected" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(authUser.id) },
      data: updateData,
      select: {
        id: true, name: true, email: true, mobile: true, 
        role: true, avatar: true, wallet: true, createdAt: true 
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      // Return formatted user to update frontend state immediately
      data: { 
        user: { 
          ...updatedUser, 
          id: updatedUser.id.toString() 
        } 
      },
    });

  } catch (error) {
    console.error("PATCH PROFILE ERROR:", error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}