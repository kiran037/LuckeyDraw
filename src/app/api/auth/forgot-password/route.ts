// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body: {
      mobile?: string;
      oldPassword?: string;
      newPassword?: string;
    } = await req.json();

    /* ---------- VALIDATION ---------- */
    if (!body.mobile || !body.oldPassword || !body.newPassword) {
      return NextResponse.json(
        { success: false, message: "Mobile, old password, and new password are required" },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    /* ---------- FIND USER ---------- */
    const user = await prisma.user.findUnique({
      where: { mobile: body.mobile },
      select: { id: true, password: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated" },
        { status: 403 }
      );
    }

    /* ---------- VERIFY OLD PASSWORD ---------- */
    const isMatch = await bcrypt.compare(body.oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect old password" },
        { status: 401 }
      );
    }

    /* ---------- UPDATE PASSWORD ---------- */
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! Please login.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}