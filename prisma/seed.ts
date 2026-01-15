import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, user_role } from "../src/generated/client/client";

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
  const ADMIN_EMAIL = "kiran@admin.com";
  const ADMIN_MOBILE = "7777777777";
  const ADMIN_PASSWORD = "kkk@1234"; // change after first login

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: {
      mobile: ADMIN_MOBILE, // unique field
    },
    update: {},
    create: {
      name: "Super Admin",
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      password: hashedPassword,
      role: user_role.ADMIN,
      isActive: true,
      wallet: 0,
      avatar: null,
    },
  });

  console.log("✅ Admin user ensured (created if not exists)");
}

/* -------------------- Execute -------------------- */

main()
  .catch((error) => {
    console.error("❌ Admin seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });