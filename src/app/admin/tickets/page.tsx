// src/app/admin/tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Badge, Avatar } from "@/components/ui";
import { Trophy } from "lucide-react";

interface Ticket {
  id: number;
  ticketCode: string;
  isWinner: boolean;
  user: {
    name: string;
  };
  draw: {
    title: string;
  };
  payment?: {
    amount: number;
    transactionId: string;
  };
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("/api/admin/tickets")
      .then((res) => res.json())
      .then((res) => setTickets(res.data || []));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Tickets"
        description="View all purchased tickets across all draws"
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Ticket Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  User
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Draw
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Transaction ID
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Winner
                </th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 text-sm font-mono font-bold text-gray-900">
                    {t.ticketCode}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={t.user.name[0]} size="sm" />
                      <span className="text-sm font-semibold text-gray-900">
                        {t.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {t.draw.title}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    {t.payment?.amount ? `₹${t.payment.amount}` : "—"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                    {t.payment?.transactionId || "—"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {t.isWinner ? (
                      <Badge variant="success">
                        <Trophy size={12} />
                        Winner
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}