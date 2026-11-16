'use client';

import { TrendingUp, Trophy, Ticket, Users, Sparkles } from 'lucide-react';

interface StatsData {
  activeDraws: number | string;
  totalPrizePool: number;
  happyWinners: number | string;
  userTickets?: number | string;
}

interface QuickStatsProps {
  stats: StatsData | null;
  isLoggedIn: boolean;
}

export default function QuickStats({ stats, isLoggedIn }: QuickStatsProps) {
  if (!stats) return null;

  const statCards = [
    {
      label: 'Active Contests',
      value: stats.activeDraws,
      hint: 'Ready to enter',
      icon: TrendingUp,
      accent: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Total Prize Pool',
      value: `₹${(stats.totalPrizePool || 0).toLocaleString('en-IN')}`,
      hint: 'Cash & gadgets',
      icon: Trophy,
      accent: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-500/20',
    },
    {
      label: 'Verified Winners',
      value: stats.happyWinners,
      hint: 'Paid instantly',
      icon: Users,
      accent: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      border: 'border-purple-500/20',
    },
  ];

  if (isLoggedIn && stats.userTickets !== undefined) {
    statCards.push({
      label: 'My Active Tickets',
      value: stats.userTickets,
      hint: 'In live draws',
      icon: Ticket,
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      border: 'border-emerald-500/20',
    });
  } else {
    statCards.push({
      label: 'Fairness Guarantee',
      value: '100%',
      hint: 'CSPRNG Randomness',
      icon: Sparkles,
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      border: 'border-emerald-500/20',
    });
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="group relative bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.accent} ${stat.border} border flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {stat.hint}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
