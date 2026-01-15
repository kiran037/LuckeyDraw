'use client';

import { useState, useEffect } from 'react';
import { Draw } from '@/lib/types';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';

// FIX: Define a local type that extends Draw to include _count
type DrawWithCount = Draw & {
  _count?: {
    ticket: number;
  };
};

interface CarouselProps {
  // Use the extended type here
  draws: DrawWithCount[];
}

export default function Carousel({ draws }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (draws.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % draws.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [draws.length]);

  if (draws.length === 0) return null;
  const currentDraw = draws[currentIndex];
  
  // TypeScript will now recognize _count
  const progress = currentDraw._count ? (currentDraw._count.ticket / currentDraw.maxTickets) * 100 : 0;

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] shadow-xl shadow-purple-100">
      <Link href={`/user/draws/${currentDraw.id}`}>
        <div className="relative h-[220px] md:h-[300px] w-full bg-gray-900">
          
          {/* Image Background */}
          {currentDraw.products?.[0]?.image ? (
            <img
              src={currentDraw.products[0].image}
              alt={currentDraw.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex justify-between items-start mb-auto">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                Live Now
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 line-clamp-1">
              {currentDraw.title}
            </h2>
            
            <div className="flex items-center gap-3 text-white/80 text-xs mb-4">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {getTimeRemaining(currentDraw.endTime)}
              </span>
              <span>•</span>
              <span className="text-purple-300 font-semibold">
                {formatCurrency(currentDraw.entryFee)} entry
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/60">
                <span>{currentDraw._count?.ticket || 0} sold</span>
                <span>{currentDraw.maxTickets} total</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Dots Indicator */}
      {draws.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5">
          {draws.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}