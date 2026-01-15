///Users/xeoren/Desktop/draw/src/app/api/admin/reports/users/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      mobile: true,
      createdAt: true,
      _count: {
        select: {
          tickets: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    status: true,
    data: serializeBigInt(users),
  });
}
