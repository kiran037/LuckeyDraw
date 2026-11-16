'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { CAROUSEL_IMAGES, AUTO_SLIDE_INTERVAL } from '@/lib/carousel-config';

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  return (
    <div
      className="relative w-full rounded-3xl sm:rounded-[32px] overflow-hidden group shadow-lg bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Images Carousel */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {CAROUSEL_IMAGES.map((image, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img
              src={image}
              alt={`Sawariya Raffle Banner ${index + 1}`}
              className="w-full h-full object-cover opacity-45 dark:opacity-35 scale-105 group-hover:scale-100 transition-transform duration-1000"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80`;
              }}
            />
          </div>
        ))}
      </div>

      {/* Atmospheric Radial Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl flex flex-col justify-center space-y-4 sm:space-y-6">
        {/* Live Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 text-white w-fit shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
          <span className="text-xs font-bold tracking-wide uppercase">
            Verified Fair • Live Draws Active
          </span>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Win Big. Play Fair.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
              Every Day.
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            Join India&apos;s most exciting lucky draw platform. Transparent CSPRNG winner
            draws, smartphones, luxury gadgets, and instant wallet credit.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/user/draws"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Explore Active Draws</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/user/winners"
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-semibold transition-all active:scale-95"
          >
            <Trophy size={16} className="text-amber-400" />
            <span>Winners Hall</span>
          </Link>
        </div>

        {/* Trust Points */}
        <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>100% Cryptographic Fairness</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-400" />
            <span>Instant Prize Claims</span>
          </div>
        </div>
      </div>

      {/* Manual Slide Arrows (Desktop Hover) */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-4 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden md:flex absolute right-4 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-5 right-6 z-20 flex items-center gap-1.5">
        {CAROUSEL_IMAGES.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex % 5
                ? 'w-6 bg-white shadow-xs'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
