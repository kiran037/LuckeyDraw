import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  user,
  referralConfig,
  draw,
  drawproduct,
  user_role,
  draw_status,
} from "./index";

async function main() {
  /* ========== 1. ADMIN USER ========== */

  const ADMIN_EMAIL = "kiran@admin.com";
  const ADMIN_MOBILE = "7777777777";
  const ADMIN_PASSWORD = "kkk@1234";

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existingAdmin = await db.query.user.findFirst({
    where: eq(user.mobile, ADMIN_MOBILE),
  });

  let adminId: bigint;
  if (!existingAdmin) {
    const [createdAdmin] = await db
      .insert(user)
      .values({
        name: "Super Admin",
        email: ADMIN_EMAIL,
        mobile: ADMIN_MOBILE,
        password: hashedPassword,
        role: user_role.ADMIN,
        adharcard: "NA",
        pancard: "NA",
        address: "System Generated Admin",
        isActive: true,
        avatar: null,
        referralCode: "ADMIN001",
        wallet: 0,
      })
      .returning({ id: user.id });
    adminId = createdAdmin.id;
  } else {
    adminId = existingAdmin.id;
  }

  console.log("✅ Admin user ensured:", adminId.toString());

  /* ========== 2. REFERRAL CONFIG ========== */

  const existingConfig = await db.query.referralConfig.findFirst({
    where: eq(referralConfig.id, BigInt(1)),
  });

  if (!existingConfig) {
    await db.insert(referralConfig).values({
      id: BigInt(1),
      referrerBonus: 50,
      refereeBonus: 20,
      isActive: true,
    });
  }

  console.log("✅ Referral config ensured");

  /* ========== 3. TEST DRAW ========== */

  const existingDraw = await db.query.draw.findFirst();
  if (!existingDraw) {
    const now = new Date();
    const [createdDraw] = await db
      .insert(draw)
      .values({
        title: "🎁 Test Lucky Draw",
        description: "This is a test draw created from seed",
        bannerImage: null,
        rules: "One ticket per entry. Winner will be announced after closing.",
        entryFee: 100,
        startTime: now,
        endTime: new Date(now.getTime() + 1000 * 60 * 60 * 24), // +1 day
        maxTickets: 100,
        status: draw_status.LIVE,
      })
      .returning({ id: draw.id });

    console.log("✅ Test draw created:", createdDraw.id.toString());

    /* ========== 4. DRAW PRODUCTS ========== */

    await db.insert(drawproduct).values([
      {
        drawId: createdDraw.id,
        name: "iPhone 15",
        description: "Apple iPhone 15 - 128GB",
        quantity: 1,
        image: null,
      },
      {
        drawId: createdDraw.id,
        name: "Amazon Gift Card",
        description: "₹5000 Amazon shopping voucher",
        quantity: 5,
        image: null,
      },
      {
        drawId: createdDraw.id,
        name: "Bluetooth Headphones",
        description: "Noise cancelling wireless headphones",
        quantity: 2,
        image: null,
      },
    ]);

    console.log("✅ Draw products created: 3");
  } else {
    console.log("✅ Draw already exists:", existingDraw.id.toString());
  }

  console.log("🎉 Seed finished successfully");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
