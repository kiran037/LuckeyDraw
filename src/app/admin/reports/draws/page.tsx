// src/app/admin/reports/draws/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Badge } from "@/components/ui";

interface DrawReport {
  id: number;
  title: string;
  entryFee: number;
  status: string;
  _count: {
    tickets: number;
    payments: number;
  };
}

export default function DrawReport() {
  const [rows, setRows] = useState<DrawReport[]>([]);

  useEffect(() => {
    fetch("/api/admin/reports/draws")
      .then((res) => res.json())
      .then((res) => setRows(res.data || []));
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "LIVE":
        return "success";
      case "DRAFT":
        return "warning";
      case "CLOSED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Draw Report"
        description="Overview of all draws with ticket and payment statistics"
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Title
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Entry Fee
                </th>
                <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Tickets
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Payments
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                    {r.title}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    ₹{r.entryFee}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge variant={getStatusVariant(r.status)}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">
                    {r._count.tickets}
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">
                    {r._count.payments}
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