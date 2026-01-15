'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode | string;
  title: string;
  description: string;
  gradient?: string; // Kept for API compatibility, but using mapped colors is better
  badge?: string;
}

export default function QuickActionCard({
  href,
  icon,
  title,
  description,
  badge,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block h-full">
      <div className="relative bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-50 h-full hover:shadow-md transition-shadow group">
        
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-2xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          {badge && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
              {badge}
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{description}</p>
        
        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
          <ArrowUpRight size={16} />
        </div>
      </div>
    </Link>
  );
}