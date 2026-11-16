import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
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
  draw_status,
  payment_status,
  payment_method,
  payment_gateway,
  ticket_status,
  ticket_source,
  user_role,
  wallet_transaction_type,
  wallet_transaction_source,
} from "./index";

/* =========================================================================
   DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
   ========================================================================= */
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createPRNG(1337);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randChoices<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

/* =========================================================================
   STATIC ASSETS & RICH PRODUCT CATALOG (20 Products)
   ========================================================================= */
interface ProductDef {
  name: string;
  category: string;
  description: string;
  image: string;
  approxValue: number;
}

const PRODUCT_CATALOG: ProductDef[] = [
  {
    name: "Royal Enfield Classic 350 (Stealth Black)",
    category: "Motorcycles",
    description: "Iconic 349cc single-cylinder cruiser with dual-channel ABS, alloy wheels, and teardrop tank.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    approxValue: 215000,
  },
  {
    name: "TVS Apache RTR 310 (Racing Edition)",
    category: "Motorcycles",
    description: "Race-tuned 312cc liquid-cooled flagship street bike with ride-by-wire and Michelin Road 5 tires.",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80",
    approxValue: 242000,
  },
  {
    name: "Yamaha MT-15 V2 (Cyber Green)",
    category: "Motorcycles",
    description: "155cc VVA liquid-cooled naked streetfighter with golden USD forks and traction control system.",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&auto=format&fit=crop&q=80",
    approxValue: 168000,
  },
  {
    name: "Ather 450X Gen 3 Smart EV Scooter",
    category: "Electric Vehicles",
    description: "Ultra-smart electric scooter with Google Maps navigation, Warp Mode, and 146km certified range.",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop&q=80",
    approxValue: 145000,
  },
  {
    name: "Apple iPhone 17 Pro Max (256GB Desert Titanium)",
    category: "Smartphones",
    description: "Grade 5 Titanium finish, A19 Pro chip, 5x telephoto optical zoom and Super Retina XDR display.",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    approxValue: 149900,
  },
  {
    name: "Samsung Galaxy S25 Ultra 5G (Titanium Gray)",
    category: "Smartphones",
    description: "200MP camera with Galaxy AI, Snapdragon 8 Elite, embedded S-Pen, and anti-reflective Corning Gorilla Armor.",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    approxValue: 134999,
  },
  {
    name: "OnePlus 13 Pro 5G (Emerald Green, 512GB)",
    category: "Smartphones",
    description: "Hasselblad 4th-gen camera system, 6000mAh Glacier battery, and 100W SuperVOOC rapid charge.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    approxValue: 69999,
  },
  {
    name: "Apple iPad Pro 13-inch M4 OLED (Space Black)",
    category: "Tablets",
    description: "Breakthrough Ultra Retina XDR Tandem OLED display powered by next-generation Apple M4 silicon.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    approxValue: 129900,
  },
  {
    name: "Apple MacBook Pro 14-inch (M4 Pro Chip, 24GB Unified)",
    category: "Laptops",
    description: "14-core CPU, 20-core GPU, Liquid Retina XDR display with nano-texture glass and 22-hour battery life.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    approxValue: 199900,
  },
  {
    name: "Apple MacBook Air 15-inch (M3 Chip, Midnight)",
    category: "Laptops",
    description: "Impossibly thin design with Liquid Retina display, MagSafe 3 charging, and 1080p FaceTime HD camera.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
    approxValue: 134900,
  },
  {
    name: "ASUS ROG Zephyrus G16 Gaming Laptop (RTX 4080)",
    category: "Laptops",
    description: "2.5K 240Hz OLED gaming display, Intel Core Ultra 9, 32GB LPDDR5X, and vapor chamber cooling.",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    approxValue: 219990,
  },
  {
    name: "Sony PlayStation 5 Pro Console (2TB SSD)",
    category: "Gaming",
    description: "PlayStation Spectral Super Resolution (PSSR), advanced ray tracing, 4K 120fps gaming with DualSense.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    approxValue: 68990,
  },
  {
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    category: "Audio",
    description: "Industry-leading noise cancellation with two processors and 8 microphones for exceptional clarity.",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    approxValue: 29990,
  },
  {
    name: "Apple Watch Ultra 2 (Titanium GPS + Cellular, 49mm)",
    category: "Wearables",
    description: "Aerospace-grade titanium case, 3000-nit display, dual-frequency GPS, and up to 72 hours battery life.",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    approxValue: 89900,
  },
  {
    name: "Marshall Stanmore III Bluetooth Home Speaker",
    category: "Audio",
    description: "Re-engineered vintage acoustic design with outward-angled tweeters and updated waveguides.",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    approxValue: 31999,
  },
  {
    name: "Sony Bravia XR 65-inch 4K Ultra HD Smart OLED TV",
    category: "Television",
    description: "Cognitive Processor XR, pure black OLED contrast, Acoustic Surface Audio+, and Google TV built-in.",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80",
    approxValue: 189900,
  },
  {
    name: "Sony Alpha A7 IV Mirrorless Camera (28-70mm Lens Kit)",
    category: "Cameras",
    description: "33MP full-frame Exmor R sensor, 4K 60p 10-bit recording, Real-time Eye AF for photo and video.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    approxValue: 224990,
  },
  {
    name: "Dyson V15 Detect Absolute Cordless Vacuum Cleaner",
    category: "Appliances",
    description: "Laser reveals microscopic dust, piezo sensor sizes and counts particles with 240AW powerful suction.",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
    approxValue: 65900,
  },
  {
    name: "Tanishq 24K Pure Gold Coin (50 Grams Hallmarked)",
    category: "Jewellery & Bullion",
    description: "999.9 purity certified 24 karat bullion gold coin in tamper-evident security certicard packaging.",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80",
    approxValue: 365000,
  },
  {
    name: "5-Day Luxury Bali Private Pool Villa Vacation for Two",
    category: "Travel & Hospitality",
    description: "All-inclusive private oceanfront villa in Ubud/Seminyak with personal chef, spa sessions & flights.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
    approxValue: 185000,
  },
];

