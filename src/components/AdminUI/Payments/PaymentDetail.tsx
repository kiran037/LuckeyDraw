"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, CheckCircle, XCircle, Loader2, User, Calendar } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import { Card } from "@/components/AdminUI/ui/Card";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { getImageUrl } from "@/lib/image-helper";

interface User {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  avatar: string | null;
}

interface Draw {
  id: string;
  title: string;
  bannerImage: string | null;
  entryFee: number;
}

interface PaymentData {
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

export default function PaymentDetail({ payment }: { payment: PaymentData }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  const isPending = payment.status === "PENDING";
  const ticketCount = payment.draw.entryFee > 0 
    ? Math.floor(payment.amount / payment.draw.entryFee) 
    : 0;

  const handleAction = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!isPending) return;

    if (newStatus === "REJECTED" && !remark.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setError("");
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          remark: remark.trim()
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to process payment");
      }

      router.push("/admin/payments");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string): "default" | "success" | "danger" | "neutral" => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PENDING': return 'neutral';
      default: return 'default';
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      UPI: 'UPI',
      CARD: 'Card',
      NET_BANKING: 'Net Banking',
      WALLET: 'Wallet',
      CASH: 'Cash'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-10 py-4 border-b border-zinc-200 dark:border-zinc-800 -mx-6 px-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Payment Review</h1>
            <p className="text-xs text-zinc-500">ID: {payment.id}</p>
          </div>
        </div>
        <Badge variant={getStatusColor(payment.status)} className="capitalize">
          {payment.status.toLowerCase()}
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Details */}
          <Card title="Payment Information">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Amount</label>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">₹{payment.amount}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Tickets</label>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{ticketCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Method</label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">{getMethodLabel(payment.method)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Gateway</label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 capitalize">{payment.gateway.toLowerCase()}</p>
                </div>
              </div>

              {payment.transactionId && (
                <div>
                  <label className="text-xs font-medium text-zinc-500">Transaction ID</label>
                  <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">{payment.transactionId}</p>
                </div>
              )}

              {payment.gatewayOrderId && (
                <div>
                  <label className="text-xs font-medium text-zinc-500">Gateway Order ID</label>
                  <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">{payment.gatewayOrderId}</p>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {format(new Date(payment.createdAt), "PPp")}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Screenshot */}
          {payment.screenshot && (
            <Card title="Payment Screenshot">
              <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img 
                  src={getImageUrl(payment.screenshot)} 
                  alt="Payment proof"
                  className="w-full h-auto"
                />
              </div>
            </Card>
          )}

          {/* Rejection Reason */}
          {payment.status === "REJECTED" && payment.failureReason && (
            <Card title="Rejection Reason">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{payment.failureReason}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* User Info */}
          <Card title="User Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                  {payment.user.avatar ? (
                    <img src={getImageUrl(payment.user.avatar)} alt={payment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{payment.user.name}</p>
                  <p className="text-xs text-zinc-500">{payment.user.mobile}</p>
                </div>
              </div>
              {payment.user.email && (
                <div>
                  <label className="text-xs font-medium text-zinc-500">Email</label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{payment.user.email}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Draw Info */}
          <Card title="Draw Details">
            <div className="space-y-3">
              {payment.draw.bannerImage && (
                <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img 
                    src={getImageUrl(payment.draw.bannerImage)} 
                    alt={payment.draw.title}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{payment.draw.title}</p>
                <p className="text-xs text-zinc-500 mt-1">Entry Fee: ₹{payment.draw.entryFee}</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {isPending && (
            <Card title="Review Payment">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Remark {!remark.trim() && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    className="w-full min-h-[80px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100"
                    placeholder="Add a note or rejection reason..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction("APPROVED")}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleAction("REJECTED")}
                    disabled={processing}
                    variant="secondary"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-zinc-500 text-center">
                  Approving will generate {ticketCount} ticket{ticketCount !== 1 ? 's' : ''} for this user
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}