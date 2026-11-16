import { randomInt } from "crypto";
import { eq, and, inArray } from "drizzle-orm";
import {
  db,
  draw,
  ticket,
  winner,
  notification,
  auditlog,
} from "@/db";

export async function generateDrawWinners(drawId: string, adminId: string) {
  const dId = BigInt(drawId);
  const aId = BigInt(adminId);

  // We use a transaction to ensure either EVERYTHING happens or NOTHING happens.
  return await db.transaction(async (tx) => {
    // 1. Validation: Fetch Draw & Products
    const foundDraw = await tx.query.draw.findFirst({
      where: eq(draw.id, dId),
      with: {
        drawproduct: true,
      },
    });

    if (!foundDraw) throw new Error("Draw not found");

    if (foundDraw.status === "RESULT_DECLARED") {
      throw new Error("Winners have already been declared for this draw.");
    }

    if (foundDraw.status === "DRAFT") {
      throw new Error("Cannot declare winners for a draft draw.");
    }

    if (new Date() < new Date(foundDraw.endTime) && foundDraw.status !== "CLOSED") {
      throw new Error("Draw is still active. Winners can only be declared after the draw has ended or been closed.");
    }

    const existingWinners = await tx.query.winner.findFirst({
      where: eq(winner.drawId, dId),
    });
    if (existingWinners) {
      throw new Error("Winners have already been recorded for this draw.");
    }

    if (!foundDraw.drawproduct || foundDraw.drawproduct.length === 0) {
      throw new Error("No prizes/products defined for this draw.");
    }

    // 2. Fetch Eligible Tickets
    const eligibleTickets = await tx.query.ticket.findMany({
      where: and(
        eq(ticket.drawId, dId),
        eq(ticket.status, "ACTIVE"),
        eq(ticket.isWinner, false)
      ),
    });

    if (eligibleTickets.length === 0) {
      throw new Error("No eligible tickets found to pick winners from.");
    }

    // 3. Cryptographically Secure Fisher-Yates Shuffle
    const shuffledTickets = [...eligibleTickets];
    for (let i = shuffledTickets.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [shuffledTickets[i], shuffledTickets[j]] = [
        shuffledTickets[j],
        shuffledTickets[i],
      ];
    }

    // 4. Assign Winners
    const winnerRecords = [];
    const notificationRecords = [];
    const ticketIdsToUpdate: bigint[] = [];

    let ticketIndex = 0;

    for (const product of foundDraw.drawproduct) {
      for (let q = 0; q < product.quantity; q++) {
        if (ticketIndex >= shuffledTickets.length) break;

        const winningTicket = shuffledTickets[ticketIndex];

        winnerRecords.push({
          ticketId: winningTicket.id,
          productId: product.id,
          drawId: dId,
          userId: winningTicket.userId,
          declaredBy: aId,
          declaredAt: new Date(),
        });

        notificationRecords.push({
          userId: winningTicket.userId,
          title: "🎉 You Won!",
          message: `Congratulations! You won ${product.name} in the ${foundDraw.title}. Check your winnings!`,
        });

        ticketIdsToUpdate.push(winningTicket.id);
        ticketIndex++;
      }
    }

    if (winnerRecords.length === 0) {
      throw new Error(
        "Could not assign any winners (Check product quantities vs ticket counts)"
      );
    }

    // 5. Execute Database Updates
    await tx.insert(winner).values(winnerRecords);

    await tx
      .update(ticket)
      .set({ isWinner: true })
      .where(inArray(ticket.id, ticketIdsToUpdate));

    await tx.insert(notification).values(notificationRecords);

    await tx
      .update(draw)
      .set({
        status: "RESULT_DECLARED",
        resultAt: new Date(),
      })
      .where(eq(draw.id, dId));

    await tx.insert(auditlog).values({
      action: "DECLARE_WINNERS",
      entity: "draw",
      entityId: dId,
      adminId: aId,
      meta: JSON.stringify({
        totalWinners: ticketIdsToUpdate.length,
        drawName: foundDraw.title,
      }),
    });

    return {
      success: true,
      winnersCount: ticketIdsToUpdate.length,
      drawId: foundDraw.id,
    };
  });
}
