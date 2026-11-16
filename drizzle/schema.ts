import { pgTable, bigserial, text, bigint, timestamp, index, foreignKey, boolean, uniqueIndex, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const drawStatus = pgEnum("draw_status", ['DRAFT', 'LIVE', 'CLOSED', 'RESULT_DECLARED'])
export const paymentGateway = pgEnum("payment_gateway", ['RAZORPAY', 'STRIPE', 'PAYTM', 'MANUAL'])
export const paymentMethod = pgEnum("payment_method", ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH'])
export const paymentStatus = pgEnum("payment_status", ['PENDING', 'APPROVED', 'REJECTED'])
export const ticketSource = pgEnum("ticket_source", ['USER_PURCHASE', 'ADMIN_MANUAL'])
export const ticketStatus = pgEnum("ticket_status", ['ACTIVE', 'CANCELLED', 'REFUNDED'])
export const userRole = pgEnum("user_role", ['USER', 'ADMIN'])
export const walletTransactionSource = pgEnum("wallet_transaction_source", ['REFERRAL_BONUS', 'DRAW_ENTRY', 'REFUND', 'ADMIN_ADJUSTMENT', 'WIN_REWARD'])
export const walletTransactionType = pgEnum("wallet_transaction_type", ['CREDIT', 'DEBIT'])


export const auditlog = pgTable("auditlog", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	action: text().notNull(),
	entity: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	entityId: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	adminId: bigint({ mode: "number" }),
	meta: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const notification = pgTable("notification", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint({ mode: "number" }).notNull(),
	title: text().notNull(),
	message: text().notNull(),
	isRead: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("notification_userId_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const ticket = pgTable("ticket", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	ticketCode: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	drawId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentId: bigint({ mode: "number" }),
	pricePaid: integer().notNull(),
	status: ticketStatus().default('ACTIVE').notNull(),
	source: ticketSource().notNull(),
	isWinner: boolean().default(false).notNull(),
	coverImage: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdByAdminId: bigint({ mode: "number" }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ticket_drawId_idx").using("btree", table.drawId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("ticket_paymentId_key").using("btree", table.paymentId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("ticket_ticketCode_key").using("btree", table.ticketCode.asc().nullsLast().op("text_ops")),
	index("ticket_userId_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.drawId],
			foreignColumns: [draw.id],
			name: "ticket_drawId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.paymentId],
			foreignColumns: [payment.id],
			name: "ticket_paymentId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ticket_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const walletTransaction = pgTable("wallet_transaction", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint({ mode: "number" }).notNull(),
	amount: integer().notNull(),
	balanceAfter: integer().notNull(),
	type: walletTransactionType().notNull(),
	source: walletTransactionSource().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	referenceId: bigint({ mode: "number" }),
	remark: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("wallet_transaction_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	index("wallet_transaction_userId_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "wallet_transaction_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const payment = pgTable("payment", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	drawId: bigint({ mode: "number" }).notNull(),
	amount: integer().notNull(),
	transactionId: text(),
	gatewayOrderId: text(),
	gatewayPaymentId: text(),
	method: paymentMethod().notNull(),
	gateway: paymentGateway().notNull(),
	walletUsed: integer().default(0).notNull(),
	screenshot: text(),
	failureReason: text(),
	status: paymentStatus().default('PENDING').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("payment_drawId_idx").using("btree", table.drawId.asc().nullsLast().op("int8_ops")),
	index("payment_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	uniqueIndex("payment_transactionId_key").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	index("payment_userId_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.drawId],
			foreignColumns: [draw.id],
			name: "payment_drawId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "payment_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const winner = pgTable("winner", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ticketId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	drawId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	declaredBy: bigint({ mode: "number" }).notNull(),
	declaredAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("winner_declaredBy_idx").using("btree", table.declaredBy.asc().nullsLast().op("int8_ops")),
	index("winner_drawId_idx").using("btree", table.drawId.asc().nullsLast().op("int8_ops")),
	index("winner_productId_idx").using("btree", table.productId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("winner_ticketId_key").using("btree", table.ticketId.asc().nullsLast().op("int8_ops")),
	index("winner_userId_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.declaredBy],
			foreignColumns: [user.id],
			name: "winner_declaredBy_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.drawId],
			foreignColumns: [draw.id],
			name: "winner_drawId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [drawproduct.id],
			name: "winner_productId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [ticket.id],
			name: "winner_ticketId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "winner_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const referralConfig = pgTable("referral_config", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	referrerBonus: integer().notNull(),
	refereeBonus: integer().notNull(),
	isActive: boolean().default(true).notNull(),
});

export const draw = pgTable("draw", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	bannerImage: text(),
	rules: text(),
	entryFee: integer().notNull(),
	startTime: timestamp({ precision: 3, mode: 'string' }).notNull(),
	endTime: timestamp({ precision: 3, mode: 'string' }).notNull(),
	resultAt: timestamp({ precision: 3, mode: 'string' }),
	maxTickets: integer().notNull(),
	status: drawStatus().default('DRAFT').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("draw_endTime_idx").using("btree", table.endTime.asc().nullsLast().op("timestamp_ops")),
	index("draw_startTime_idx").using("btree", table.startTime.asc().nullsLast().op("timestamp_ops")),
	index("draw_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
]);

export const drawproduct = pgTable("drawproduct", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	drawId: bigint({ mode: "number" }).notNull(),
	name: text().notNull(),
	image: text(),
	quantity: integer().notNull(),
	description: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("drawproduct_drawId_idx").using("btree", table.drawId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.drawId],
			foreignColumns: [draw.id],
			name: "drawproduct_drawId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const user = pgTable("user", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	email: text(),
	password: text().notNull(),
	name: text().notNull(),
	adharcard: text().notNull(),
	pancard: text().notNull(),
	address: text().notNull(),
	avatar: text(),
	role: userRole().default('USER').notNull(),
	isActive: boolean().default(true).notNull(),
	mobile: text().notNull(),
	wallet: integer().default(0).notNull(),
	referralCode: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	referredById: bigint({ mode: "number" }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("user_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_mobile_key").using("btree", table.mobile.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_referralCode_key").using("btree", table.referralCode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.referredById],
			foreignColumns: [table.id],
			name: "user_referredById_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);
