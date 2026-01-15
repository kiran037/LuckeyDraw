// src/lib/types.ts

/* ===================== ENUMS ===================== */

export type DrawStatus = "DRAFT" | "LIVE" | "CLOSED" | "RESULT_DECLARED";

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PaymentMethod =
  | "UPI"
  | "CARD"
  | "NET_BANKING"
  | "WALLET"
  | "CASH";

export type PaymentGateway =
  | "RAZORPAY"
  | "STRIPE"
  | "PAYTM"
  | "MANUAL";

export type TicketSource = "USER_PURCHASE" | "ADMIN_MANUAL";

export type TicketStatus = "ACTIVE" | "CANCELLED" | "REFUNDED";

export type UserRole = "USER" | "ADMIN";

/* ===================== CORE MODELS ===================== */

export interface User {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  avatar?: string | null;
  wallet: number;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO
}

/* --------------------- DRAW --------------------- */

export interface Draw {
  id: string;
  title: string;
  description: string | null;

  bannerImage?: string | null;
  rules?: string | null;

  entryFee: number;
  startTime: string; // ISO
  endTime: string;   // ISO
  resultAt?: string | null; // ISO

  maxTickets: number;
  status: DrawStatus;

  createdAt: string;
  updatedAt: string;

  // Relations & Computed Fields
  products?: DrawProduct[];
  ticketCount?: number;

  // UI Helper Fields (Returned by specific API routes)
  productImage?: string | null;
}

/* ------------------ DRAW PRODUCT ------------------ */

export interface DrawProduct {
  id: string;
  drawId: string;
  name: string;
  image: string | null;
  quantity: number;
  description: string | null;
  createdAt: string;
}

/* --------------------- TICKET --------------------- */

export interface Ticket {
  id: string;
  ticketCode: string;

  userId: string;
  drawId: string;
  paymentId: string | null;

  pricePaid: number;
  status: TicketStatus;

  source: TicketSource;
  isWinner: boolean;

  coverImage?: string | null;
  createdAt: string;

  // Relations
  draw?: Draw;
  payment?: Payment;
}

/* -------------------- PAYMENT -------------------- */

export interface Payment {
  id: string;
  userId: string;
  drawId: string;

  amount: number;

  transactionId?: string | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;

  method: PaymentMethod;
  gateway: PaymentGateway;

  screenshot?: string | null;
  failureReason?: string | null;

  status: PaymentStatus;

  createdAt: string;
  updatedAt: string;

  draw?: Draw;
}

/* --------------------- WINNER --------------------- */

export interface Winner {
  id: string;
  ticketId: string;
  productId: string;
  drawId: string;
  userId: string;
  declaredBy: string;
  declaredAt: string;

  ticket?: Ticket;
  product?: DrawProduct;
  draw?: Draw;
  user?: User;
}

/* ------------------ NOTIFICATION ------------------ */

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/* ===================== API ===================== */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}