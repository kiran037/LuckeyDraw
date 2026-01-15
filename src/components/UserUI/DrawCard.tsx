'use client';

import { Draw } from '@/lib/types';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import Link from 'next/link';

// FIX: Define a local type that extends Draw to include _count
type DrawWithCount = Draw & {
  _count?: {
    ticket: number;
  };
};

interface DrawCardProps {
  // Use the extended type here
  draw: DrawWithCount;
}

export default function DrawCard({ draw }: DrawCardProps) {
  const timeRemaining = getTimeRemaining(draw.endTime);
  // TypeScript now knows _count exists
  const ticketProgress = draw._count ? (draw._count.ticket / draw.maxTickets) * 100 : 0;

  return (
    <Link href={`/user/draws/${draw.id}`}>
      <div className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-40 rounded-[1.2rem] overflow-hidden bg-gray-100 mb-4">
          {draw.products && draw.products[0]?.image ? (
            <img src={draw.products[0].image} alt={draw.title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-3xl">🎁</div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-800 shadow-sm">
            {draw.status}
          </div>
        </div>

        {/* Content */}
        <div className="px-2 pb-2 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{draw.title}</h3>
          
          <div className="flex items-center justify-between mt-auto pt-3">
             <div>
               <p className="text-[10px] text-gray-400 font-medium uppercase">Price</p>
               <p className="text-sm font-bold text-purple-600">{formatCurrency(draw.entryFee)}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-gray-400 font-medium uppercase">Ends In</p>
               <p className="text-sm font-bold text-gray-800">{timeRemaining}</p>
             </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" 
                style={{ width: `${Math.min(ticketProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}