import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DrawStatus, PaymentStatus, TicketStatus } from "./types";

/* ===================== TAILWIND MERGE ===================== */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ===================== DARK MODE COMPATIBLE COLORS ===================== */

export const drawStatusConfig: Record<
  DrawStatus,
  { color: string; label: string; iconLabel: string }
> = {
  DRAFT: {
    color: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
    label: "Draft",
    iconLabel: "📝",
  },
  LIVE: {
    color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30",
    label: "Live Now",
    iconLabel: "🔴",
  },
  CLOSED: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    label: "Closed",
    iconLabel: "🔒",
  },
  RESULT_DECLARED: {
    color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    label: "Results Out",
    iconLabel: "🏆",
  },
};

export const paymentStatusConfig: Record<
  PaymentStatus,
  { color: string; label: string }
> = {
  PENDING: {
    color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    label: "Pending",
  },
  APPROVED: {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Success",
  },
  REJECTED: {
    color: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    label: "Failed",
  },
};

export const ticketStatusConfig: Record<
  TicketStatus,
  { color: string; label: string }
> = {
  ACTIVE: {
    color: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    label: "Active",
  },
  CANCELLED: {
    color: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
    label: "Cancelled",
  },
  REFUNDED: {
    color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    label: "Refunded",
  },
};

/* ===================== FORMATTERS ===================== */

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  if (!date) return "";
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
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}