const DRAW_BANNERS = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
];

const INDIAN_AVATARS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80",
];

const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Rudra", "Dhruv", "Kabir", "Rohan", "Vikram", "Aryan", "Atharv", "Samar", "Pranav",
  "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Chiara", "Myra", "Anvi", "Ira", "Navya",
  "Riya", "Kavya", "Tanvi", "Pooja", "Sneha", "Priya", "Meera", "Divya", "Aditi", "Anushka",
  "Rahul", "Rajesh", "Suresh", "Manish", "Deepak", "Sunil", "Anil", "Amit", "Alok", "Nikhil",
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Mishra", "Joshi", "Yadav", "Nair",
  "Reddy", "Iyer", "Menon", "Kapoor", "Chopra", "Malhotra", "Saxena", "Bhatia", "Deshmukh", "Patil",
  "Rao", "Sengupta", "Banerjee", "Chatterjee", "Bose", "Dutta", "Das", "Roy", "Chowdhury", "Mehta",
];

const INDIAN_CITIES = [
  "Mumbai, Maharashtra", "Bengaluru, Karnataka", "New Delhi, Delhi", "Hyderabad, Telangana",
  "Jaipur, Rajasthan", "Kolkata, West Bengal", "Pune, Maharashtra", "Ahmedabad, Gujarat",
  "Chandigarh, Punjab", "Lucknow, Uttar Pradesh", "Indore, Madhya Pradesh", "Kochi, Kerala",
];

/* =========================================================================
   MAIN SEEDER IMPLEMENTATION
   ========================================================================= */
