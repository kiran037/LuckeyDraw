import {
  pgTable,
  bigserial,
  text,
  bigint,
  timestamp,
  index,
  foreignKey,
  boolean,
  uniqueIndex,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

/* =========================================================================
   ENUMS
   ========================================================================= */

export const drawStatusEnum = pgEnum("draw_status", [
  "DRAFT",
  "LIVE",
  "CLOSED",
  "RESULT_DECLARED",
]);
export const paymentGatewayEnum = pgEnum("payment_gateway", [
  "RAZORPAY",
  "STRIPE",
  "PAYTM",
  "MANUAL",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "UPI",
  "CARD",
  "NET_BANKING",
  "WALLET",
  "CASH",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const ticketSourceEnum = pgEnum("ticket_source", [
  "USER_PURCHASE",
  "ADMIN_MANUAL",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "ACTIVE",
  "CANCELLED",
  "REFUNDED",
]);
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);
export const walletTransactionSourceEnum = pgEnum("wallet_transaction_source", [
  "REFERRAL_BONUS",
  "DRAW_ENTRY",
  "REFUND",
  "ADMIN_ADJUSTMENT",
  "WIN_REWARD",
]);
export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "CREDIT",
  "DEBIT",
]);

// Enum value objects and TypeScript types
export const draw_status = {
  DRAFT: "DRAFT",
  LIVE: "LIVE",
  CLOSED: "CLOSED",
  RESULT_DECLARED: "RESULT_DECLARED",
} as const;
export type draw_status = (typeof draw_status)[keyof typeof draw_status];

export const payment_gateway = {
  RAZORPAY: "RAZORPAY",
  STRIPE: "STRIPE",
  PAYTM: "PAYTM",
  MANUAL: "MANUAL",
} as const;
export type payment_gateway =
  (typeof payment_gateway)[keyof typeof payment_gateway];

export const payment_method = {
  UPI: "UPI",
  CARD: "CARD",
  NET_BANKING: "NET_BANKING",
  WALLET: "WALLET",
  CASH: "CASH",
} as const;
export type payment_method =
  (typeof payment_method)[keyof typeof payment_method];

export const payment_status = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type payment_status =
  (typeof payment_status)[keyof typeof payment_status];

export const ticket_source = {
  USER_PURCHASE: "USER_PURCHASE",
  ADMIN_MANUAL: "ADMIN_MANUAL",
} as const;
export type ticket_source = (typeof ticket_source)[keyof typeof ticket_source];

export const ticket_status = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type ticket_status = (typeof ticket_status)[keyof typeof ticket_status];

export const user_role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type user_role = (typeof user_role)[keyof typeof user_role];

export const wallet_transaction_source = {
  REFERRAL_BONUS: "REFERRAL_BONUS",
  DRAW_ENTRY: "DRAW_ENTRY",
  REFUND: "REFUND",
  ADMIN_ADJUSTMENT: "ADMIN_ADJUSTMENT",
  WIN_REWARD: "WIN_REWARD",
} as const;
export type wallet_transaction_source =
  (typeof wallet_transaction_source)[keyof typeof wallet_transaction_source];

export const wallet_transaction_type = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;
export type wallet_transaction_type =
  (typeof wallet_transaction_type)[keyof typeof wallet_transaction_type];

/* =========================================================================
   TABLES
   ========================================================================= */

