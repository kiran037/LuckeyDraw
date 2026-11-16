import { test, describe } from "node:test";
import assert from "node:assert";

describe("Financial Integrity & Payment Calculation Suite", () => {
  function calculatePaymentPlan({
    entryFee,
    walletBalance,
    requestedWalletUse,
    processingFee = 0,
    requestedTickets = 1,
  }: {
    entryFee: number;
    walletBalance: number;
    requestedWalletUse: number;
    processingFee?: number;
    requestedTickets?: number;
  }) {
    const totalDrawCost = entryFee * requestedTickets;
    const safeWalletUsed = Math.max(
      0,
      Math.min(requestedWalletUse, walletBalance, totalDrawCost)
    );
    const remainingCashAmount = totalDrawCost - safeWalletUsed;
    const finalPayable = remainingCashAmount > 0 ? remainingCashAmount + processingFee : 0;

    return {
      totalCost: totalDrawCost,
      walletUsed: safeWalletUsed,
      cashPayable: finalPayable,
      isFullyWalletCovered: remainingCashAmount === 0,
    };
  }

  function calculateApprovedTickets({
    entryFee,
    amount,
    walletUsed,
  }: {
    entryFee: number;
    amount: number;
    walletUsed: number;
  }) {
    const totalPaid = (walletUsed || 0) + amount;
    return Math.max(1, Math.floor(totalPaid / entryFee));
  }

  test("full wallet payment yields 0 cash payable and correct ticket count", () => {
    const plan = calculatePaymentPlan({
      entryFee: 100,
      walletBalance: 250,
      requestedWalletUse: 100,
      processingFee: 5,
      requestedTickets: 1,
    });

    assert.strictEqual(plan.walletUsed, 100);
    assert.strictEqual(plan.cashPayable, 0);
    assert.strictEqual(plan.isFullyWalletCovered, true);

    const tickets = calculateApprovedTickets({
      entryFee: 100,
      amount: plan.cashPayable,
      walletUsed: plan.walletUsed,
    });
    assert.strictEqual(tickets, 1);
  });

  test("partial wallet + cash calculates tickets accurately without losing partial payment", () => {
    const plan = calculatePaymentPlan({
      entryFee: 100,
      walletBalance: 40,
      requestedWalletUse: 40,
      processingFee: 5,
      requestedTickets: 1,
    });

    assert.strictEqual(plan.walletUsed, 40);
    assert.strictEqual(plan.cashPayable, 65); // 60 + 5 fee

    // In approval:
    const tickets = calculateApprovedTickets({
      entryFee: 100,
      amount: 60, // cash portion without fee
      walletUsed: plan.walletUsed,
    });
    assert.strictEqual(tickets, 1);
  });

  test("multi-ticket purchase with partial wallet calculates exact ticket count", () => {
    const plan = calculatePaymentPlan({
      entryFee: 50,
      walletBalance: 70,
      requestedWalletUse: 50,
      processingFee: 0,
      requestedTickets: 4, // total cost 200
    });

    assert.strictEqual(plan.totalCost, 200);
    assert.strictEqual(plan.walletUsed, 50);
    assert.strictEqual(plan.cashPayable, 150);

    const tickets = calculateApprovedTickets({
      entryFee: 50,
      amount: 150,
      walletUsed: 50,
    });
    assert.strictEqual(tickets, 4);
  });

  test("wallet deduction cannot exceed actual wallet balance", () => {
    const plan = calculatePaymentPlan({
      entryFee: 500,
      walletBalance: 50,
      requestedWalletUse: 200, // User maliciously asks to use 200
      processingFee: 0,
      requestedTickets: 1,
    });

    assert.strictEqual(plan.walletUsed, 50, "Capped at user wallet balance");
    assert.strictEqual(plan.cashPayable, 450);
  });
});
