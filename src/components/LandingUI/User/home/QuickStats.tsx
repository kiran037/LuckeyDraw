'use client';

import { TrendingUp, Trophy, Ticket, Zap } from 'lucide-react';

// 1. Define the shape of the 'stats' object
interface StatsData {
  activeDraws: number | string;
  totalPrizePool: number; 
  happyWinners: number | string;
  userTickets?: number | string; 
}

// 2. Define the component props
interface QuickStatsProps {
  stats: StatsData | null; 
  isLoggedIn: boolean;
}

// 3. Apply the interface to the component
export default function QuickStats({ stats, isLoggedIn }: QuickStatsProps) {
  if (!stats) return null;

  const statCards = [
    { 
      label: 'Active Draws', 
      value: stats.activeDraws, 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100 dark:bg-blue-500/10' 
    },
    { 
      label: 'Prize Pool', 
      value: `₹${(stats.totalPrizePool / 1000).toFixed(0)}K`, 
      icon: Trophy, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100 dark:bg-amber-500/10' 
    },
    { 
      label: 'Winners', 
      value: stats.happyWinners, 
      icon: Zap, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100 dark:bg-purple-500/10' 
    },
  ];

  if (isLoggedIn && stats.userTickets !== undefined) {
    statCards.push({ 
      label: 'My Tickets', 
      value: stats.userTickets, 
      icon: Ticket, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100 dark:bg-emerald-500/10' 
    });
  }

  // Determine grid columns based on login status
  // Mobile: grid-cols-3 or grid-cols-4
  // Desktop (sm): Keeps original behavior
  const gridCols = isLoggedIn ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-2 sm:gap-4`}>
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="bg-white dark:bg-[#151925] border border-gray-100 dark:border-white/5 rounded-[16px] sm:rounded-[24px] p-2 sm:p-5 flex flex-col items-center sm:items-start shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform"
          >
            {/* Icon Wrapper */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-1.5 sm:mb-3`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            
            {/* Value (Number) */}
            <div className="text-sm sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {stat.value}
            </div>
            
            {/* Label (Text) */}
            <div className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide text-center sm:text-left leading-tight">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}