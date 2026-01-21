"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { Button } from "../ui/Button";

interface PaymentMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface User {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
}

interface Draw {
  id: string;
  title: string;
  entryFee: number;
}

interface PaymentItem {
  id: string;
  userId: string;
  drawId: string;
  amount: number;
  transactionId: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  method: string;
  gateway: string;
  screenshot: string | null;
  failureReason: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  draw: Draw;
}

interface PaymentListProps {
  payments: PaymentItem[];
  meta: PaymentMeta;
}

export default function PaymentList({ payments }: PaymentListProps) {
  const [filter, setFilter] = useState<string>("all");

  const getStatusColor = (status: string): "default" | "success" | "danger" | "neutral" => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'PENDING':
        return 'neutral';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'UPI': return 'UPI';
      case 'CARD': return 'Card';
      case 'NET_BANKING': return 'Net Banking';
      case 'WALLET': return 'Wallet';
      case 'CASH': return 'Cash';
      default: return method;
    }
  };

  const filteredPayments = filter === "all" 
    ? payments 
    : payments.filter(p => p.status === filter.toUpperCase());

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <CreditCard className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No payments found</h3>
        <p className="text-xs text-zinc-500 mt-1">Payments will appear here once users make purchases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filter === "all"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          All ({payments.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filter === "pending"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Pending ({payments.filter(p => p.status === "PENDING").length})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filter === "approved"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Approved ({payments.filter(p => p.status === "APPROVED").length})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filter === "rejected"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Rejected ({payments.filter(p => p.status === "REJECTED").length})
        </button>
      </div>

      {/* Payment Cards */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Draw</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{payment.user.name}</p>
                      <p className="text-xs text-zinc-500">{payment.user.mobile}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{payment.draw.title}</p>
                      <p className="text-xs text-zinc-500">Entry: ₹{payment.draw.entryFee}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">₹{payment.amount}</p>
                      {payment.draw.entryFee > 0 && (
                        <p className="text-xs text-zinc-500">
                          ~{Math.floor(payment.amount / payment.draw.entryFee)} tickets
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {getPaymentMethodLabel(payment.method)}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {payment.gateway.toLowerCase()}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge 
                      variant={getStatusColor(payment.status)} 
                      size="sm" 
                      className="capitalize inline-flex items-center gap-1"
                    >
                      {getStatusIcon(payment.status)}
                      {payment.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {format(new Date(payment.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(payment.createdAt), "h:mm a")}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/payments/${payment.id}`}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-900 dark:text-zinc-100 transition-opacity"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12 text-sm text-zinc-500">
          No {filter !== "all" ? filter : ""} payments found
        </div>
      )}
    </div>
  );
}