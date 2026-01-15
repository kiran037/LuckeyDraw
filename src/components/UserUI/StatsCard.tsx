'use client';

interface StatsCardProps {
  icon: string | React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  gradient?: string; // Kept for prop compatibility
}

export default function StatsCard({
  icon,
  value,
  label,
  trend,
  trendUp,
}: StatsCardProps) {
  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
            trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-xs font-medium text-gray-400">{label}</div>
      </div>
      
      {/* Decor */}
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gray-50 rounded-full z-0" />
    </div>
  );
}