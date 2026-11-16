-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."draw_status" AS ENUM('DRAFT', 'LIVE', 'CLOSED', 'RESULT_DECLARED');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('RAZORPAY', 'STRIPE', 'PAYTM', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."ticket_source" AS ENUM('USER_PURCHASE', 'ADMIN_MANUAL');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('ACTIVE', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_source" AS ENUM('REFERRAL_BONUS', 'DRAW_ENTRY', 'REFUND', 'ADMIN_ADJUSTMENT', 'WIN_REWARD');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type" AS ENUM('CREDIT', 'DEBIT');--> statement-breakpoint
CREATE TABLE "auditlog" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entityId" bigint,
	"adminId" bigint,
	"meta" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ticketCode" text NOT NULL,
	"userId" bigint NOT NULL,
	"drawId" bigint NOT NULL,
	"paymentId" bigint,
	"pricePaid" integer NOT NULL,
	"status" "ticket_status" DEFAULT 'ACTIVE' NOT NULL,
	"source" "ticket_source" NOT NULL,
	"isWinner" boolean DEFAULT false NOT NULL,
	"coverImage" text,
	"createdByAdminId" bigint,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transaction" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"amount" integer NOT NULL,
	"balanceAfter" integer NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"source" "wallet_transaction_source" NOT NULL,
	"referenceId" bigint,
	"remark" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"drawId" bigint NOT NULL,
	"amount" integer NOT NULL,
	"transactionId" text,
	"gatewayOrderId" text,
	"gatewayPaymentId" text,
	"method" "payment_method" NOT NULL,
	"gateway" "payment_gateway" NOT NULL,
	"walletUsed" integer DEFAULT 0 NOT NULL,
	"screenshot" text,
	"failureReason" text,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winner" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ticketId" bigint NOT NULL,
	"productId" bigint NOT NULL,
	"drawId" bigint NOT NULL,
	"userId" bigint NOT NULL,
	"declaredBy" bigint NOT NULL,
	"declaredAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_config" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"referrerBonus" integer NOT NULL,
	"refereeBonus" integer NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draw" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"bannerImage" text,
	"rules" text,
	"entryFee" integer NOT NULL,
	"startTime" timestamp(3) NOT NULL,
	"endTime" timestamp(3) NOT NULL,
	"resultAt" timestamp(3),
	"maxTickets" integer NOT NULL,
	"status" "draw_status" DEFAULT 'DRAFT' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drawproduct" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"drawId" bigint NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"quantity" integer NOT NULL,
	"description" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"adharcard" text NOT NULL,
	"pancard" text NOT NULL,
	"address" text NOT NULL,
	"avatar" text,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"mobile" text NOT NULL,
	"wallet" integer DEFAULT 0 NOT NULL,
	"referralCode" text NOT NULL,
	"referredById" bigint,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "public"."draw"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payment"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "public"."draw"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "winner" ADD CONSTRAINT "winner_declaredBy_fkey" FOREIGN KEY ("declaredBy") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "winner" ADD CONSTRAINT "winner_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "public"."draw"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "winner" ADD CONSTRAINT "winner_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."drawproduct"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "winner" ADD CONSTRAINT "winner_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."ticket"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "winner" ADD CONSTRAINT "winner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "drawproduct" ADD CONSTRAINT "drawproduct_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "public"."draw"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("userId" int8_ops);--> statement-breakpoint
CREATE INDEX "ticket_drawId_idx" ON "ticket" USING btree ("drawId" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_paymentId_key" ON "ticket" USING btree ("paymentId" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_ticketCode_key" ON "ticket" USING btree ("ticketCode" text_ops);--> statement-breakpoint
CREATE INDEX "ticket_userId_idx" ON "ticket" USING btree ("userId" int8_ops);--> statement-breakpoint
CREATE INDEX "wallet_transaction_type_idx" ON "wallet_transaction" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "wallet_transaction_userId_idx" ON "wallet_transaction" USING btree ("userId" int8_ops);--> statement-breakpoint
CREATE INDEX "payment_drawId_idx" ON "payment" USING btree ("drawId" int8_ops);--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_transactionId_key" ON "payment" USING btree ("transactionId" text_ops);--> statement-breakpoint
CREATE INDEX "payment_userId_idx" ON "payment" USING btree ("userId" int8_ops);--> statement-breakpoint
CREATE INDEX "winner_declaredBy_idx" ON "winner" USING btree ("declaredBy" int8_ops);--> statement-breakpoint
CREATE INDEX "winner_drawId_idx" ON "winner" USING btree ("drawId" int8_ops);--> statement-breakpoint
CREATE INDEX "winner_productId_idx" ON "winner" USING btree ("productId" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "winner_ticketId_key" ON "winner" USING btree ("ticketId" int8_ops);--> statement-breakpoint
CREATE INDEX "winner_userId_idx" ON "winner" USING btree ("userId" int8_ops);--> statement-breakpoint
CREATE INDEX "draw_endTime_idx" ON "draw" USING btree ("endTime" timestamp_ops);--> statement-breakpoint
CREATE INDEX "draw_startTime_idx" ON "draw" USING btree ("startTime" timestamp_ops);--> statement-breakpoint
CREATE INDEX "draw_status_idx" ON "draw" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "drawproduct_drawId_idx" ON "drawproduct" USING btree ("drawId" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_mobile_key" ON "user" USING btree ("mobile" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_referralCode_key" ON "user" USING btree ("referralCode" text_ops);
*/