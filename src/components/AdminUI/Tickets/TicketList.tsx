"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, Ticket as TicketIcon, Award } from "lucide-react";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { Button } from "../ui/Button";

interface TicketMeta {
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
  avatar: string | null;
}

interface Draw {
  id: string;
  title: string;
  status: string;
  endTime: string;
}

interface Payment {
  id: string;
  status: string;
  method: string;
  amount: number;
}

interface TicketItem {
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
}

interface TicketListProps {
  tickets: TicketItem[];
  meta: TicketMeta;
}

export default function TicketList({ tickets }: TicketListProps) {
  const [filter, setFilter] = useState<string>("all");

  const getStatusColor = (status: string): "default" | "success" | "danger" | "neutral" => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getSourceBadge = (source: string) => {
    return source === "ADMIN_MANUAL" ? (
      <Badge variant="neutral" size="sm">Manual</Badge>
    ) : (
      <Badge variant="default" size="sm">Purchase</Badge>
    );
  };

  const filteredTickets = filter === "all" 
    ? tickets 
    : filter === "winners"
    ? tickets.filter(t => t.isWinner)
    : tickets.filter(t => t.status === filter.toUpperCase());

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <TicketIcon className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No tickets found</h3>
        <p className="text-xs text-zinc-500 mt-1">Tickets will appear here once users purchase or admins create them.</p>
      </div>
    );
  }

  const winnersCount = tickets.filter(t => t.isWinner).length;
  const activeCount = tickets.filter(t => t.status === "ACTIVE").length;
  const cancelledCount = tickets.filter(t => t.status === "CANCELLED" || t.status === "REFUNDED").length;

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            filter === "all"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          All ({tickets.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            filter === "active"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter("winners")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            filter === "winners"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Winners ({winnersCount})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            filter === "cancelled"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Ticket Cards */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Ticket</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Draw</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {ticket.ticketCode}
                      </div>
                      {ticket.isWinner && (
                        <Award className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{ticket.user.name}</p>
                      <p className="text-xs text-zinc-500">{ticket.user.mobile}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{ticket.draw.title}</p>
                      <p className="text-xs text-zinc-500">
                        {format(new Date(ticket.draw.endTime), "MMM d, yyyy")}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">₹{ticket.pricePaid}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {getSourceBadge(ticket.source)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={getStatusColor(ticket.status)} size="sm" className="capitalize">
                      {ticket.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(ticket.createdAt), "h:mm a")}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/tickets/${ticket.id}`}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-opacity"
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

      {filteredTickets.length === 0 && (
        <div className="text-center py-12 text-sm text-zinc-500">
          No {filter !== "all" ? filter : ""} tickets found
        </div>
      )}
    </div>
  );
}