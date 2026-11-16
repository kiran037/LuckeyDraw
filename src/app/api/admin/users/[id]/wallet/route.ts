import { eq } from "drizzle-orm";
import {
  db,
  user,
  walletTransaction,
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

    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) return errorResponse("User not found", 404);

    if (type === "DEBIT" && foundUser.wallet < amount) {
      return errorResponse("Insufficient wallet balance", 400);
    }

    const newBalance =
      type === "CREDIT"
        ? foundUser.wallet + amount
        : foundUser.wallet - amount;

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ wallet: newBalance })
        .where(eq(user.id, userId));

      await tx.insert(walletTransaction).values({
        userId,
        amount,
        balanceAfter: newBalance,
        type,
        source,
        remark: remark || "Admin wallet adjustment",
      });
    });

    return jsonResponse({
      message: "Wallet updated successfully",
      balance: newBalance,
    });
  } catch (err) {
    console.error("WALLET UPDATE ERROR:", err);
    return errorResponse("Failed to update wallet", 500);
  }
}
