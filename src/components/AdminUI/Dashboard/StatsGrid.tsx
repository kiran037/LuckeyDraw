"use client";

import { 
  Users, CreditCard, Ticket, Trophy, ArrowUpRight, AlertCircle 
} from "lucide-react";
import { Card } from "@/components/AdminUI/ui/Card";

interface StatsData {
  revenue: { total: number; today: number };
  users: { total: number; newToday: number };
  tickets: { total: number; soldToday: number };
  draws: { active: number };
  actionItems: { pendingPayments: number };
}

export function StatsGrid({ data }: { data: StatsData | null }) {
  if (!data) return <StatsSkeleton />;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Revenue */}
      <Card className="relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Revenue</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
              {formatCurrency(data.revenue.total)}
            </h3>
            <div className="flex items-center mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-full">
              <ArrowUpRight size={12} className="mr-1" />
              {formatCurrency(data.revenue.today)} today
            </div>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white group-hover:scale-110 transition-transform">
            <CreditCard size={20} />
          </div>
        </div>
      </Card>

      {/* Users */}
      <Card className="relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Users</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
              {data.users.total.toLocaleString()}
            </h3>
            <p className="mt-2 text-xs text-zinc-500">
              <span className="text-emerald-600 font-medium">+{data.users.newToday}</span> new today
            </p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
        </div>
      </Card>

      {/* Tickets */}
      <Card className="relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tickets Sold</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
              {data.tickets.total.toLocaleString()}
            </h3>
            <p className="mt-2 text-xs text-zinc-500">
              <span className="text-blue-600 font-medium">{data.tickets.soldToday}</span> sold today
            </p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white group-hover:scale-110 transition-transform">
            <Ticket size={20} />
          </div>
        </div>
      </Card>

      {/* Pending Action (Alert) */}
      <Card className={`relative overflow-hidden group border-l-4 ${data.actionItems.pendingPayments > 0 ? 'border-l-rose-500' : 'border-l-zinc-200'}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Pending Actions</p>
            <div className="flex items-center gap-2 mt-2">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {data.actionItems.pendingPayments}
                </h3>
                {data.actionItems.pendingPayments > 0 && (
                    <span className="animate-pulse w-2 h-2 rounded-full bg-rose-500"></span>
                )}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
               Pending Payments
            </p>
          </div>
          <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${data.actionItems.pendingPayments > 0 ? 'bg-rose-50 text-rose-600' : 'bg-zinc-100 text-zinc-900'}`}>
            <AlertCircle size={20} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}