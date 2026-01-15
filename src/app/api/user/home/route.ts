// // src/app/api/user/home/route.ts
// import { NextResponse } from "next/server";
// import { getCurrentUser } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { draw_status } from "@/generated/client/client";

// type UserTicketResponse = {
//   id: string;
//   ticketCode: string;
//   source: string;
//   isWinner: boolean;
//   pricePaid: number;
//   status: string;
//   createdAt: string;
//   draw: {
//     id: string;
//     title: string;
//     description: string | null;
//     status: string;
//     products: {
//       id: string;
//       name: string;
//       image: string | null;
//       quantity: number;
//     }[];
//   } | null;
//   payment: {
//     id: string;
//     amount: number;
//     transactionId: string | null;
//     status: string;
//     createdAt: string;
//   } | null;
// };

// export async function GET() {
//   try {
//     const user = await getCurrentUser();
//     const now = new Date();

//     // Get Quick Stats
//     const [activeDrawsCount, totalWinnersCount, totalDraws] = await Promise.all([
//       // Active live draws
//       prisma.draw.count({
//         where: {
//           status: draw_status.LIVE,
//           startTime: { lte: now },
//           endTime: { gte: now },
//         },
//       }),
//       // Total winners
//       prisma.winner.count(),
//       // All non-draft draws for prize pool calculation
//       prisma.draw.findMany({
//         where: {
//           status: { not: draw_status.DRAFT },
//         },
//         select: { entryFee: true, maxTickets: true },
//       }),
//     ]);

//     // Calculate total prize pool (rough estimate based on entry fees)
//     const totalPrizePool = totalDraws.reduce(
//       (sum, draw) => sum + draw.entryFee * draw.maxTickets,
//       0
//     );

//     // Get user tickets count if logged in
//     let userTicketsCount = 0;
//     if (user) {
//       userTicketsCount = await prisma.ticket.count({
//         where: { userId: BigInt(user.id) },
//       });
//     }

//     // Get live draws (max 3)
//     const liveDraws = await prisma.draw.findMany({
//       where: {
//         status: draw_status.LIVE,
//         startTime: { lte: now },
//         endTime: { gte: now },
//       },
//       take: 3,
//       orderBy: { endTime: "asc" },
//       include: {
//         drawproduct: {
//           select: {
//             id: true,
//             name: true,
//             image: true,
//             quantity: true,
//           },
//         },
//         _count: { select: { ticket: true } },
//       },
//     });

//     // Get user tickets if logged in (max 3)
// let userTickets: UserTicketResponse[] = [];
//     if (user) {
//       const tickets = await prisma.ticket.findMany({
//         where: { userId: BigInt(user.id) },
//         take: 3,
//         orderBy: { createdAt: "desc" },
//         include: {
//           draw: {
//             select: {
//               id: true,
//               title: true,
//               description: true,
//               status: true,
//               drawproduct: {
//                 select: {
//                   id: true,
//                   name: true,
//                   image: true,
//                   quantity: true,
//                 },
//               },
//             },
//           },
//           payment: {
//             select: {
//               id: true,
//               amount: true,
//               transactionId: true,
//               status: true,
//               createdAt: true,
//             },
//           },
//         },
//       });

//       userTickets = tickets.map((ticket) => ({
//         id: ticket.id.toString(),
//         ticketCode: ticket.ticketCode,
//         source: ticket.source,
//         isWinner: ticket.isWinner,
//         pricePaid: ticket.pricePaid,
//         status: ticket.status,
//         createdAt: ticket.createdAt.toISOString(),
//         draw: ticket.draw
//           ? {
//               id: ticket.draw.id.toString(),
//               title: ticket.draw.title,
//               description: ticket.draw.description,
//               status: ticket.draw.status,
//               products: ticket.draw.drawproduct.map((p) => ({
//                 id: p.id.toString(),
//                 name: p.name,
//                 image: p.image,
//                 quantity: p.quantity,
//               })),
//             }
//           : null,
//         payment: ticket.payment
//           ? {
//               id: ticket.payment.id.toString(),
//               amount: ticket.payment.amount,
//               transactionId: ticket.payment.transactionId,
//               status: ticket.payment.status,
//               createdAt: ticket.payment.createdAt.toISOString(),
//             }
//           : null,
//       }));
//     }

