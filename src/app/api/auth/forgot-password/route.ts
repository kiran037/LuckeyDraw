// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/* ===================== FORGOT PASSWORD (MOBILE-BASED RESET) ===================== */

export async function POST(req: Request) {
  try {
    const body: {
      mobile?: string;
      newPassword?: string;
    } = await req.json();

    /* ---------- VALIDATION ---------- */
    if (!body.mobile || !body.newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number and new password are required",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    /* ---------- FIND USER ---------- */
    const user = await prisma.user.findUnique({
      where: { mobile: body.mobile },
      select: { id: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this mobile number",
        },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is deactivated. Please contact support.",
        },
        { status: 403 }
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
      message: "Password reset successful! Please login with your new password.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error. Please try again.",
      },
      { status: 500 }
    );
  }
}

/* ===================== NOTE ===================== */
/*
  In a production app, you would:
  1. Send OTP to mobile number for verification
  2. Verify OTP before allowing password reset
  3. Consider rate limiting
  
  For simplicity, this implementation allows password reset with just mobile number.
  You can enhance it by adding OTP verification.
*/