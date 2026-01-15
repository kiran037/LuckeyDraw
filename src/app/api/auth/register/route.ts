import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { user_role } from "@/generated/client/client"; // Or your generated path

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validation
    if (!body.name || !body.mobile || !body.password) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(body.mobile)) {
      return NextResponse.json({ success: false, message: "Invalid mobile number" }, { status: 400 });
    }
    if (body.password.length < 6) {
      return NextResponse.json({ success: false, message: "Password too short" }, { status: 400 });
    }

    // 2. Check Duplicates
    const [existingMobile, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { mobile: body.mobile }, select: { id: true } }),
      body.email ? prisma.user.findUnique({ where: { email: body.email }, select: { id: true } }) : null
    ]);

    if (existingMobile) {
      return NextResponse.json({ success: false, message: "Mobile already registered" }, { status: 409 });
    }
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
    }

    // 3. Create User (REMOVED WALLET HERE)
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        mobile: body.mobile,
        email: body.email || null,
        password: hashedPassword,
        role: user_role.USER,
        isActive: true,
      },
      select: { id: true }
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      // Fix: Convert BigInt to string
      data: { id: user.id.toString() }
    });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}