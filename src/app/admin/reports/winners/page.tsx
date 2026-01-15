// src/app/admin/reports/winners/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Badge, Avatar } from "@/components/ui";
import { Trophy } from "lucide-react";

interface Winner {
  id: number;
  ticket: {
    ticketCode: string;
    user: {
      name: string;
    };
  };
}

interface Product {
  id: number;
  name: string;
  winners: Winner[];
}

interface DrawWithWinners {
  id: number;
  title: string;
  products: Product[];
}

export default function WinnerReport() {
  const [draws, setDraws] = useState<DrawWithWinners[]>([]);

  useEffect(() => {
    fetch("/api/admin/reports/winners")
      .then((res) => res.json())
      .then((res) => setDraws(res.data || []));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Winner Report"
        description="All declared winners and their prizes"
      />

      <div className="space-y-6">
        {draws.map((draw) => {
          const totalWinners = draw.products.reduce(
            (sum: number, p: Product) => sum + p.winners.length,
            0
          );

          if (totalWinners === 0) return null;

          return (
            <Card key={draw.id}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {draw.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total Winners: {totalWinners}
                  </p>
                </div>
                <Badge variant="success">
                  <Trophy size={14} />
                  Completed
                </Badge>
              </div>

              <div className="space-y-6">
                {draw.products.map((product: Product) =>
                  product.winners.length > 0 ? (
                    <div key={product.id}>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Trophy size={18} className="text-amber-500" />
                        {product.name}
                      </h3>
                      <div className="space-y-2">
                        {product.winners.map((w: Winner) => (
                          <div
                            key={w.id}
                            className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                fallback={w.ticket.user.name[0]}
                                size="sm"
                              />
                              <span className="text-sm font-semibold text-gray-900">
                                {w.ticket.user.name}
                              </span>
                            </div>
                            <span className="text-sm font-mono font-bold text-gray-900">
                              Ticket: {w.ticket.ticketCode}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}