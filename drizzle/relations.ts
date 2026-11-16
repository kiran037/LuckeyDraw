import { relations } from "drizzle-orm/relations";
import { user, notification, draw, ticket, payment, walletTransaction, winner, drawproduct } from "./schema";

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({one, many}) => ({
	notifications: many(notification),
	tickets: many(ticket),
	walletTransactions: many(walletTransaction),
	payments: many(payment),
	winners_declaredBy: many(winner, {
		relationName: "winner_declaredBy_user_id"
	}),
	winners_userId: many(winner, {
		relationName: "winner_userId_user_id"
	}),
	user: one(user, {
		fields: [user.referredById],
		references: [user.id],
		relationName: "user_referredById_user_id"
	}),
	users: many(user, {
		relationName: "user_referredById_user_id"
	}),
}));

export const ticketRelations = relations(ticket, ({one, many}) => ({
	draw: one(draw, {
		fields: [ticket.drawId],
		references: [draw.id]
	}),
	payment: one(payment, {
		fields: [ticket.paymentId],
		references: [payment.id]
	}),
	user: one(user, {
		fields: [ticket.userId],
		references: [user.id]
	}),
	winners: many(winner),
}));

export const drawRelations = relations(draw, ({many}) => ({
	tickets: many(ticket),
	payments: many(payment),
	winners: many(winner),
	drawproducts: many(drawproduct),
}));

export const paymentRelations = relations(payment, ({one, many}) => ({
	tickets: many(ticket),
	draw: one(draw, {
		fields: [payment.drawId],
		references: [draw.id]
	}),
	user: one(user, {
		fields: [payment.userId],
		references: [user.id]
	}),
}));

export const walletTransactionRelations = relations(walletTransaction, ({one}) => ({
	user: one(user, {
		fields: [walletTransaction.userId],
		references: [user.id]
	}),
}));

export const winnerRelations = relations(winner, ({one}) => ({
	user_declaredBy: one(user, {
		fields: [winner.declaredBy],
		references: [user.id],
		relationName: "winner_declaredBy_user_id"
	}),
	draw: one(draw, {
		fields: [winner.drawId],
		references: [draw.id]
	}),
	drawproduct: one(drawproduct, {
		fields: [winner.productId],
		references: [drawproduct.id]
	}),
	ticket: one(ticket, {
		fields: [winner.ticketId],
		references: [ticket.id]
	}),
	user_userId: one(user, {
		fields: [winner.userId],
		references: [user.id],
		relationName: "winner_userId_user_id"
	}),
}));

export const drawproductRelations = relations(drawproduct, ({one, many}) => ({
	winners: many(winner),
	draw: one(draw, {
		fields: [drawproduct.drawId],
		references: [draw.id]
	}),
}));