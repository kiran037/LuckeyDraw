"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, Award, Ban, Loader2, User, Ticket as TicketIcon } from "lucide-react";
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
  status: string;
  bannerImage: string | null;
}

interface Payment {
  id: string;
  status: string;
  method: string;
  amount: number;
  transactionId: string | null;
}

interface Winner {
  id: string;
  productId: string;
  declaredAt: string;
}

interface TicketData {
  id: string;
  ticketCode: string;
  userId: string;
  drawId: string;
  paymentId: string | null;
  pricePaid: number;
  status: string;
  source: string;
  isWinner: boolean;
  coverImage: string | null;
  createdByAdminId: string | null;
  createdAt: string;
  user: User;
  draw: Draw;
  payment: Payment | null;
  winner: Winner | null;
}

export default function TicketDetail({ ticket }: { ticket: TicketData }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const canCancel = ticket.status === "ACTIVE" && !ticket.isWinner;

  const handleUpdateStatus = async (newStatus: "CANCELLED" | "REFUNDED") => {
    if (!canCancel) {
      setError("Cannot modify this ticket");
      return;
    }

    if (!confirm(`Are you sure you want to mark this ticket as ${newStatus}?`)) {
      return;
    }

    setError("");
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update ticket");
      }

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
      case 'ACTIVE': return 'success';
      case 'CANCELLED':
      case 'REFUNDED': return 'danger';
      default: return 'neutral';
    }
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
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Ticket Details</h1>
            <p className="text-xs text-zinc-500 font-mono">{ticket.ticketCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(ticket.status)} className="capitalize">
            {ticket.status.toLowerCase()}
          </Badge>
          {ticket.isWinner && (
            <Badge variant="default" className="bg-amber-500 text-white">
              <Award className="w-3 h-3 mr-1" />
              Winner
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information */}
          <Card title="Ticket Information">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Ticket Code</label>
                  <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded mt-1">
                    {ticket.ticketCode}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Price Paid</label>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">₹{ticket.pricePaid}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Source</label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {ticket.source === "ADMIN_MANUAL" ? "Manual (Admin)" : "User Purchase"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Created</label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {format(new Date(ticket.createdAt), "PPp")}
                  </p>
                </div>
              </div>

              {ticket.isWinner && ticket.winner && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Winner!</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Declared on {format(new Date(ticket.winner.declaredAt), "PPp")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Information */}
          {ticket.payment && (
            <Card title="Payment Details">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Amount</label>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">₹{ticket.payment.amount}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Method</label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 capitalize">
                      {ticket.payment.method.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {ticket.payment.transactionId && (
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Transaction ID</label>
                    <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">
                      {ticket.payment.transactionId}
                    </p>
                  </div>
                )}

                <Badge variant={getStatusColor(ticket.payment.status)} size="sm" className="capitalize">
                  Payment {ticket.payment.status.toLowerCase()}
                </Badge>
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
                  {ticket.user.avatar ? (
                    <img src={getImageUrl(ticket.user.avatar)} alt={ticket.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{ticket.user.name}</p>
                  <p className="text-xs text-zinc-500">{ticket.user.mobile}</p>
                </div>
              </div>
              {ticket.user.email && (
                <div>
                  <label className="text-xs font-medium text-zinc-500">Email</label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{ticket.user.email}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Draw Info */}
          <Card title="Draw Details">
            <div className="space-y-3">
              {ticket.draw.bannerImage && (
                <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img 
                    src={getImageUrl(ticket.draw.bannerImage)} 
                    alt={ticket.draw.title}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{ticket.draw.title}</p>
                <Badge variant="neutral" size="sm" className="mt-2 capitalize">
                  {ticket.draw.status.toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card title="Actions">
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  Modify the status of this ticket. This action cannot be undone.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleUpdateStatus("CANCELLED")}
                    disabled={processing}
                    variant="secondary"
                    className="w-full justify-center"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Cancel Ticket
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus("REFUNDED")}
                    disabled={processing}
                    variant="secondary"
                    className="w-full justify-center"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <TicketIcon className="w-4 h-4 mr-2" />
                        Mark as Refunded
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!canCancel && ticket.isWinner && (
            <Card title="Notice">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This ticket is a winner and cannot be cancelled or refunded. Remove winner status first if needed.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}