async function main() {
  console.log("\n🚀 ========================================================");
  console.log("   SAWARIYA LUCKY DRAW — MASSIVE REALISTIC DEMO SEEDER");
  console.log("========================================================\n");

  // 1. SAFETY ENVIRONMENT CHECK
  const isProd = process.env.NODE_ENV === "production";
  const isExplicit = process.env.ENABLE_DEMO_SEED === "true";

  if (isProd && !isExplicit) {
    console.error("❌ Refusing to run demo seeder in production environment without ENABLE_DEMO_SEED=true");
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    // 2. RETRIEVE OR ENSURE SUPER ADMIN
    console.log("1️⃣  Verifying administrator account...");
    const adminUser = await db.query.user.findFirst({
      where: eq(user.role, user_role.ADMIN),
    });

    if (!adminUser) {
      console.error("❌ Super Admin user not found. Please run 'npm run db:seed' first to setup admin.");
      process.exit(1);
    }
    const adminId = adminUser.id;
    console.log(`   ✓ Found Admin: ${adminUser.name} (ID: ${adminId.toString()})`);

    // 3. GENERATE 100 DEMO USERS
    console.log("\n2️⃣  Generating 100 realistic Indian demo profiles...");
    const demoPasswordHash = await bcrypt.hash("Demo@1234", 10);
    const now = new Date();

    interface UserDraft {
      name: string;
      email: string;
      mobile: string;
      password: string;
      adharcard: string;
      pancard: string;
      address: string;
      avatar: string;
      role: user_role;
      isActive: boolean;
      wallet: number;
      referralCode: string;
      createdAt: Date;
      updatedAt: Date;
    }

    const userDrafts: UserDraft[] = [];
    for (let i = 1; i <= 100; i++) {
      const fn = INDIAN_FIRST_NAMES[(i - 1) % INDIAN_FIRST_NAMES.length];
      const ln = INDIAN_LAST_NAMES[(i * 3) % INDIAN_LAST_NAMES.length];
      const fullName = `${fn} ${ln}`;
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@demo.sawariya.in`;
      const mobile = `98000${String(i).padStart(5, "0")}`; // e.g. 9800000001
      const referralCode = `DEMO${String(100 + i)}`;
      const avatar = INDIAN_AVATARS[(i - 1) % INDIAN_AVATARS.length];
      const address = `${randInt(10, 890)}, ${randChoice(INDIAN_CITIES)}`;
      const adharcard = `XXXX-XXXX-${String(1000 + i)}`;
      const pancard = `DEMOP${String(1000 + i)}X`;
      // Stagger creation dates across the past 30 days
      const daysAgo = randInt(1, 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 + randInt(0, 86400000));

      userDrafts.push({
        name: fullName,
        email,
        mobile,
        password: demoPasswordHash,
        adharcard,
        pancard,
        address,
        avatar,
        role: user_role.USER,
        isActive: true,
        wallet: 0, // will be updated with reconciled wallet balance!
        referralCode,
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Insert Users
    const insertedUsers = await db
      .insert(user)
      .values(userDrafts)
      .onConflictDoNothing()
      .returning({ id: user.id, email: user.email, name: user.name, referralCode: user.referralCode });

    console.log(`   ✓ Inserted ${insertedUsers.length} demo users`);

    // Fetch all current demo users to have guaranteed IDs
    const allDemoUsers = await db.query.user.findMany({
      where: sql`${user.email} LIKE '%@demo.sawariya.in'`,
      columns: { id: true, email: true, name: true, referralCode: true, createdAt: true },
    });

    // Setup 50 referral linkages (User B was referred by User A)
    console.log("   Setting up 50 referral networks...");
    for (let i = 25; i < 75; i++) {
      const referee = allDemoUsers[i];
      const referrer = allDemoUsers[i % 25]; // referrers are from the first 25 users
      if (referee && referrer) {
        await db
          .update(user)
          .set({ referredById: referrer.id })
          .where(eq(user.id, referee.id));
      }
    }
    console.log("   ✓ Configured 50 referral relationships");

    // 4. CREATE 25 RAFFLE DRAWS
    console.log("\n3️⃣  Creating 25 diverse Raffle Draws (Live, Closed, Results Declared)...");

    interface DrawConfig {
      title: string;
      entryFee: number;
      maxTickets: number;
      status: draw_status;
      startTime: Date;
      endTime: Date;
      resultAt?: Date;
      bannerImage: string;
      products: ProductDef[];
    }

    const drawConfigs: DrawConfig[] = [];

    // Category A: 6 LIVE Draws (current active contests)
    const liveDrawTitles = [
      { title: "🏍️ Royal Enfield Hunter 350 Grand Raffle", fee: 99, max: 200, prodIdx: [0] },
      { title: "📱 Apple iPhone 17 Pro Max Mega Contest", fee: 49, max: 250, prodIdx: [4] },
      { title: "⚡ TVS Apache RTR 310 Speedster Draw", fee: 99, max: 150, prodIdx: [1] },
      { title: "💻 M4 MacBook Pro 14 Creator Raffle", fee: 199, max: 100, prodIdx: [8] },
      { title: "🎮 PS5 Pro Ultimate Gaming Bundle", fee: 49, max: 150, prodIdx: [11, 12] },
      { title: "✨ Tanishq 24K Gold Coin 50g Festival Draw", fee: 199, max: 100, prodIdx: [18] },
    ];

    liveDrawTitles.forEach((d, idx) => {
      const startTime = new Date(now.getTime() - (idx + 1) * 24 * 60 * 60 * 1000); // 1-6 days ago
      const endTime = new Date(now.getTime() + (idx + 2) * 24 * 60 * 60 * 1000); // 2-7 days from now
      drawConfigs.push({
        title: d.title,
        entryFee: d.fee,
        maxTickets: d.max,
        status: draw_status.LIVE,
        startTime,
        endTime,
        bannerImage: DRAW_BANNERS[idx % DRAW_BANNERS.length],
        products: d.prodIdx.map((pi) => PRODUCT_CATALOG[pi]),
      });
    });

    // Category B: 4 UPCOMING / DRAFT Draws
    const upcomingDraws = [
      { title: "🏝️ Bali Luxury 5-Star Private Villa Escape", fee: 499, max: 50, prodIdx: [19] },
      { title: "📸 Sony Alpha A7 IV Masterclass Raffle", fee: 199, max: 80, prodIdx: [16] },
      { title: "🛵 Ather 450X Gen 3 Smart EV Commuter", fee: 49, max: 200, prodIdx: [3] },
      { title: "📺 Sony 65-inch Bravia XR 4K OLED Theater", fee: 99, max: 120, prodIdx: [15] },
    ];

    upcomingDraws.forEach((d, idx) => {
      const startTime = new Date(now.getTime() + (idx + 2) * 24 * 60 * 60 * 1000);
      const endTime = new Date(now.getTime() + (idx + 10) * 24 * 60 * 60 * 1000);
      drawConfigs.push({
        title: d.title,
        entryFee: d.fee,
        maxTickets: d.max,
        status: draw_status.DRAFT,
        startTime,
        endTime,
        bannerImage: DRAW_BANNERS[(idx + 2) % DRAW_BANNERS.length],
        products: d.prodIdx.map((pi) => PRODUCT_CATALOG[pi]),
      });
    });

    // Category C: 5 CLOSED Draws (awaiting result declaration)
    const closedDraws = [
      { title: "🎧 Sony WH-1000XM5 Audiophile Raffle", fee: 20, max: 100, prodIdx: [12] },
      { title: "⌚ Apple Watch Ultra 2 Titanium Draw", fee: 49, max: 120, prodIdx: [13] },
      { title: "💻 Apple MacBook Air 15 M3 Superpack", fee: 99, max: 150, prodIdx: [9] },
      { title: "📱 Samsung Galaxy S25 Ultra Power Draw", fee: 99, max: 100, prodIdx: [5] },
      { title: "🧹 Dyson V15 Detect Luxury Home Draw", fee: 49, max: 80, prodIdx: [17] },
    ];

    closedDraws.forEach((d, idx) => {
      const startTime = new Date(now.getTime() - (idx + 6) * 24 * 60 * 60 * 1000);
      const endTime = new Date(now.getTime() - (idx + 1) * 12 * 60 * 60 * 1000); // closed within last 1-3 days
      drawConfigs.push({
        title: d.title,
        entryFee: d.fee,
        maxTickets: d.max,
        status: draw_status.CLOSED,
        startTime,
        endTime,
        bannerImage: DRAW_BANNERS[(idx + 3) % DRAW_BANNERS.length],
        products: d.prodIdx.map((pi) => PRODUCT_CATALOG[pi]),
      });
    });

    // Category D: 10 RESULT_DECLARED Draws (Completed historical draws with verified winners)
    const completedDraws = [
      { title: "🏆 Festive Gold Sovereign 50g Diwali Raffle", fee: 199, max: 100, daysAgo: 14, prodIdx: [18, 12, 14, 13] },
      { title: "🏍️ Yamaha MT-15 Cyber Green Speed Draw", fee: 99, max: 120, daysAgo: 12, prodIdx: [2, 11, 13, 14] },
      { title: "📱 OnePlus 13 Pro 5G Flagship Edition", fee: 49, max: 150, daysAgo: 11, prodIdx: [6, 7, 12, 13] },
      { title: "🎮 ASUS ROG Zephyrus G16 Esports Raffle", fee: 199, max: 80, daysAgo: 9, prodIdx: [10, 11, 12, 13] },
      { title: "🎧 Marshall Stanmore III Vintage Sound Draw", fee: 20, max: 100, daysAgo: 8, prodIdx: [14, 12, 13, 11] },
      { title: "📱 iPad Pro 13 M4 Creative Suite Contest", fee: 99, max: 100, daysAgo: 7, prodIdx: [7, 13, 14, 12] },
      { title: "📱 Apple iPhone 16 Pro Max Launch Edition", fee: 49, max: 200, daysAgo: 5, prodIdx: [4, 11, 12, 13] },
      { title: "🏍️ Royal Enfield Classic 350 Autumn Draw", fee: 99, max: 150, daysAgo: 4, prodIdx: [0, 12, 14, 11] },
      { title: "🎮 PlayStation 5 Pro Holiday Giveaway", fee: 49, max: 120, daysAgo: 2, prodIdx: [11, 12, 13, 14] },
      { title: "⚡ Ather 450X EV Smart Mobility Raffle", fee: 49, max: 100, daysAgo: 1, prodIdx: [3, 13, 11, 12] },
    ];

    completedDraws.forEach((d) => {
      const startTime = new Date(now.getTime() - (d.daysAgo + 5) * 24 * 60 * 60 * 1000);
      const endTime = new Date(now.getTime() - d.daysAgo * 24 * 60 * 60 * 1000);
      const resultAt = new Date(endTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after end
      drawConfigs.push({
        title: d.title,
        entryFee: d.fee,
        maxTickets: d.max,
        status: draw_status.RESULT_DECLARED,
        startTime,
        endTime,
        resultAt,
        bannerImage: DRAW_BANNERS[d.daysAgo % DRAW_BANNERS.length],
        products: d.prodIdx.map((pi) => PRODUCT_CATALOG[pi]),
      });
    });

    // Insert Draws and their DrawProducts
    interface SeededDraw {
      id: bigint;
      title: string;
      entryFee: number;
      maxTickets: number;
      status: draw_status;
      resultAt?: Date | null;
      products: { id: bigint; name: string }[];
    }

    const seededDraws: SeededDraw[] = [];

    for (const dc of drawConfigs) {
      const [insertedDraw] = await db
        .insert(draw)
        .values({
          title: dc.title,
          description: `[DEMO DATASET] Official verifiable contest for ${dc.title}. Cryptographically certified random selection.`,
          bannerImage: dc.bannerImage,
          rules: "DEMO_VERIFIED_CONTEST: All participants must hold a valid KYC profile. Maximum tickets strictly enforced.",
          entryFee: dc.entryFee,
          maxTickets: dc.maxTickets,
          status: dc.status,
          startTime: dc.startTime,
          endTime: dc.endTime,
          resultAt: dc.resultAt ?? null,
          createdAt: dc.startTime,
          updatedAt: new Date(),
        })
        .returning({ id: draw.id });

      // Insert associated products
      const insertedProds: { id: bigint; name: string }[] = [];
      for (const p of dc.products) {
        const [prod] = await db
          .insert(drawproduct)
          .values({
            drawId: insertedDraw.id,
            name: p.name,
            description: p.description,
            image: p.image,
            quantity: 1,
          })
          .returning({ id: drawproduct.id, name: drawproduct.name });
        insertedProds.push(prod);
      }

      seededDraws.push({
        id: insertedDraw.id,
        title: dc.title,
        entryFee: dc.entryFee,
        maxTickets: dc.maxTickets,
        status: dc.status,
        resultAt: dc.resultAt ?? null,
        products: insertedProds,
      });
    }

    console.log(`   ✓ Created ${seededDraws.length} draws with ${seededDraws.reduce((s, d) => s + d.products.length, 0)} product prizes`);

    // 5. GENERATE TICKETS & PAYMENTS
    console.log("\n4️⃣  Generating ~1,400 Tickets and ~150 Reconciled Payment records...");

    interface TicketInsert {
      ticketCode: string;
      userId: bigint;
      drawId: bigint;
      paymentId: bigint | null;
      pricePaid: number;
      status: ticket_status;
      source: ticket_source;
      isWinner: boolean;
      createdAt: Date;
    }

    const allTicketsToInsert: TicketInsert[] = [];
    const paymentRecordsToInsert: Array<{
      userId: bigint;
      drawId: bigint;
      amount: number;
      transactionId: string;
      method: payment_method;
      gateway: payment_gateway;
      walletUsed: number;
      status: payment_status;
      failureReason?: string | null;
      createdAt: Date;
      ticketCount: number;
    }> = [];

    // Track user ticket purchases for wallet debit generation
    const userWalletDebits: Map<string, Array<{ amount: number; date: Date; drawTitle: string }>> = new Map();

    // Loop through each draw to generate realistic ticket volumes
    let paymentSeq = 1;
    let globalTicketSeq = 1;

    for (const d of seededDraws) {
      if (d.status === draw_status.DRAFT) continue; // no tickets for upcoming drafts

      // Calculate how many tickets to sell
      let ticketsToSell = 0;
      if (d.status === draw_status.RESULT_DECLARED) {
        ticketsToSell = Math.min(d.maxTickets, randInt(Math.floor(d.maxTickets * 0.75), d.maxTickets));
      } else if (d.status === draw_status.CLOSED) {
        ticketsToSell = Math.min(d.maxTickets, randInt(Math.floor(d.maxTickets * 0.8), d.maxTickets));
      } else if (d.status === draw_status.LIVE) {
        // Range from 15% to 90%
        ticketsToSell = Math.floor(d.maxTickets * (randInt(20, 85) / 100));
      }

      let drawTicketIndex = 1;

      while (drawTicketIndex <= ticketsToSell) {
        const buyer = randChoice(allDemoUsers);
        // User buys 1 to 4 tickets in one transaction
        const batchCount = Math.min(randInt(1, 3), ticketsToSell - drawTicketIndex + 1);
        const totalPrice = batchCount * d.entryFee;

        // Payment method: UPI (80%), WALLET (20%)
        const isWalletOnly = rng() < 0.2;
        const walletUsed = isWalletOnly ? totalPrice : 0;
        const cashAmount = totalPrice - walletUsed;

        // Stagger creation date
        const paymentDate = new Date(
          d.resultAt
            ? d.resultAt.getTime() - randInt(1, 5) * 24 * 60 * 60 * 1000
            : now.getTime() - randInt(1, 6) * 24 * 60 * 60 * 1000
        );

        const utrNumber = `DEMO-UTR-${String(paymentSeq).padStart(6, "0")}`;
        paymentSeq++;

        paymentRecordsToInsert.push({
          userId: buyer.id,
          drawId: d.id,
          amount: cashAmount,
          transactionId: utrNumber,
          method: isWalletOnly ? payment_method.WALLET : payment_method.UPI,
          gateway: isWalletOnly ? payment_gateway.MANUAL : payment_gateway.RAZORPAY,
          walletUsed,
          status: payment_status.APPROVED,
          createdAt: paymentDate,
          ticketCount: batchCount,
        });

        if (walletUsed > 0) {
          const userKey = buyer.id.toString();
          const existing = userWalletDebits.get(userKey) || [];
          existing.push({ amount: walletUsed, date: paymentDate, drawTitle: d.title });
          userWalletDebits.set(userKey, existing);
        }

        drawTicketIndex += batchCount;
      }
    }

    // Add 20 PENDING Payments (for Admin Dashboard action badge)
    for (let p = 0; p < 20; p++) {
      const buyer = randChoice(allDemoUsers);
      const targetDraw = randChoice(seededDraws.filter((d) => d.status === draw_status.LIVE));
      paymentRecordsToInsert.push({
        userId: buyer.id,
        drawId: targetDraw.id,
        amount: targetDraw.entryFee * randInt(1, 2),
        transactionId: `DEMO-UTR-PENDING-${String(p + 1).padStart(4, "0")}`,
        method: payment_method.UPI,
        gateway: payment_gateway.MANUAL,
        walletUsed: 0,
        status: payment_status.PENDING,
        createdAt: new Date(now.getTime() - randInt(1, 24) * 60 * 60 * 1000), // last 24h
        ticketCount: 0, // no tickets generated yet
      });
    }

    // Add 10 REJECTED Payments
    const rejectionReasons = [
      "UTR mismatch with bank statement",
      "Illegible payment screenshot attached",
      "Duplicate transaction ID already claimed",
      "Payment amount less than required entry fee",
      "Bank transfer timed out or reversed by issuer",
    ];

    for (let r = 0; r < 10; r++) {
      const buyer = randChoice(allDemoUsers);
      const targetDraw = randChoice(seededDraws.filter((d) => d.status === draw_status.LIVE));
      paymentRecordsToInsert.push({
        userId: buyer.id,
        drawId: targetDraw.id,
        amount: targetDraw.entryFee,
        transactionId: `DEMO-UTR-REJ-${String(r + 1).padStart(4, "0")}`,
        method: payment_method.UPI,
        gateway: payment_gateway.MANUAL,
        walletUsed: 0,
        status: payment_status.REJECTED,
        failureReason: rejectionReasons[r % rejectionReasons.length],
        createdAt: new Date(now.getTime() - randInt(2, 48) * 60 * 60 * 1000),
        ticketCount: 0,
      });
    }

    // Insert Payment Records in chunks
    console.log(`   Inserting ${paymentRecordsToInsert.length} payment records in batches...`);
    const insertedPayments: Array<{
      id: bigint;
      userId: bigint;
      drawId: bigint;
      status: payment_status;
      ticketCount: number;
      createdAt: Date;
    }> = [];

    const CHUNK_SIZE = 50;
    for (let i = 0; i < paymentRecordsToInsert.length; i += CHUNK_SIZE) {
      const chunk = paymentRecordsToInsert.slice(i, i + CHUNK_SIZE);
      const inserted = await db
        .insert(payment)
        .values(
          chunk.map((p) => ({
            userId: p.userId,
            drawId: p.drawId,
            amount: p.amount,
            transactionId: p.transactionId,
            method: p.method,
            gateway: p.gateway,
            walletUsed: p.walletUsed,
            status: p.status,
            failureReason: p.failureReason ?? null,
            createdAt: p.createdAt,
            updatedAt: p.createdAt,
          }))
        )
        .returning({ id: payment.id, userId: payment.userId, drawId: payment.drawId, status: payment.status });

      inserted.forEach((item, idx) => {
        insertedPayments.push({
          ...item,
          ticketCount: chunk[idx].ticketCount,
          createdAt: chunk[idx].createdAt,
        });
      });
    }

    console.log(`   ✓ Inserted ${insertedPayments.length} payment records`);

    // Generate Tickets linked to APPROVED payments
    for (const p of insertedPayments) {
      if (p.status !== payment_status.APPROVED || p.ticketCount <= 0) continue;

      const targetDraw = seededDraws.find((d) => d.id === p.drawId)!;
      for (let t = 0; t < p.ticketCount; t++) {
        const ticketCode = `DEMO-${targetDraw.id}-${String(globalTicketSeq).padStart(5, "0")}`;
        globalTicketSeq++;

        allTicketsToInsert.push({
          ticketCode,
          userId: p.userId,
          drawId: p.drawId,
          paymentId: p.id,
          pricePaid: targetDraw.entryFee,
          status: ticket_status.ACTIVE,
          source: ticket_source.USER_PURCHASE,
          isWinner: false,
          createdAt: p.createdAt,
        });
      }
    }

    console.log(`   Inserting ${allTicketsToInsert.length} tickets in batches...`);
    const insertedTickets: Array<{
      id: bigint;
      ticketCode: string;
      userId: bigint;
      drawId: bigint;
      pricePaid: number;
    }> = [];

    for (let i = 0; i < allTicketsToInsert.length; i += 200) {
      const chunk = allTicketsToInsert.slice(i, i + 200);
      const res = await db
        .insert(ticket)
        .values(chunk)
        .returning({
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          userId: ticket.userId,
          drawId: ticket.drawId,
          pricePaid: ticket.pricePaid,
        });
      insertedTickets.push(...res);
    }

    console.log(`   ✓ Inserted ${insertedTickets.length} tickets`);

    // 6. DECLARE 40 WINNERS (in RESULT_DECLARED Draws)
    console.log("\n5️⃣  Declaring 40 verified winners in Completed draws...");

    const completedDrawList = seededDraws.filter((d) => d.status === draw_status.RESULT_DECLARED);
    interface WinnerInsert {
      ticketId: bigint;
      productId: bigint;
      drawId: bigint;
      userId: bigint;
      declaredBy: bigint;
      declaredAt: Date;
    }

    const winnersToInsert: WinnerInsert[] = [];
    const winningTicketIds: bigint[] = [];

    for (const d of completedDrawList) {
      const drawTickets = insertedTickets.filter((t) => t.drawId === d.id);
      if (drawTickets.length === 0) continue;

      // For each product in the draw, pick a winner
      const chosenTickets = randChoices(drawTickets, d.products.length);

      for (let pi = 0; pi < d.products.length; pi++) {
        const winTicket = chosenTickets[pi];
        if (!winTicket) continue;

        winningTicketIds.push(winTicket.id);
        winnersToInsert.push({
          ticketId: winTicket.id,
          productId: d.products[pi].id,
          drawId: d.id,
          userId: winTicket.userId,
          declaredBy: adminId,
          declaredAt: d.resultAt || new Date(),
        });
      }
    }

    // Mark winning tickets as isWinner = true
    if (winningTicketIds.length > 0) {
      for (const tId of winningTicketIds) {
        await db.update(ticket).set({ isWinner: true }).where(eq(ticket.id, tId));
      }
    }

    // Insert winner records
    const insertedWinners = await db
      .insert(winner)
      .values(winnersToInsert)
      .returning({ id: winner.id, userId: winner.userId, drawId: winner.drawId });

    console.log(`   ✓ Inserted ${insertedWinners.length} winner records with isWinner=true`);

    // 7. WALLET TRANSACTIONS & RECONCILED BALANCES
    console.log("\n6️⃣  Generating ~300 Wallet Transactions & Reconciling Balances...");

    interface WalletTxInsert {
      userId: bigint;
      amount: number;
      balanceAfter: number;
      type: wallet_transaction_type;
      source: wallet_transaction_source;
      referenceId?: bigint | null;
      remark: string;
      createdAt: Date;
    }

    const walletTxToInsert: WalletTxInsert[] = [];
    const finalUserBalances: Map<string, number> = new Map();

    for (const u of allDemoUsers) {
      const uId = u.id.toString();
      let currentBal = 0;

      // 1. Initial Promotional Credit
      const promoAmount = randChoice([100, 200, 300, 500]);
      currentBal += promoAmount;
      walletTxToInsert.push({
        userId: u.id,
        amount: promoAmount,
        balanceAfter: currentBal,
        type: wallet_transaction_type.CREDIT,
        source: wallet_transaction_source.ADMIN_ADJUSTMENT,
        remark: "Welcome bonus & promotional credit",
        createdAt: new Date(u.createdAt.getTime() + 1000 * 60 * 10), // 10 mins after registration
      });

      // 2. Referral Rewards (if any)
      if (rng() < 0.3) {
        const refBonus = 50;
        currentBal += refBonus;
        walletTxToInsert.push({
          userId: u.id,
          amount: refBonus,
          balanceAfter: currentBal,
          type: wallet_transaction_type.CREDIT,
          source: wallet_transaction_source.REFERRAL_BONUS,
          remark: "Referral reward: friend joined via your code",
          createdAt: new Date(u.createdAt.getTime() + 1000 * 60 * 60 * 24),
        });
      }

      // 3. Debits from ticket purchases made with wallet
      const debits = userWalletDebits.get(uId) || [];
      for (const deb of debits) {
        if (currentBal >= deb.amount) {
          currentBal -= deb.amount;
          walletTxToInsert.push({
            userId: u.id,
            amount: deb.amount,
            balanceAfter: currentBal,
            type: wallet_transaction_type.DEBIT,
            source: wallet_transaction_source.DRAW_ENTRY,
            remark: `Ticket entry in ${deb.drawTitle}`,
            createdAt: deb.date,
          });
        }
      }

      // 4. Winner Cash Bonus (if user is in winners)
      const userWon = insertedWinners.filter((w) => w.userId === u.id);
      if (userWon.length > 0) {
        const prizeReward = 500;
        currentBal += prizeReward;
        walletTxToInsert.push({
          userId: u.id,
          amount: prizeReward,
          balanceAfter: currentBal,
          type: wallet_transaction_type.CREDIT,
          source: wallet_transaction_source.WIN_REWARD,
          remark: "Grand prize cash reward bonus",
          createdAt: new Date(),
        });
      }

      finalUserBalances.set(uId, currentBal);
    }

    // Insert wallet transactions in batches
    console.log(`   Inserting ${walletTxToInsert.length} wallet transactions...`);
    for (let i = 0; i < walletTxToInsert.length; i += 100) {
      await db.insert(walletTransaction).values(walletTxToInsert.slice(i, i + 100));
    }

    // Update user.wallet column to exactly match the reconciled balance
    console.log("   Reconciling user.wallet balances with transaction ledger...");
    for (const [uId, balance] of finalUserBalances.entries()) {
      await db
        .update(user)
        .set({ wallet: balance })
        .where(eq(user.id, BigInt(uId)));
    }
    console.log("   ✓ Reconciled all 100 user wallet balances 100% mathematically");

    // 8. NOTIFICATIONS (~300 records)
    console.log("\n7️⃣  Generating ~300 Notifications across all user accounts...");

    interface NotifInsert {
      userId: bigint;
      title: string;
      message: string;
      isRead: boolean;
      createdAt: Date;
    }

    const notificationsToInsert: NotifInsert[] = [];

    for (const u of allDemoUsers) {
      // 1. Welcome Notification
      notificationsToInsert.push({
        userId: u.id,
        title: "Welcome to Sawariya Lucky Draw!",
        message: "Your profile is active. Browse live draws and participate for verified prizes.",
        isRead: rng() > 0.3,
        createdAt: u.createdAt,
      });

      // 2. Draw Alert / Promotion
      notificationsToInsert.push({
        userId: u.id,
        title: "⚡ Live Draw Alert: Limited Tickets Left!",
        message: "Participation is closing soon for top tech and superbike draws. Secure your tickets before slots fill up.",
        isRead: rng() > 0.4,
        createdAt: new Date(now.getTime() - randInt(1, 14) * 24 * 60 * 60 * 1000),
      });

      // 3. Ticket / Transaction Alerts
      if (rng() > 0.35) {
        notificationsToInsert.push({
          userId: u.id,
          title: "Ticket Order Confirmed",
          message: "Your payment was verified. Your cryptographic entry pass is now stored in your Ticket Vault.",
          isRead: rng() > 0.5,
          createdAt: new Date(now.getTime() - randInt(1, 10) * 24 * 60 * 60 * 1000),
        });
      }

      // 4. Winner announcement alert for winners
      const isWinnerUser = insertedWinners.some((w) => w.userId === u.id);
      if (isWinnerUser) {
        notificationsToInsert.push({
          userId: u.id,
          title: "🎉 CONGRATULATIONS! YOU WON!",
          message: "Your ticket was officially drawn as a winning entry! View your prize details in Hall of Fame.",
          isRead: false,
          createdAt: new Date(now.getTime() - randInt(1, 48) * 60 * 60 * 1000),
        });
      }
    }

    // Insert notifications in chunks
    for (let i = 0; i < notificationsToInsert.length; i += 100) {
      await db.insert(notification).values(notificationsToInsert.slice(i, i + 100));
    }
    console.log(`   ✓ Inserted ${notificationsToInsert.length} notifications`);

    // 9. AUDIT LOGS (150 records)
    console.log("\n8️⃣  Generating 150 Audit Log entries for Admin SaaS monitoring...");

    interface AuditInsert {
      action: string;
      entity: string;
      entityId: bigint;
      adminId: bigint;
      meta: string;
      createdAt: Date;
    }

    const auditLogsToInsert: AuditInsert[] = [];
    const auditActions = [
      { action: "DRAW_CREATED", entity: "draw" },
      { action: "PAYMENT_APPROVED", entity: "payment" },
      { action: "PAYMENT_REJECTED", entity: "payment" },
      { action: "WINNER_DECLARED", entity: "winner" },
      { action: "KYC_VERIFIED", entity: "user" },
      { action: "WALLET_ADJUSTED", entity: "wallet" },
    ];

    for (let i = 1; i <= 150; i++) {
      const act = randChoice(auditActions);
      const daysAgo = randInt(0, 14);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - randInt(0, 86400000));

      auditLogsToInsert.push({
        action: act.action,
        entity: act.entity,
        entityId: BigInt(i),
        adminId,
        meta: JSON.stringify({ isDemo: true, seedVersion: "1.0", step: i }),
        createdAt,
      });
    }

    for (let i = 0; i < auditLogsToInsert.length; i += 50) {
      await db.insert(auditlog).values(auditLogsToInsert.slice(i, i + 50));
    }
    console.log(`   ✓ Inserted ${auditLogsToInsert.length} audit logs`);

    // 10. FINAL SUMMARY AND VERIFICATION REPORT
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n========================================================");
    console.log(`🎉 MASSIVE DEMO SEEDING COMPLETED IN ${elapsed}s!`);
    console.log("========================================================");
    console.log(`   👥 Demo Users:            ${allDemoUsers.length}`);
    console.log(`   🎁 Draw Products:         ${PRODUCT_CATALOG.length}`);
    console.log(`   🎯 Raffle Draws:          ${seededDraws.length}`);
    console.log(`   🎟️  Total Tickets:         ${insertedTickets.length}`);
    console.log(`   💳 Payment Records:       ${insertedPayments.length}`);
    console.log(`   💰 Wallet Transactions:   ${walletTxToInsert.length}`);
    console.log(`   🏆 Declared Winners:      ${insertedWinners.length}`);
    console.log(`   🔔 Notifications:         ${notificationsToInsert.length}`);
    console.log(`   📝 Audit Logs:            ${auditLogsToInsert.length}`);
    console.log("========================================================\n");

  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
