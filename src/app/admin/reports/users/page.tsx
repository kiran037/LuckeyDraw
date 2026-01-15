// src/app/admin/reports/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Avatar } from "@/components/ui";

interface UserReport {
  id: number;
  name: string;
  mobile: string;
  _count: {
    tickets: number;
    payments: number;
  };
}

export default function UsersReport() {
  const [rows, setRows] = useState<UserReport[]>([]);

  useEffect(() => {
    fetch("/api/admin/reports/users")
      .then((res) => res.json())
      .then((res) => setRows(res.data || []));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users Report"
        description="User activity and engagement statistics"
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                  Mobile
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
              {rows.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={u.name[0]} size="sm" />
                      <span className="text-sm font-semibold text-gray-900">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                    {u.mobile}
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">
                    {u._count.tickets}
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">
                    {u._count.payments}
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
