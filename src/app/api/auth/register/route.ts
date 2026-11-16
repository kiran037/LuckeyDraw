import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import {
  db,
  user,
  referralConfig,
  walletTransaction,
  user_role,
  wallet_transaction_type,
  wallet_transaction_source,
} from "@/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, mobile, email, password, referralCode } = body;

    // 1. Validation
    if (!name || !mobile || !password) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password too short" },
        { status: 400 }
      );
    }

    // 2. Duplicate check
    const existingMobile = await db.query.user.findFirst({
      where: eq(user.mobile, mobile),
    });

    if (existingMobile) {
      return NextResponse.json(
        { success: false, message: "Mobile already registered" },
        { status: 409 }
      );
    }

    if (email) {
      const existingEmail = await db.query.user.findFirst({
        where: eq(user.email, email),
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: "Email already registered" },
          { status: 409 }
        );
      }
    }

    // 3. Referral lookup
    let referredBy: { id: bigint; wallet: number } | null = null;
    if (referralCode) {
      const foundReferrer = await db.query.user.findFirst({
        where: eq(user.referralCode, referralCode),
        columns: { id: true, wallet: true },
      });

      if (!foundReferrer) {
        return NextResponse.json(
          { success: false, message: "Invalid referral code" },
          { status: 400 }
        );
      }
      referredBy = foundReferrer;
    }

    // 4. Referral config
    const config = await db.query.referralConfig.findFirst({
      where: eq(referralConfig.isActive, true),
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. TRANSACTION
    const newUser = await db.transaction(async (tx) => {
      // create user
      const [createdUser] = await tx
        .insert(user)
        .values({
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
          address: "",
        })
        .returning();

      // referee wallet transaction
      if (config && config.refereeBonus > 0) {
        await tx.insert(walletTransaction).values({
          userId: createdUser.id,
          amount: config.refereeBonus,
          balanceAfter: config.refereeBonus,
          type: wallet_transaction_type.CREDIT,
          source: wallet_transaction_source.REFERRAL_BONUS,
          remark: "Signup referral bonus",
        });
      }

      // referrer wallet credit
      if (config && referredBy) {
        const [updatedReferrer] = await tx
          .update(user)
          .set({ wallet: sql`${user.wallet} + ${config.referrerBonus}` })
          .where(eq(user.id, referredBy.id))
          .returning({ wallet: user.wallet });

        await tx.insert(walletTransaction).values({
          userId: referredBy.id,
          amount: config.referrerBonus,
          balanceAfter: updatedReferrer.wallet,
          type: wallet_transaction_type.CREDIT,
          source: wallet_transaction_source.REFERRAL_BONUS,
          remark: `Referral bonus for ${mobile}`,
        });
      }

      return createdUser;
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: { id: newUser.id.toString() },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
