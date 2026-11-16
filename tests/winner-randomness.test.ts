import { test, describe } from "node:test";
import assert from "node:assert";
import { randomInt } from "crypto";

describe("Cryptographically Secure Random Shuffling Suite", () => {
  function csprngShuffle<T>(items: T[]): T[] {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  test("shuffle preserves exact set of elements with no duplicates or omissions", () => {
    const input = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
    const shuffled = csprngShuffle(input);

    assert.strictEqual(shuffled.length, input.length);
    assert.deepStrictEqual(
      [...shuffled].sort((a, b) => a - b),
      [...input].sort((a, b) => a - b)
    );
  });

  test("shuffle produces varied permutations across runs (non-deterministic)", () => {
    const input = Array.from({ length: 50 }, (_, i) => i + 1);
    const run1 = csprngShuffle(input);
    const run2 = csprngShuffle(input);
    const run3 = csprngShuffle(input);

    assert.notDeepStrictEqual(run1, input);
    assert.notDeepStrictEqual(run1, run2);
    assert.notDeepStrictEqual(run2, run3);
  });

  test("winner assignment selects unique tickets for each prize slot", () => {
    const tickets = Array.from({ length: 20 }, (_, i) => ({
      id: BigInt(i + 1),
      ticketCode: `TKT-${i + 1}`,
      userId: BigInt((i % 5) + 1),
    }));

    const products = [
      { id: BigInt(1), name: "First Prize - iPhone 16", quantity: 1 },
      { id: BigInt(2), name: "Second Prize - Smart Watch", quantity: 2 },
      { id: BigInt(3), name: "Third Prize - Earbuds", quantity: 3 },
    ];

    const shuffled = csprngShuffle(tickets);
    const winners = [];
    let ticketIndex = 0;

    for (const prod of products) {
      for (let q = 0; q < prod.quantity; q++) {
        if (ticketIndex >= shuffled.length) break;
        const winningTicket = shuffled[ticketIndex];
        winners.push({
          ticketId: winningTicket.id,
          productId: prod.id,
          userId: winningTicket.userId,
        });
        ticketIndex++;
      }
    }

    assert.strictEqual(winners.length, 6);
    const winnerTicketIds = new Set(winners.map((w) => w.ticketId.toString()));
    assert.strictEqual(winnerTicketIds.size, 6, "Every winning ticket must be strictly unique");
  });
});