//     // Get recent winners (max 5)
//     const recentWinners = await prisma.winner.findMany({
//       take: 5,
//       orderBy: { declaredAt: "desc" },
//       include: {
//         user: {
//           select: {
//             name: true,
//             avatar: true,
//           },
//         },
//         draw: {
//           select: {
//             title: true,
//           },
//         },
//         drawproduct: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       data: {
//         stats: {
//           activeDraws: activeDrawsCount,
//           totalPrizePool,
//           happyWinners: totalWinnersCount,
//           userTickets: user ? userTicketsCount : undefined,
//         },
//         liveDraws: liveDraws.map((draw) => ({
//           id: draw.id.toString(),
//           title: draw.title,
//           description: draw.description,
//           bannerImage: draw.bannerImage,
//           entryFee: draw.entryFee,
//           startTime: draw.startTime.toISOString(),
//           endTime: draw.endTime.toISOString(),
//           maxTickets: draw.maxTickets,
//           status: draw.status,
//           ticketCount: draw._count.ticket,
//           products: draw.drawproduct.map((p) => ({
//             id: p.id.toString(),
//             name: p.name,
//             image: p.image,
//             quantity: p.quantity,
//           })),
//         })),
//         userTickets,
//         recentWinners: recentWinners.map((winner) => ({
//           id: winner.id.toString(),
//           userName: winner.user.name,
//           userAvatar: winner.user.avatar,
//           drawTitle: winner.draw.title,
//           productName: winner.drawproduct.name,
//           declaredAt: winner.declaredAt.toISOString(),
//         })),
//         isLoggedIn: !!user,
//       },
//     });
//   } catch (error) {
//     console.error("GET HOME DATA ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/user/home/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { draw_status } from "@/generated/client/client";

// Define the shape of the ticket data we return to the frontend
type UserTicketData = {
  id: string;
  ticketCode: string;
  isWinner: boolean;
  status: string;
  createdAt: string;
  draw: {
    id: string;
    title: string;
    status: string;
    bannerImage: string | null;
    endTime: string;
    resultAt?: string;
    productImage: string | null;
  } | null;
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    const now = new Date();

    // 1. Stats Queries
    const [activeDrawsCount, totalWinnersCount, totalDraws] = await Promise.all([
      prisma.draw.count({
        where: {
          status: draw_status.LIVE,
          startTime: { lte: now },
          endTime: { gte: now },
        },
      }),
      prisma.winner.count(),
      prisma.draw.findMany({
        where: { status: { not: draw_status.DRAFT } },
        select: { entryFee: true, maxTickets: true },
      }),
    ]);

    const totalPrizePool = totalDraws.reduce(
      (sum, draw) => sum + draw.entryFee * draw.maxTickets,
      0
    );

    let userTicketsCount = 0;
    if (user) {
      userTicketsCount = await prisma.ticket.count({
        where: { userId: BigInt(user.id) },
      });
    }

    // 2. Live Draws Query
    const liveDraws = await prisma.draw.findMany({
      where: {
        status: draw_status.LIVE,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      take: 5,
      orderBy: { endTime: "asc" },
      include: {
        drawproduct: { select: { id: true, name: true, image: true, quantity: true } },
        _count: { select: { ticket: true } },
      },
    });

    // 3. User Tickets Query
    // FIX: Replaced 'any[]' with 'UserTicketData[]'
    let userTickets: UserTicketData[] = [];
    
    if (user) {
      const tickets = await prisma.ticket.findMany({
        where: { userId: BigInt(user.id) },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          draw: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              bannerImage: true,
              endTime: true,
              resultAt: true,
              drawproduct: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
                take: 1,
              },
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
      });

      userTickets = tickets.map((ticket) => ({
        id: ticket.id.toString(),
        ticketCode: ticket.ticketCode,
        isWinner: ticket.isWinner,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        draw: ticket.draw
          ? {
              id: ticket.draw.id.toString(),
              title: ticket.draw.title,
              status: ticket.draw.status,
              bannerImage: ticket.draw.bannerImage,
              endTime: ticket.draw.endTime.toISOString(),
              resultAt: ticket.draw.resultAt?.toISOString(),
              productImage: ticket.draw.drawproduct[0]?.image || null,
            }
          : null,
      }));
    }

    // 4. Winners Query
    const recentWinners = await prisma.winner.findMany({
      take: 5,
      orderBy: { declaredAt: "desc" },
      include: {
        user: { select: { name: true, avatar: true } },
        draw: { select: { title: true } },
        drawproduct: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeDraws: activeDrawsCount,
          totalPrizePool,
          happyWinners: totalWinnersCount,
          userTickets: user ? userTicketsCount : undefined,
        },
        liveDraws: liveDraws.map((draw) => ({
          id: draw.id.toString(),
          title: draw.title,
          description: draw.description,
          bannerImage: draw.bannerImage,
          entryFee: draw.entryFee,
          startTime: draw.startTime.toISOString(),
          endTime: draw.endTime.toISOString(),
          maxTickets: draw.maxTickets,
          status: draw.status,
          ticketCount: draw._count.ticket,
          products: draw.drawproduct.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            image: p.image,
            quantity: p.quantity,
          })),
        })),
        userTickets,
        recentWinners: recentWinners.map((winner) => ({
          id: winner.id.toString(),
          userName: winner.user.name,
          userAvatar: winner.user.avatar,
          drawTitle: winner.draw.title,
          productName: winner.drawproduct.name,
          declaredAt: winner.declaredAt.toISOString(),
        })),
        isLoggedIn: !!user,
      },
    });
  } catch (error) {
    console.error("GET HOME DATA ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}