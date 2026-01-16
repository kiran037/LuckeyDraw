"use client";

import { Card } from "@/components/AdminUI/ui/Card";
import { Avatar } from "@/components/AdminUI/ui/Avatar"; 
import { formatDistanceToNow } from "date-fns";

interface ActivityData {
  users: Array<{ id: string; name: string; email: string; avatar: string | null; createdAt: string }>;
  transactions: Array<{ 
    id: string; 
    amount: number; 
    status: string; 
    createdAt: string; 
    user: { name: string };
    draw: { title: string };
  }>;
}

// FIXED: Added '| null' to the data prop type
export function RecentActivity({ data }: { data: ActivityData | null | undefined }) {
  if (!data) return <ActivitySkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Users */}
      <Card title="Recent Registrations" noPadding>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.users.map((user) => (
            <div key={user.id} className="flex items-center p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              {/* FIXED: Using the new Avatar component */}
              <Avatar 
                src={user.avatar} 
                alt={user.name} 
                fallback={user.name} 
              />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <div className="text-[10px] text-zinc-400">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
          {data.users.length === 0 && <p className="p-4 text-sm text-zinc-500 text-center">No recent users.</p>}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" noPadding>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex flex-col">
                 <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                   {tx.user.name}
                 </p>
                 <p className="text-[11px] text-zinc-500">
                   {tx.draw?.title || "Wallet Top-up"}
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-bold text-zinc-900 dark:text-white">
                   ₹{tx.amount}
                 </p>
                 <span className="text-[10px] text-zinc-400">
                    {formatDistanceToNow(new Date(tx.createdAt))} ago
                 </span>
              </div>
            </div>
          ))}
          {data.transactions.length === 0 && <p className="p-4 text-sm text-zinc-500 text-center">No recent transactions.</p>}
        </div>
      </Card>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-80 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
      <div className="h-80 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
    </div>
  );
}