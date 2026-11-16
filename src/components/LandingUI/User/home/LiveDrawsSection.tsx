'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Draw } from '@/lib/types';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import { SectionHeader } from '@/components/LandingUI/HomePrimitives';
import { getImageUrl } from '@/lib/image-helper';

interface LiveDrawsSectionProps {
  draws?: Draw[];
}

export default function LiveDrawsSection({ draws = [] }: LiveDrawsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || draws.length <= 1) return;

    const scrollInterval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const firstCard = container.children[0] as HTMLElement;
        const cardWidth = firstCard?.offsetWidth || 0;
        const gap = 20;
        const scrollAmount = cardWidth + gap;

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(scrollInterval);
  }, [isPaused, draws.length]);

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (draws.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-3">
          <Sparkles size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Live Draws Right Now
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Our next high-reward lucky draws are being scheduled. Check back shortly or browse completed results!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with carousel controls */}
      <div className="flex items-end justify-between px-1">
        <SectionHeader
          title="Featured Live Draws"
          subtitle="Real prizes • Cryptographically verified winners"
        />

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={scrollPrev}
            aria-label="Previous draws"
            className="hidden sm:flex w-9 h-9 rounded-full bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next draws"
            className="hidden sm:flex w-9 h-9 rounded-full bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
          >
            <ChevronRight size={16} />
          </button>

          <Link
            href="/user/draws?tab=live"
            className="flex items-center gap-1 text-xs font-bold bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] px-4 py-2 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-900 dark:text-white shadow-xs"
          >
            <span>View All</span>
            <ChevronRight size={12} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar touch-pan-x"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
      >
        {draws.map((draw) => {
          const progress =
            draw.maxTickets > 0
              ? Math.min(((draw.ticketCount || 0) / draw.maxTickets) * 100, 100)
              : 0;

          const displayImage = draw.bannerImage || draw.products?.[0]?.image;
          const topProduct = draw.products?.[0]?.name;

          return (
            <div
              key={draw.id}
              className="snap-start shrink-0 w-[270px] xs:w-[290px] sm:w-[330px]"
            >
              <Link href={`/user/draws/${draw.id}`} className="group block h-full">
                <div className="bg-white dark:bg-[#0F1626] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  {/* Image Area */}
                  <div className="relative h-44 sm:h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {displayImage ? (
                      <img
                        src={getImageUrl(displayImage)}
                        alt={draw.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎁
                      </div>
                    )}

                    {/* LIVE Status Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-black text-white tracking-wider uppercase">
                        LIVE
                      </span>
                    </div>

                    {/* Featured Prize Badge if Available */}
                    {topProduct && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-white text-[11px] font-semibold truncate shadow-xs">
                        Grand Prize: {topProduct}
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                      {draw.title}
                    </h3>

                    {/* Progress Bar & Countdown */}
                    <div className="mb-4 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock size={12} className="text-primary" />
                          {getTimeRemaining(draw.endTime)}
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {Math.round(progress)}% Sold
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 85
                              ? 'bg-gradient-to-r from-amber-500 to-red-500'
                              : 'bg-gradient-to-r from-primary to-indigo-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Price + Button */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Entry Ticket
                        </p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {formatCurrency(draw.entryFee)}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center transition-all group-hover:scale-105 shadow-md shadow-primary/20">
                        <ArrowRight size={16} />
                      </div>
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
