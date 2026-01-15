// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Ensure this is the singleton
import { generateToken, setAuthCookie } from "@/lib/auth";
import { user_role } from "@/generated/client/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.mobile || !body.password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    // Use singleton prisma
    const user = await prisma.user.findUnique({
      where: { mobile: body.mobile },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, message: "Account disabled" }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(user.id.toString(), user.role);
    await setAuthCookie(token);

    const redirectUrl = user.role === user_role.ADMIN ? "/admin/dashboard" : "/";

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id.toString(),
          role: user.role,
        },
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}