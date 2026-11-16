import { count, desc } from "drizzle-orm";
import { db, winner } from "@/db";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const [winners, totalRes] = await Promise.all([
      db.query.winner.findMany({
        offset: skip,
        limit,
        orderBy: [desc(winner.declaredAt)],
        with: {
          user: {
            columns: {
              name: true,
              avatar: true,
              mobile: true,
            },
          },
          draw: {
            columns: {
              title: true,
            },
          },
          drawproduct: {
            columns: {
              name: true,
              image: true,
            },
          },
          ticket: {
            columns: {
              ticketCode: true,
            },
          },
        },
      }),
      db.select({ count: count() }).from(winner),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);

    const formattedWinners = winners.map((w) => ({
      id: w.id,
      userName: w.user.name,
      userAvatar: w.user.avatar,
      maskedMobile: w.user.mobile.replace(/.(?=.{4})/g, "*"),
      prizeName: w.drawproduct.name,
      prizeImage: w.drawproduct.image,
      drawTitle: w.draw.title,
      ticketCode: w.ticket.ticketCode,
      wonAt: w.declaredAt,
    }));

    return jsonResponse({
      winners: formattedWinners,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET WINNERS ERROR:", error);
    return errorResponse("Failed to fetch winners", 500);
  }
}
