import { eq, and, gte, sql } from "drizzle-orm";
import {
  db,
  user,
  walletTransaction,
  auditlog,
  notification,
  wallet_transaction_type,
  wallet_transaction_source,
} from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const userId = BigInt(id);

    const { amount, type, source, remark } = await req.json();

    // validations
    if (!amount || amount <= 0) {
      return errorResponse("Invalid amount", 400);
    }

    if (!Object.values(wallet_transaction_type).includes(type)) {
      return errorResponse("Invalid transaction type", 400);
    }

    if (!Object.values(wallet_transaction_source).includes(source)) {
      return errorResponse("Invalid transaction source", 400);
    }

    const updatedResult = await db.transaction(async (tx) => {
      const foundUser = await tx.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { id: true, wallet: true, name: true },
      });

      if (!foundUser) {
        throw new Error("USER_NOT_FOUND");
      }

      if (type === "DEBIT" && foundUser.wallet < amount) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const updateCondition =
        type === "DEBIT"
          ? and(eq(user.id, userId), gte(user.wallet, amount))
          : eq(user.id, userId);

      const [updatedUser] = await tx
        .update(user)
        .set({
          wallet:
            type === "CREDIT"
              ? sql`${user.wallet} + ${amount}`
              : sql`${user.wallet} - ${amount}`,
        })
        .where(updateCondition)
        .returning({ wallet: user.wallet });

      if (!updatedUser) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const newBalance = updatedUser.wallet;

      await tx.insert(walletTransaction).values({
        userId,
        amount: type === "CREDIT" ? amount : -amount,
        balanceAfter: newBalance,
        type,
        source,
        remark: remark || "Admin wallet adjustment",
      });

      await tx.insert(auditlog).values({
        action: "ADMIN_WALLET_ADJUSTMENT",
        entity: "USER",
        entityId: userId,
        adminId: BigInt(admin.id),
        meta: JSON.stringify({
          amount,
          type,
          source,
          remark: remark || "",
          previousBalance: foundUser.wallet,
          newBalance,
        }),
      });

      await tx.insert(notification).values({
        userId,
        title:
          type === "CREDIT"
            ? "Wallet Credited 💰"
            : "Wallet Debited 💳",
        message:
          type === "CREDIT"
            ? `₹${amount} has been credited to your wallet by admin. New balance: ₹${newBalance}.`
            : `₹${amount} has been debited from your wallet by admin. New balance: ₹${newBalance}.`,
      });

      return newBalance;
    });

    return jsonResponse({
      message: "Wallet updated successfully",
      balance: updatedResult,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "USER_NOT_FOUND") {
        return errorResponse("User not found", 404);
      }
      if (err.message === "INSUFFICIENT_FUNDS") {
        return errorResponse("Insufficient wallet balance", 400);
      }
    }
    console.error("WALLET UPDATE ERROR:", err);
    return errorResponse("Failed to update wallet", 500);
  }
}
