import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { user_role } from "@/generated/client/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, mobile, email, password, referralCode } = body;

    // 1. Validation (same)
    if (!name || !mobile || !password) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ success: false, message: "Invalid mobile number" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password too short" }, { status: 400 });
    }

    // 2. Duplicate check (same)
    const [existingMobile, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { mobile } }),
      email ? prisma.user.findUnique({ where: { email } }) : null,
    ]);

    if (existingMobile) {
      return NextResponse.json({ success: false, message: "Mobile already registered" }, { status: 409 });
    }

    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
    }

    // 🔥 3. Referral lookup (NEW)
    let referredBy = null;
    if (referralCode) {
      referredBy = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true, wallet: true },
      });

      if (!referredBy) {
        return NextResponse.json({ success: false, message: "Invalid referral code" }, { status: 400 });
      }
    }

    // 🔥 4. Referral config (NEW)
    const config = await prisma.referral_config.findFirst({
      where: { isActive: true },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 5. TRANSACTION (IMPORTANT)
    const user = await prisma.$transaction(async (tx) => {
      // create user
      const newUser = await tx.user.create({
        data: {
          name,
          mobile,
          email: email || null,
          password: hashedPassword,
          role: user_role.USER,
          isActive: true,

          referralCode: generateReferralCode(),
          referredById: referredBy?.id || null,
          wallet: config ? config.refereeBonus : 0,
          adharcard: "",
          pancard: "",
          address: ""
        },
      });

      // referee wallet transaction
      if (config && config.refereeBonus > 0) {
        await tx.walletTransaction.create({
          data: {
            userId: newUser.id,
            amount: config.refereeBonus,
            balanceAfter: config.refereeBonus,
            type: "CREDIT",
            source: "REFERRAL_BONUS",
            remark: "Signup referral bonus",
          },
        });
      }

      // referrer wallet credit
      if (config && referredBy) {
        const updatedReferrer = await tx.user.update({
          where: { id: referredBy.id },
          data: { wallet: { increment: config.referrerBonus } },
          select: { wallet: true },
        });

        await tx.walletTransaction.create({
          data: {
            userId: referredBy.id,
            amount: config.referrerBonus,
            balanceAfter: updatedReferrer.wallet,
            type: "CREDIT",
            source: "REFERRAL_BONUS",
            remark: `Referral bonus for ${mobile}`,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: { id: user.id.toString() },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* 🔹 helper */
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
