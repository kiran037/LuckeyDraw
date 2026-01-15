'use client';

import { TrendingUp, Trophy, Ticket, Zap } from 'lucide-react';

interface QuickStatsProps {
  stats?: { // Made optional to match the safety check below
    activeDraws: number;
    totalPrizePool: number;
    happyWinners: number;
    userTickets?: number;
  };
  isLoggedIn: boolean;
}

export default function QuickStats({ stats, isLoggedIn }: QuickStatsProps) {
  // FIX: Guard clause. If stats is undefined, return null to prevent crash.
  if (!stats) {
    return null; 
  }

  const statCards = [
    {
      label: 'Active Draws',
      value: stats.activeDraws, // This was line 90 causing the crash
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      iconColor: 'text-cyan-400',
    },
    {
      label: 'Prize Pool',
      value: `₹${(stats.totalPrizePool / 1000).toFixed(0)}K`,
      icon: Trophy,
      gradient: 'from-yellow-400 to-orange-500',
      iconColor: 'text-yellow-400',
    },
    {
      label: 'Winners',
      value: stats.happyWinners,
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'text-pink-400',
    },
  ];

  if (isLoggedIn && stats.userTickets !== undefined) {
    statCards.push({
      label: 'My Tickets',
      value: stats.userTickets,
      icon: Ticket,
      gradient: 'from-green-500 to-emerald-500',
      iconColor: 'text-emerald-400',
    });
  }

  return (
    <div className={`grid ${isLoggedIn ? 'grid-cols-4 sm:grid-cols-4' : 'grid-cols-3'} gap-3`}>
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="relative bg-[#1A1F2E]/60 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/5 hover:border-white/10 transition-all group overflow-hidden"
          >
            {/* Subtle Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            
            <div className="relative z-10 flex flex-col items-center text-center sm:items-start sm:text-left gap-1.5">
              
              {/* Icon Container */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#0B0E14] border border-white/5 flex items-center justify-center shadow-lg mb-1 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={16} className={`${stat.iconColor}`} />
              </div>
              
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-none">
                    {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">
                    {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}