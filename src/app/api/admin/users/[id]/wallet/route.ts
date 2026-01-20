import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import {
  wallet_transaction_type,
  wallet_transaction_source,
} from "@/generated/client/client";

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

    // ✅ validations
    if (!amount || amount <= 0) {
      return errorResponse("Invalid amount", 400);
    }

    if (!Object.values(wallet_transaction_type).includes(type)) {
      return errorResponse("Invalid transaction type", 400);
    }

    if (!Object.values(wallet_transaction_source).includes(source)) {
      return errorResponse("Invalid transaction source", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return errorResponse("User not found", 404);

    // ❌ Debit me balance check
    if (type === "DEBIT" && user.wallet < amount) {
      return errorResponse("Insufficient wallet balance", 400);
    }

    const newBalance =
      type === "CREDIT"
        ? user.wallet + amount
        : user.wallet - amount;

    // ✅ update wallet
    await prisma.user.update({
      where: { id: userId },
      data: { wallet: newBalance },
    });

    // ✅ transaction log
    await prisma.walletTransaction.create({
      data: {
        userId,
        amount,
        balanceAfter: newBalance,
        type,
        source,
        remark: remark || "Admin wallet adjustment",
      },
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
