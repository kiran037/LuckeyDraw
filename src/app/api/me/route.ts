///Users/xeoren/Desktop/lucky_draw/src/app/api/me/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Strict type definition
interface UserUpdateData {
  name?: string;
  avatar?: string | null;
  email?: string;
  mobile?: string;
  password?: string;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const dbUser = await prisma.user.findUnique({
      where: { id: BigInt(user.id) }
    });

    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Manual serialization to avoid BigInt error
    const safeUser = {
      ...dbUser,
      id: dbUser.id.toString(), // Convert BigInt
      password: undefined, // Don't send password
    };

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updateData: UserUpdateData = {};

    // --- 1. Basic Info ---
    if (body.name) updateData.name = body.name;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    // --- 2. Unique Fields ---
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

    // --- 4. Execute Update (REMOVED WALLET FROM SELECT) ---
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
        // wallet: true, // REMOVED
        createdAt: true 
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: { 
        ...updatedUser, 
        id: updatedUser.id.toString() // Convert BigInt
      },
    });

  } catch (error) {
    console.error("PATCH PROFILE ERROR:", error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}