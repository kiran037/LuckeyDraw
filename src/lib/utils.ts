// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  DrawStatus,
  PaymentStatus,
  TicketSource,
  TicketStatus,
} from "./types";

/* ===================== TAILWIND MERGE ===================== */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ===================== STATUS CONFIGS ===================== */

export const drawStatusConfig: Record<
  DrawStatus,
  { color: string; label: string; iconLabel: string }
> = {
  DRAFT: {
    color: "bg-gray-100 text-gray-700",
    label: "Draft",
    iconLabel: "📝",
  },
  LIVE: {
    color: "bg-green-100 text-green-700",
    label: "Live Now",
    iconLabel: "🔴",
  },
  CLOSED: {
    color: "bg-blue-100 text-blue-700",
    label: "Closed",
    iconLabel: "🔒",
  },
  RESULT_DECLARED: {
    color: "bg-purple-100 text-purple-700",
    label: "Results Out",
    iconLabel: "🏆",
  },
};

export const paymentStatusConfig: Record<
  PaymentStatus,
  { color: string; label: string; iconLabel: string }
> = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-700",
    label: "Pending",
    iconLabel: "⏳",
  },
  APPROVED: {
    color: "bg-green-100 text-green-700",
    label: "Approved",
    iconLabel: "✅",
  },
  REJECTED: {
    color: "bg-red-100 text-red-700",
    label: "Rejected",
    iconLabel: "❌",
  },
};

export const ticketSourceConfig: Record<
  TicketSource,
  { color: string; label: string; iconLabel: string }
> = {
  USER_PURCHASE: {
    color: "bg-blue-100 text-blue-700",
    label: "Purchased",
    iconLabel: "🎫",
  },
  ADMIN_MANUAL: {
    color: "bg-purple-100 text-purple-700",
    label: "Admin Gift",
    iconLabel: "🎁",
  },
};

export const ticketStatusConfig: Record<
  TicketStatus,
  { color: string; label: string }
> = {
  ACTIVE: {
    color: "bg-green-100 text-green-700",
    label: "Active",
  },
  CANCELLED: {
    color: "bg-gray-100 text-gray-600",
    label: "Cancelled",
  },
  REFUNDED: {
    color: "bg-yellow-100 text-yellow-700",
    label: "Refunded",
  },
};

/* ===================== FORMATTERS ===================== */

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTimeRemaining(endTime: string | Date): string {
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}