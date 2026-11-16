export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import { ChevronLeft, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/AdminUI/ui/Button";
import { Card } from "@/components/AdminUI/ui/Card";
import { format } from "date-fns";

async function getSalesReport() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/reports/sales?limit=50`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) return { 
      summary: { totalRevenue: 0, totalTransactions: 0 },
      data: [], 
      meta: { page: 1, limit: 50, totalPages: 0 } 
    };
    
    return await res.json();
  } catch {
    return { 
      summary: { totalRevenue: 0, totalTransactions: 0 },
      data: [], 
      meta: { page: 1, limit: 50, totalPages: 0 } 
    };
  }
}

export default async function SalesReportPage() {
  const report = await getSalesReport();

  const avgTransaction = report.summary.totalTransactions > 0 
    ? report.summary.totalRevenue / report.summary.totalTransactions 
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Sales Report</h1>
            </div>
            <p className="text-sm text-zinc-500">Revenue and transaction analysis</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Total Revenue</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ₹{report.summary.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500">From approved payments</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Total Transactions</p>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {report.summary.totalTransactions.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500">Successful payments</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Avg Transaction</p>
              <DollarSign className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ₹{avgTransaction.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">Per payment</p>
          </div>
        </Card>
      </div>

      {/* Transaction List */}
      {report.data.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-500">No transaction data available</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Draw</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {report.data.map((payment: {
                  id: string;
                  amount: number;
                  method: string;
                  gateway: string;
                  transactionId: string | null;
                  createdAt: string;
                  user: { id: string; name: string; email: string | null };
                  draw: { id: string; title: string };
                }) => (
                  <tr key={payment.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm">
                        <p className="text-zinc-900 dark:text-zinc-100">
                          {format(new Date(payment.createdAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {format(new Date(payment.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{payment.user.name}</p>
                        {payment.user.email && (
                          <p className="text-xs text-zinc-500">{payment.user.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{payment.draw.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm">
                        <p className="text-zinc-900 dark:text-zinc-100">{payment.method}</p>
                        <p className="text-xs text-zinc-500 capitalize">{payment.gateway.toLowerCase()}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        {payment.transactionId || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}