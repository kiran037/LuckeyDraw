'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Draw } from '@/lib/types';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import { SectionHeader } from '@/components/LandingUI/HomePrimitives';
import { getImageUrl } from "@/lib/image-helper";

interface LiveDrawsSectionProps {
  draws?: Draw[]; 
}

export default function LiveDrawsSection({ draws = [] }: LiveDrawsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-Scroll Logic (Restored & Set to 2 Seconds)
  useEffect(() => {
    // Don't scroll if paused or not enough items
    if (isPaused || draws.length <= 1) return;

    const scrollInterval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        // Get width of the first card + gap (approx)
        const firstCard = container.children[0] as HTMLElement;
        const cardWidth = firstCard?.offsetWidth || 0;
        const gap = 20; // Matches the gap-5 class
        const scrollAmount = cardWidth + gap;

        // Check if we are near the end of the list
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          // Reset to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll to next card
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 2000); // 2 Seconds interval

    return () => clearInterval(scrollInterval);
  }, [isPaused, draws.length]);

  if (draws.length === 0) {
    return (
      <div className="bg-white dark:bg-[#151925] border border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center">
        <p className="text-gray-400 text-sm font-medium">No live draws active at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CSS to ensure scrollbar is strictly hidden across all browsers */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <SectionHeader 
          title="Live Draws" 
          subtitle="Happening right now" 
        />
        
        <div className="mb-6">
           <Link
            href="/user/draws?status=LIVE"
            className="group flex items-center gap-1 text-xs font-bold bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white"
          >
            View All
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar touch-pan-x"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)} // Resume after touch
      >
        {draws.map((draw) => {
          const progress = draw.maxTickets > 0 
            ? Math.min(((draw.ticketCount || 0) / draw.maxTickets) * 100, 100) 
            : 0;

          const displayImage = draw.bannerImage || draw.products?.[0]?.image;

          return (
            <div 
              key={draw.id} 
              // RESPONSIVE SIZING: Smaller on mobile (240px), Larger on desktop (320px)
              className="snap-center shrink-0 w-[240px] xs:w-[260px] sm:w-[320px]"
            >
              <Link href={`/user/draws/${draw.id}`} className="group block h-full">
                <div className="bg-white dark:bg-[#151925] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  
                  {/* Image Area - Reduced height on mobile */}
                  <div className="relative h-36 sm:h-52 bg-gray-100 dark:bg-[#0B0E14] overflow-hidden">
                    {displayImage ? (
                      <img
                        src={getImageUrl(displayImage)}
                        alt={draw.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                    )}

                    {/* LIVE Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-white tracking-wide">LIVE</span>
                    </div>
                  </div>

                  {/* Content Area - Compact padding on mobile */}
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    
                    {/* Title - Smaller font on mobile */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-3 sm:mb-4 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {draw.title}
                    </h3>
                    
                    {/* Progress Bar */}
                    <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between text-[10px] sm:text-[11px] font-bold">
                            <span className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-gray-400">
                                <Clock size={10} className="sm:w-3 sm:h-3 text-purple-500" />
                                {getTimeRemaining(draw.endTime)}
                            </span>
                            <span className="text-gray-900 dark:text-white">{Math.round(progress)}% Sold</span>
                        </div>
                        <div className="h-1.5 sm:h-2.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Footer: Price + Action Button */}
                    <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-50 dark:border-white/5">
                        <div>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Entry</p>
                            <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{formatCurrency(draw.entryFee)}</p>
                        </div>

                        {/* Smaller button on mobile */}
                        <button className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-black/5 dark:shadow-white/10">
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                  </div>

                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}