import { prisma } from "@/lib/prisma";

export async function generateDrawWinners(drawId: string, adminId: string) {
  const dId = BigInt(drawId);
  const aId = BigInt(adminId);

  // We use a transaction to ensure either EVERYTHING happens (winners picked, tickets updated) or NOTHING happens.
  return await prisma.$transaction(async (tx) => {
    // 1. Validation: Fetch Draw & Products
    const draw = await tx.draw.findUnique({
      where: { id: dId },
      include: { 
        drawproduct: true // Fetch prizes associated with this draw
      },
    });

    if (!draw) throw new Error("Draw not found");
    
    if (draw.status === "RESULT_DECLARED") {
      throw new Error("Winners have already been declared for this draw.");
    }

    if (!draw.drawproduct || draw.drawproduct.length === 0) {
      throw new Error("No prizes/products defined for this draw.");
    }

    // 2. Fetch Eligible Tickets
    // Only fetch tickets that are ACTIVE and not already marked as winners (sanity check)
    const eligibleTickets = await tx.ticket.findMany({
      where: {
        drawId: dId,
        status: "ACTIVE",
        isWinner: false, 
      },
    });

    if (eligibleTickets.length === 0) {
      throw new Error("No eligible tickets found to pick winners from.");
    }

    // 3. The Shuffle (Fisher-Yates Algorithm)
    // This randomizes the ticket array fairly
    const shuffledTickets = [...eligibleTickets];
    for (let i = shuffledTickets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTickets[i], shuffledTickets[j]] = [shuffledTickets[j], shuffledTickets[i]];
    }

    // 4. Assign Winners
    const winnerPromises = [];
    const ticketIdsToUpdate: bigint[] = [];
    const notificationPromises = [];
    
    let ticketIndex = 0;

    // Iterate over every product (prize) type
    for (const product of draw.drawproduct) {
      // Iterate based on the quantity (e.g., 5 iPhones = run loop 5 times)
      for (let q = 0; q < product.quantity; q++) {
        
        // Stop if we run out of tickets (more prizes than participants)
        if (ticketIndex >= shuffledTickets.length) break;

        const winningTicket = shuffledTickets[ticketIndex];

        // A. Record the Winner
        winnerPromises.push(
          tx.winner.create({
            data: {
              ticketId: winningTicket.id,
              productId: product.id,
              drawId: dId,
              userId: winningTicket.userId,
              declaredBy: aId,
              declaredAt: new Date(),
            },
          })
        );

        // B. Prepare Notification
        notificationPromises.push(
          tx.notification.create({
            data: {
              userId: winningTicket.userId,
              title: "🎉 You Won!",
              message: `Congratulations! You won ${product.name} in the ${draw.title}. Check your winnings!`,
            },
          })
        );

        ticketIdsToUpdate.push(winningTicket.id);
        ticketIndex++;
      }
    }

    // 5. Execute Database Updates
    if (winnerPromises.length === 0) {
      throw new Error("Could not assign any winners (Check product quantities vs ticket counts)");
    }

    // Create all winner records
    await Promise.all(winnerPromises);

    // Mark tickets as winners
    await tx.ticket.updateMany({
      where: { id: { in: ticketIdsToUpdate } },
      data: { isWinner: true },
    });

    // Send Notifications
    await Promise.all(notificationPromises);

    // Update Draw Status
    await tx.draw.update({
      where: { id: dId },
      data: {
        status: "RESULT_DECLARED",
        resultAt: new Date(),
      },
    });

    // Create Audit Log
    await tx.auditlog.create({
      data: {
        action: "DECLARE_WINNERS",
        entity: "draw",
        entityId: dId,
        adminId: aId,
        meta: JSON.stringify({ 
          totalWinners: ticketIdsToUpdate.length,
          drawName: draw.title 
        }),
      },
    });

    return {
      success: true,
      winnersCount: ticketIdsToUpdate.length,
      drawId: draw.id
    };
  });
}