export const auditlog = pgTable("auditlog", {
  id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
  action: text().notNull(),
  entity: text().notNull(),
  entityId: bigint({ mode: "bigint" }),
  adminId: bigint({ mode: "bigint" }),
  meta: text(),
  createdAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const user = pgTable(
  "user",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    email: text(),
    password: text().notNull(),
    name: text().notNull(),
    adharcard: text().notNull(),
    pancard: text().notNull(),
    address: text().notNull(),
    avatar: text(),
    role: userRoleEnum().default("USER").notNull(),
    isActive: boolean().default(true).notNull(),
    mobile: text().notNull(),
    wallet: integer().default(0).notNull(),
    referralCode: text().notNull(),
    referredById: bigint({ mode: "bigint" }),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("user_mobile_key").using(
      "btree",
      table.mobile.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("user_referralCode_key").using(
      "btree",
      table.referralCode.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.referredById],
      foreignColumns: [table.id],
      name: "user_referredById_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ]
);

export const draw = pgTable(
  "draw",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    title: text().notNull(),
    description: text(),
    bannerImage: text(),
    rules: text(),
    entryFee: integer().notNull(),
    startTime: timestamp({ precision: 3, mode: "date" }).notNull(),
    endTime: timestamp({ precision: 3, mode: "date" }).notNull(),
    resultAt: timestamp({ precision: 3, mode: "date" }),
    maxTickets: integer().notNull(),
    status: drawStatusEnum().default("DRAFT").notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("draw_endTime_idx").using(
      "btree",
      table.endTime.asc().nullsLast().op("timestamp_ops")
    ),
    index("draw_startTime_idx").using(
      "btree",
      table.startTime.asc().nullsLast().op("timestamp_ops")
    ),
    index("draw_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops")
    ),
  ]
);

export const drawproduct = pgTable(
  "drawproduct",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    drawId: bigint({ mode: "bigint" }).notNull(),
    name: text().notNull(),
    image: text(),
    quantity: integer().notNull(),
    description: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("drawproduct_drawId_idx").using(
      "btree",
      table.drawId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.drawId],
      foreignColumns: [draw.id],
      name: "drawproduct_drawId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const payment = pgTable(
  "payment",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint({ mode: "bigint" }).notNull(),
    drawId: bigint({ mode: "bigint" }).notNull(),
    amount: integer().notNull(),
    transactionId: text(),
    gatewayOrderId: text(),
    gatewayPaymentId: text(),
    method: paymentMethodEnum().notNull(),
    gateway: paymentGatewayEnum().notNull(),
    walletUsed: integer().default(0).notNull(),
    screenshot: text(),
    failureReason: text(),
    status: paymentStatusEnum().default("PENDING").notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payment_drawId_idx").using(
      "btree",
      table.drawId.asc().nullsLast().op("int8_ops")
    ),
    index("payment_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops")
    ),
    uniqueIndex("payment_transactionId_key").using(
      "btree",
      table.transactionId.asc().nullsLast().op("text_ops")
    ),
    index("payment_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.drawId],
      foreignColumns: [draw.id],
      name: "payment_drawId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "payment_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const ticket = pgTable(
  "ticket",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    ticketCode: text().notNull(),
    userId: bigint({ mode: "bigint" }).notNull(),
    drawId: bigint({ mode: "bigint" }).notNull(),
    paymentId: bigint({ mode: "bigint" }),
    pricePaid: integer().notNull(),
    status: ticketStatusEnum().default("ACTIVE").notNull(),
    source: ticketSourceEnum().notNull(),
    isWinner: boolean().default(false).notNull(),
    coverImage: text(),
    createdByAdminId: bigint({ mode: "bigint" }),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("ticket_drawId_idx").using(
      "btree",
      table.drawId.asc().nullsLast().op("int8_ops")
    ),
    index("ticket_paymentId_idx").using(
      "btree",
      table.paymentId.asc().nullsLast().op("int8_ops")
    ),
    uniqueIndex("ticket_ticketCode_key").using(
      "btree",
      table.ticketCode.asc().nullsLast().op("text_ops")
    ),
    index("ticket_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.drawId],
      foreignColumns: [draw.id],
      name: "ticket_drawId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.paymentId],
      foreignColumns: [payment.id],
      name: "ticket_paymentId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ticket_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const notification = pgTable(
  "notification",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint({ mode: "bigint" }).notNull(),
    title: text().notNull(),
    message: text().notNull(),
    isRead: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("notification_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "notification_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const walletTransaction = pgTable(
  "wallet_transaction",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint({ mode: "bigint" }).notNull(),
    amount: integer().notNull(),
    balanceAfter: integer().notNull(),
    type: walletTransactionTypeEnum().notNull(),
    source: walletTransactionSourceEnum().notNull(),
    referenceId: bigint({ mode: "bigint" }),
    remark: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("wallet_transaction_type_idx").using(
      "btree",
      table.type.asc().nullsLast().op("enum_ops")
    ),
    index("wallet_transaction_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "wallet_transaction_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);
export const wallet_transaction = walletTransaction;

export const winner = pgTable(
  "winner",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    ticketId: bigint({ mode: "bigint" }).notNull(),
    productId: bigint({ mode: "bigint" }).notNull(),
    drawId: bigint({ mode: "bigint" }).notNull(),
    userId: bigint({ mode: "bigint" }).notNull(),
    declaredBy: bigint({ mode: "bigint" }).notNull(),
    declaredAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("winner_declaredBy_idx").using(
      "btree",
      table.declaredBy.asc().nullsLast().op("int8_ops")
    ),
    index("winner_drawId_idx").using(
      "btree",
      table.drawId.asc().nullsLast().op("int8_ops")
    ),
    index("winner_productId_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("int8_ops")
    ),
    uniqueIndex("winner_ticketId_key").using(
      "btree",
      table.ticketId.asc().nullsLast().op("int8_ops")
    ),
    index("winner_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.declaredBy],
      foreignColumns: [user.id],
      name: "winner_declaredBy_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.drawId],
      foreignColumns: [draw.id],
      name: "winner_drawId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [drawproduct.id],
      name: "winner_productId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.ticketId],
      foreignColumns: [ticket.id],
      name: "winner_ticketId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "winner_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const referralConfig = pgTable("referral_config", {
  id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
  referrerBonus: integer().notNull(),
  refereeBonus: integer().notNull(),
  isActive: boolean().default(true).notNull(),
});
export const referral_config = referralConfig;

/* =========================================================================
   RELATIONS
   ========================================================================= */

export const userRelations = relations(user, ({ one, many }) => ({
  notifications: many(notification),
  tickets: many(ticket, { relationName: "userTickets" }),
  walletTransactions: many(walletTransaction),
  payments: many(payment),
  winners_declaredBy: many(winner, {
    relationName: "winner_declaredBy_user",
  }),
  winners: many(winner, {
    relationName: "winner_user",
  }),
  referredBy: one(user, {
    fields: [user.referredById],
    references: [user.id],
    relationName: "user_referrals",
  }),
  referrals: many(user, {
    relationName: "user_referrals",
  }),
}));

export const drawRelations = relations(draw, ({ many }) => ({
  drawproduct: many(drawproduct),
  drawproducts: many(drawproduct),
  payment: many(payment),
  payments: many(payment),
  ticket: many(ticket),
  tickets: many(ticket),
  winner: many(winner),
  winners: many(winner),
}));

export const drawproductRelations = relations(drawproduct, ({ one, many }) => ({
  draw: one(draw, {
    fields: [drawproduct.drawId],
    references: [draw.id],
  }),
  winner: many(winner),
  winners: many(winner),
}));

export const paymentRelations = relations(payment, ({ one, many }) => ({
  draw: one(draw, {
    fields: [payment.drawId],
    references: [draw.id],
  }),
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
  ticket: one(ticket),
  tickets: many(ticket),
}));

export const ticketRelations = relations(ticket, ({ one, many }) => ({
  draw: one(draw, {
    fields: [ticket.drawId],
    references: [draw.id],
  }),
  payment: one(payment, {
    fields: [ticket.paymentId],
    references: [payment.id],
  }),
  user: one(user, {
    fields: [ticket.userId],
    references: [user.id],
    relationName: "userTickets",
  }),
  winner: one(winner),
  winners: many(winner),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const walletTransactionRelations = relations(
  walletTransaction,
  ({ one }) => ({
    user: one(user, {
      fields: [walletTransaction.userId],
      references: [user.id],
    }),
  })
);

export const winnerRelations = relations(winner, ({ one }) => ({
  admin: one(user, {
    fields: [winner.declaredBy],
    references: [user.id],
    relationName: "winner_declaredBy_user",
  }),
  draw: one(draw, {
    fields: [winner.drawId],
    references: [draw.id],
  }),
  drawproduct: one(drawproduct, {
    fields: [winner.productId],
    references: [drawproduct.id],
  }),
  ticket: one(ticket, {
    fields: [winner.ticketId],
    references: [ticket.id],
  }),
  user: one(user, {
    fields: [winner.userId],
    references: [user.id],
    relationName: "winner_user",
  }),
}));

/* =========================================================================
   INFERRED TYPES
   ========================================================================= */

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Draw = typeof draw.$inferSelect;
export type NewDraw = typeof draw.$inferInsert;

export type DrawProduct = typeof drawproduct.$inferSelect;
export type NewDrawProduct = typeof drawproduct.$inferInsert;

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;

export type Ticket = typeof ticket.$inferSelect;
export type NewTicket = typeof ticket.$inferInsert;

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;

export type WalletTransaction = typeof walletTransaction.$inferSelect;
export type NewWalletTransaction = typeof walletTransaction.$inferInsert;

export type Winner = typeof winner.$inferSelect;
export type NewWinner = typeof winner.$inferInsert;

export type ReferralConfig = typeof referralConfig.$inferSelect;
export type NewReferralConfig = typeof referralConfig.$inferInsert;

export type AuditLog = typeof auditlog.$inferSelect;
export type NewAuditLog = typeof auditlog.$inferInsert;
