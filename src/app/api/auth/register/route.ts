// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { user_role } from "@/generated/client/client";

/* ===================== REGISTER ===================== */

export async function POST(req: Request) {
  try {
    const body: {
      name?: string;
      mobile?: string;
      email?: string;
      password?: string;
    } = await req.json();

    /* ---------- VALIDATION ---------- */
    if (!body.name || !body.mobile || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, mobile, and password are required",
        },
        { status: 400 }
      );
    }

    // Validate mobile format (basic)
    if (!/^\d{10}$/.test(body.mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit mobile number",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    /* ---------- MOBILE CHECK ---------- */
    const existingMobile = await prisma.user.findUnique({
      where: { mobile: body.mobile },
      select: { id: true },
    });

    if (existingMobile) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this mobile number already exists",
        },
        { status: 409 }
      );
    }

    /* ---------- EMAIL CHECK ---------- */
    if (body.email) {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json(
          {
            success: false,
            message: "Please enter a valid email address",
          },
          { status: 400 }
        );
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true },
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "This email is already registered",
          },
          { status: 409 }
        );
      }
    }

    /* ---------- CREATE USER ---------- */
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        mobile: body.mobile,
        email: body.email || null,
        password: hashedPassword,
        role: user_role.USER, // Always create as USER
        isActive: true,
        wallet: 0,
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please login to continue.",
      data: {
        id: user.id.toString(),
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/register ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error. Please try again.",
      },
      { status: 500 }
    );
  }
}