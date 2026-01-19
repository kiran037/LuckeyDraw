import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  PrismaClient,
  user_role,
  draw_status,
} from "../src/generated/client/client";

/* -------------------- Prisma Adapter -------------------- */

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME!,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

/* -------------------- Seed Logic -------------------- */

async function main() {
  /* ========== 1. ADMIN USER ========== */

  const ADMIN_EMAIL = "kiran@admin.com";
  const ADMIN_MOBILE = "7777777777";
  const ADMIN_PASSWORD = "kkk@1234";

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { mobile: ADMIN_MOBILE },
    update: {},
    create: {
      name: "Super Admin",
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      password: hashedPassword,
      role: user_role.ADMIN,
      isActive: true,
      avatar: null,
      referralCode: "ADMIN001",
      wallet: 0,
    },
  });

  console.log("✅ Admin user ensured");

  /* ========== 2. REFERRAL CONFIG ========== */

  await prisma.referral_config.upsert({
    where: { id: 1 },
    update: {},
    create: {
      referrerBonus: 50,
      refereeBonus: 20,
      isActive: true,
    },
  });

  console.log("✅ Referral config ensured");

  /* ========== 3. TEST DRAW ========== */

  const now = new Date();

  const draw = await prisma.draw.create({
    data: {
      title: "🎁 Test Lucky Draw",
      description: "This is a test draw created from seed",
      bannerImage: null,
      rules: "One ticket per entry. Winner will be announced after closing.",
      entryFee: 100,
      startTime: now,
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 24), // +1 day
      maxTickets: 100,
      status: draw_status.LIVE,
    },
  });

  console.log("✅ Test draw created:", draw.id.toString());

  /* ========== 4. DRAW PRODUCTS ========== */

  const products = await prisma.drawproduct.createMany({
    data: [
      {
        drawId: draw.id,
        name: "iPhone 15",
        description: "Apple iPhone 15 - 128GB",
        quantity: 1,
        image: null,
      },
      {
        drawId: draw.id,
        name: "Amazon Gift Card",
        description: "₹500 Amazon Pay Gift Card",
        quantity: 5,
        image: null,
      },
      {
        drawId: draw.id,
        name: "Bluetooth Headphones",
        description: "Wireless Noise Cancelling Headphones",
        quantity: 3,
        image: null,
      },
    ],
  });

  console.log("✅ Draw products created:", products.count);
}

/* -------------------- Execute -------------------- */

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
