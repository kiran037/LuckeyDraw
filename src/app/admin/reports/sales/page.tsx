// src/app/admin/reports/sales/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Avatar } from "@/components/ui";

interface SalesReport {
  id: number;
  amount: number;
  transactionId: string;
  user: {
    name: string;
  };
  draw: {
    title: string;
  };
}

export default function SalesReport() {
  const [rows, setRows] = useState<SalesReport[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/admin/reports/sales")
      .then((res) => res.json())
      .then((res) => {
        setRows(res.data || []);
        setTotal(res.totalAmount || 0);
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Report"
        description="Approved payments and total revenue"
      />

      <Card>
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-600 mb-1">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-green-900">₹{total.toLocaleString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
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
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={r.user.name[0]} size="sm" />
                      <span className="text-sm font-semibold text-gray-900">
                        {r.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {r.draw.title}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    ₹{r.amount}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                    {r.transactionId}
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