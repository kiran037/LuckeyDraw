import "dotenv/config";
import { or, like, inArray } from "drizzle-orm";
import {
  db,
  pool,
  user,
  draw,
  drawproduct,
  payment,
  ticket,
  walletTransaction,
  winner,
  notification,
  auditlog,
} from "./index";

async function cleanDemoData() {
  console.log("\n🧹 ========================================================");
  console.log("   SAWARIYA LUCKY DRAW — DEMO DATA CLEANUP SCRIPT");
  console.log("========================================================\n");

  // 1. Safety check: prevent accidental production wipe
  if (process.env.NODE_ENV === "production" && process.env.FORCE_DEMO_CLEAN !== "true") {
    console.error("❌ Refusing to run in production without FORCE_DEMO_CLEAN=true");
    process.exit(1);
  }

  try {
    // 2. Identify demo users (never delete real admin or non-demo users)
    const demoUsers = await db.query.user.findMany({
      where: or(
        like(user.email, "%@demo.sawariya.in"),
        like(user.mobile, "98000%")
      ),
      columns: { id: true, email: true, mobile: true },
    });

    const demoUserIds = demoUsers.map((u) => u.id);
    console.log(`🔍 Found ${demoUserIds.length} demo users to clean.`);

    // 3. Identify demo draws
    const demoDraws = await db.query.draw.findMany({
      where: or(
        like(draw.description, "%[DEMO DATASET]%"),
        like(draw.rules, "%DEMO_VERIFIED_CONTEST%")
      ),
      columns: { id: true, title: true },
    });

    const demoDrawIds = demoDraws.map((d) => d.id);
    console.log(`🔍 Found ${demoDrawIds.length} demo draws to clean.`);

    if (demoUserIds.length === 0 && demoDrawIds.length === 0) {
      console.log("✨ No demo records found. Database is already clean of demo data.");
      await pool.end();
      process.exit(0);
    }

    // 4. Safe cascading deletion in reverse dependency order
    await db.transaction(async (tx) => {
      // Step A: Winners
      let deletedWinners = 0;
      if (demoDrawIds.length > 0 || demoUserIds.length > 0) {
        const delRes = await tx
          .delete(winner)
          .where(
            or(
              demoDrawIds.length > 0 ? inArray(winner.drawId, demoDrawIds) : undefined,
              demoUserIds.length > 0 ? inArray(winner.userId, demoUserIds) : undefined
            )
          )
          .returning({ id: winner.id });
        deletedWinners = delRes.length;
      }
      console.log(`   - Deleted ${deletedWinners} demo winners`);

      // Step B: Tickets
      let deletedTickets = 0;
      if (demoDrawIds.length > 0 || demoUserIds.length > 0) {
        const delRes = await tx
          .delete(ticket)
          .where(
            or(
              demoDrawIds.length > 0 ? inArray(ticket.drawId, demoDrawIds) : undefined,
              demoUserIds.length > 0 ? inArray(ticket.userId, demoUserIds) : undefined
            )
          )
          .returning({ id: ticket.id });
        deletedTickets = delRes.length;
      }
      console.log(`   - Deleted ${deletedTickets} demo tickets`);

      // Step C: Payments
      let deletedPayments = 0;
      if (demoDrawIds.length > 0 || demoUserIds.length > 0) {
        const delRes = await tx
          .delete(payment)
          .where(
            or(
              demoDrawIds.length > 0 ? inArray(payment.drawId, demoDrawIds) : undefined,
              demoUserIds.length > 0 ? inArray(payment.userId, demoUserIds) : undefined
            )
          )
          .returning({ id: payment.id });
        deletedPayments = delRes.length;
      }
      console.log(`   - Deleted ${deletedPayments} demo payments`);

      // Step D: Draw Products
      let deletedProducts = 0;
      if (demoDrawIds.length > 0) {
        const delRes = await tx
          .delete(drawproduct)
          .where(inArray(drawproduct.drawId, demoDrawIds))
          .returning({ id: drawproduct.id });
        deletedProducts = delRes.length;
      }
      console.log(`   - Deleted ${deletedProducts} demo draw products`);

      // Step E: Draws
      let deletedDrawsCount = 0;
      if (demoDrawIds.length > 0) {
        const delRes = await tx
          .delete(draw)
          .where(inArray(draw.id, demoDrawIds))
          .returning({ id: draw.id });
        deletedDrawsCount = delRes.length;
      }
      console.log(`   - Deleted ${deletedDrawsCount} demo draws`);

      // Step F: Wallet Transactions
      let deletedWalletTx = 0;
      if (demoUserIds.length > 0) {
        const delRes = await tx
          .delete(walletTransaction)
          .where(inArray(walletTransaction.userId, demoUserIds))
          .returning({ id: walletTransaction.id });
        deletedWalletTx = delRes.length;
      }
      console.log(`   - Deleted ${deletedWalletTx} demo wallet transactions`);

      // Step G: Notifications
      let deletedNotifications = 0;
      if (demoUserIds.length > 0) {
        const delRes = await tx
          .delete(notification)
          .where(inArray(notification.userId, demoUserIds))
          .returning({ id: notification.id });
        deletedNotifications = delRes.length;
      }
      console.log(`   - Deleted ${deletedNotifications} demo notifications`);

      // Step H: Audit Logs (tagged with isDemo)
      const delAudit = await tx
        .delete(auditlog)
        .where(like(auditlog.meta, '%"isDemo":true%'))
        .returning({ id: auditlog.id });
      console.log(`   - Deleted ${delAudit.length} demo audit logs`);

      // Step I: Users (demo users only)
      let deletedUsers = 0;
      if (demoUserIds.length > 0) {
        const delRes = await tx
          .delete(user)
          .where(inArray(user.id, demoUserIds))
          .returning({ id: user.id });
        deletedUsers = delRes.length;
      }
      console.log(`   - Deleted ${deletedUsers} demo users`);
    });

    console.log("\n✅ Demo data cleanup completed successfully!\n");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanDemoData();
