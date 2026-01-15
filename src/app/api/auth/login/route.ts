// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { user_role } from "@/generated/client/client";

/* ===================== LOGIN ===================== */

export async function POST(req: Request) {
  try {
    const body: {
      mobile?: string;
      password?: string;
    } = await req.json();

    /* ---------- VALIDATION ---------- */
    if (!body.mobile || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile and password are required",
        },
        { status: 400 }
      );
    }

    /* ---------- FIND USER ---------- */
    const user = await prisma.user.findUnique({
      where: { mobile: body.mobile },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        password: true,
        role: true,
        isActive: true,
        avatar: true,
        wallet: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been deactivated. Please contact support.",
        },
        { status: 403 }
      );
    }

    /* ---------- PASSWORD CHECK ---------- */
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    /* ---------- JWT & COOKIE ---------- */
    const token = generateToken(user.id.toString(), user.role);
    await setAuthCookie(token);

    /* ---------- RESPONSE WITH REDIRECT URL ---------- */
    const redirectUrl = user.role === user_role.ADMIN 
      ? "/admin/dashboard" 
      : "/";

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          avatar: user.avatar,
          wallet: user.wallet,
          createdAt: user.createdAt,
        },
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error. Please try again.",
      },
      { status: 500 }
    );
  }
}