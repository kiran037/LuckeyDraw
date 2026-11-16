import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, user, user_role } from "@/db";
import { generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.mobile || !body.password) {
      return NextResponse.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    const foundUser = await db.query.user.findFirst({
      where: eq(user.mobile, body.mobile),
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!foundUser.isActive) {
      return NextResponse.json(
        { success: false, message: "Account disabled" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(body.password, foundUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Convert BigInt to string for token generation
    const userIdString = foundUser.id.toString();
    const token = generateToken(userIdString, foundUser.role);
    await setAuthCookie(token);

    const redirectUrl =
      foundUser.role === user_role.ADMIN ? "/admin/dashboard" : "/";

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: userIdString,
          name: foundUser.name,
          role: foundUser.role,
          avatar: foundUser.avatar,
        },
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
