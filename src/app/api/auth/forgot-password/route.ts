import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, user } from "@/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* ---------- VALIDATION ---------- */
    if (!body.mobile || !body.oldPassword || !body.newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be 6+ chars" },
        { status: 400 }
      );
    }

    /* ---------- FIND USER ---------- */
    const foundUser = await db.query.user.findFirst({
      where: eq(user.mobile, body.mobile),
      columns: { id: true, password: true, isActive: true },
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!foundUser.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated" },
        { status: 403 }
      );
    }

    /* ---------- VERIFY OLD PASSWORD ---------- */
    const isMatch = await bcrypt.compare(body.oldPassword, foundUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect old password" },
        { status: 401 }
      );
    }

    /* ---------- UPDATE PASSWORD ---------- */
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, foundUser.id));

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! Please login.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
