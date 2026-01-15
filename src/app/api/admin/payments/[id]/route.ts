///Users/xeoren/Desktop/draw/src/app/api/admin/payments/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";
import crypto from "crypto";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  if (!id) {
    return NextResponse.json(
      { status: false, message: "Payment ID missing" },
      { status: 400 }
    );
  }

  // update payment
  const payment = await prisma.payment.update({
    where: { id: BigInt(id) },
    data: {
      status: body.status, // APPROVED / REJECTED
    },
  });

  // save remark in audit log (optional but clean)
  await prisma.auditLog.create({
    data: {
      action: body.status,
      entity: "PAYMENT",
      entityId: payment.id,
      adminId: body.adminId ? BigInt(body.adminId) : null,
      meta: {
        remark: body.remark || "",
        transactionId: payment.transactionId,
      },
    },
  });

  // 🎟 APPROVED → CREATE TICKET
  if (body.status === "APPROVED") {
    const ticketCount = payment.amount === 1100 ? 2 : 1;

    for (let i = 0; i < ticketCount; i++) {
      await prisma.ticket.create({
        data: {
          ticketCode: "TK-" + crypto.randomBytes(4).toString("hex"),
          userId: payment.userId,
          drawId: payment.drawId,
          paymentId: payment.id,
          source: "USER_PURCHASE",
        },
      });
    }
  }

  return NextResponse.json({
    status: true,
    data: serializeBigInt(payment),
  });
}
