'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock, Ticket, Zap, ArrowRight, PauseCircle, PlayCircle } from 'lucide-react';
import { Draw } from '@/lib/types';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';

interface LiveDrawsSectionProps {
  // Make optional to reflect that it might be missing at runtime
  draws?: Draw[]; 
}

// FIX: Default 'draws' to an empty array so it never crashes if undefined
export default function LiveDrawsSection({ draws = [] }: LiveDrawsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-Scroll Logic
  useEffect(() => {
    // Now safe because draws is guaranteed to be an array
    if (isPaused || draws.length <= 1) return;

    const scrollInterval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const cardWidth = container.children[0]?.clientWidth || 0;
        const gap = 16; // gap-4 is 1rem (16px)
        const scrollAmount = cardWidth + gap;

        // Check if we reached the end
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          // Smooth snap back to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll next
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 Seconds

    return () => clearInterval(scrollInterval);
  }, [isPaused, draws.length]);

  if (draws.length === 0) {
    return (
      <div className="bg-[#151925]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center">
        <p className="text-gray-400 text-sm">No live draws active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_#a855f7]" />
          Live Draws
        </h2>
        <div className="flex items-center gap-2">
           {/* Pause/Play Control for Carousel */}
           <button 
             onClick={() => setIsPaused(!isPaused)}
             className="text-gray-500 hover:text-white transition-colors"
           >
             {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
           </button>
           
           <Link
            href="/user/draws?status=LIVE"
            className="text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10"
          >
            View All
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)} // Pause when user touches to swipe
      >
        {draws.map((draw) => {
          const progress = draw.maxTickets > 0 
            ? Math.min(((draw.ticketCount || 0) / draw.maxTickets) * 100, 100) 
            : 0;

          const displayImage = draw.bannerImage || draw.products?.[0]?.image;

          return (
            <div 
              key={draw.id} 
              className="snap-center shrink-0 w-[85vw] sm:w-[320px] md:w-[360px]"
            >
              <Link href={`/user/draws/${draw.id}`} className="group block relative h-full">
                {/* 
                   THE CARD 
                   Compact height achieved by putting text OVER the image 
                */}
                <div className="relative bg-[#151925] rounded-3xl overflow-hidden border border-white/5 group-hover:border-purple-500/50 transition-all duration-300 shadow-xl">
                  
                  {/* Image Background */}
                  <div className="relative w-full h-48 sm:h-56 bg-[#0B0E14]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/40 to-transparent z-10" />
                    
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={draw.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                    )}

                    {/* LIVE Badge */}
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.6)] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            LIVE
                        </div>
                    </div>
                  </div>

                  {/* Content Overlay - Floating inside the card */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-5">
                    
                    {/* Title & Stats */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white leading-tight mb-2 drop-shadow-md">
                            {draw.title}
                        </h3>
                        
                        {/* Progress Bar & Info */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-medium text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Clock size={10} className="text-purple-400" />
                                    {getTimeRemaining(draw.endTime)}
                                </span>
                                <span className="text-purple-300">{Math.round(progress)}% Sold</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_#d946ef]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Row: Price + The Special Button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Entry Fee</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(draw.entryFee)}</p>
                        </div>

                        {/* 
                           THE "GET STARTED" STYLE BUTTON 
                        */}
                        <button className="relative group/btn">
                          {/* 1. Outer Dark Ring/Glow Container */}
                          <div className="absolute inset-0 bg-[#2d1b38] rounded-full blur-[1px] transform scale-105" />
                          <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-md" />

                          {/* 2. The Bezel (Stroke) */}
                          <div className="relative bg-[#1a0b2e] p-[3px] rounded-full shadow-inner">
                             
                             {/* 3. The Inner Gradient Button */}
                             <div className="
                                relative px-5 py-2 rounded-full overflow-hidden
                                bg-gradient-to-b from-[#e879f9] to-[#9333ea]
                                border-t border-white/30
                                shadow-[0_4px_10px_rgba(147,51,234,0.4)]
                                flex items-center gap-2
                                transition-transform active:scale-95
                             ">
                                {/* Top Glare Effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-white/20 blur-[3px] rounded-b-full pointer-events-none" />
                                
                                {/* Background Dots Texture */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:4px_4px] pointer-events-none" />

                                <span className="relative z-10 text-white font-bold text-xs tracking-wide">
                                    Enter
                                </span>
                                <ArrowRight size={14} className="relative z-10 text-white" strokeWidth={3} />
                             </div>
                          </div>
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