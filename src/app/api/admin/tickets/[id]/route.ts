import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import {
  db,
  ticket,
  user,
  walletTransaction,
  notification,
  auditlog,
  ticket_status,
  wallet_transaction_type,
  wallet_transaction_source,
} from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const foundTicket = await db.query.ticket.findFirst({
      where: eq(ticket.id, BigInt(id)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            avatar: true,
          },
        },
        draw: {
          columns: { id: true, title: true, status: true, bannerImage: true },
        },
        payment: true,
        winner: true,
      },
    });

    if (!foundTicket) return errorResponse("Ticket not found", 404);

    return jsonResponse({ ticket: foundTicket });
  } catch (err) {
    console.error("ADMIN GET TICKET ERROR:", err);
    return errorResponse("Server error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const body = await req.json();

    if (!body.status || !Object.values(ticket_status).includes(body.status)) {
      return errorResponse(
        "Valid status is required (ACTIVE, CANCELLED, REFUNDED)",
        400
      );
    }

    const newStatus = body.status as ticket_status;

    const existingTicket = await db.query.ticket.findFirst({
      where: eq(ticket.id, BigInt(id)),
      columns: {
        id: true,
        isWinner: true,
        status: true,
        userId: true,
        drawId: true,
        pricePaid: true,
        ticketCode: true,
      },
    });

    if (!existingTicket) return errorResponse("Ticket not found", 404);

    if (
      existingTicket.isWinner &&
      (newStatus === ticket_status.CANCELLED ||
        newStatus === ticket_status.REFUNDED)
    ) {
      return errorResponse(
        "Cannot cancel a winning ticket. Remove winner status first.",
        400
      );
    }

    if (existingTicket.status === newStatus) {
      return jsonResponse({
        success: true,
        message: `Ticket is already ${newStatus}`,
        ticket: existingTicket,
      });
    }

    const updatedTicket = await db.transaction(async (tx) => {
      const [t] = await tx
        .update(ticket)
        .set({ status: newStatus })
        .where(eq(ticket.id, BigInt(id)))
        .returning();

      if (
        newStatus === ticket_status.REFUNDED &&
        existingTicket.status !== ticket_status.REFUNDED
      ) {
        const [updatedUser] = await tx
          .update(user)
          .set({
            wallet: sql`${user.wallet} + ${existingTicket.pricePaid}`,
          })
          .where(eq(user.id, existingTicket.userId))
          .returning({ wallet: user.wallet });

        const newBalance =
          updatedUser?.wallet ?? existingTicket.pricePaid;

        await tx.insert(walletTransaction).values({
          userId: existingTicket.userId,
          amount: existingTicket.pricePaid,
          balanceAfter: newBalance,
          type: wallet_transaction_type.CREDIT,
          source: wallet_transaction_source.REFUND,
          referenceId: existingTicket.id,
          remark: `Refund for ticket ${existingTicket.ticketCode}`,
        });

        await tx.insert(notification).values({
          userId: existingTicket.userId,
          title: "Ticket Refunded 💳",
          message: `Your ticket ${existingTicket.ticketCode} was refunded. ₹${existingTicket.pricePaid} has been credited to your wallet.`,
        });
      }

      await tx.insert(auditlog).values({
        action: `TICKET_${newStatus}`,
        entity: "TICKET",
        entityId: existingTicket.id,
        adminId: BigInt(admin.id),
        meta: JSON.stringify({
          previousStatus: existingTicket.status,
          newStatus,
          pricePaid: existingTicket.pricePaid,
          refunded: newStatus === ticket_status.REFUNDED,
        }),
      });

      return t;
    });

    return jsonResponse({
      success: true,
      message: `Ticket status updated to ${newStatus}`,
      ticket: updatedTicket,
    });
  } catch (err) {
    console.error("ADMIN UPDATE TICKET ERROR:", err);
    return errorResponse("Failed to update ticket", 500);
  }
}
