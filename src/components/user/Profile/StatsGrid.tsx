'use client';

import { BentoCard } from '@/components/LandingUI/ProfilePrimitives';
import { Ticket, Trophy, TrendingUp } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatsGridProps {
  tickets: number;
  wins: number;
  winRate: string;
}

interface StatItemProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export default function StatsGrid({ tickets, wins, winRate }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatItem 
        label="Total Tickets" 
        value={tickets} 
        icon={Ticket} 
        color="text-blue-500" 
        bg="bg-blue-500/10"
      />
      <StatItem 
        label="Total Wins" 
        value={wins} 
        icon={Trophy} 
        color="text-amber-500" 
        bg="bg-amber-500/10"
      />
      <StatItem 
        label="Win Rate" 
        value={`${winRate}%`} 
        icon={TrendingUp} 
        color="text-emerald-500" 
        bg="bg-emerald-500/10"
      />
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color, bg }: StatItemProps) {
  return (
    <BentoCard className="flex flex-col items-center justify-center text-center py-5 sm:py-6 gap-2">
      <div className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center mb-1`}>
        <Icon size={18} />
      </div>
      <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
        {value}
      </span>
      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
    </BentoCard>
  );
}