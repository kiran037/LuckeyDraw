'use client';

import { Loader2, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// --- WRAPPER FOR SECTIONS ---
export function BentoSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <section className={`bg-white dark:bg-[#151925] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-6 sm:p-8 ${className}`}>
      {children}
    </section>
  );
}

// --- SECTION HEADER ---
export function SectionHeader({ title, subtitle, actionLabel, actionHref }: { title: string, subtitle?: string, actionLabel?: string, actionHref?: string }) {
  return (
    <div className="flex items-end justify-between mb-6 px-1">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link 
          href={actionHref} 
          className="group flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          {actionLabel}
          <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// --- LOADERS & ERRORS ---
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#151925] shadow-xl border border-gray-100 dark:border-white/5">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Experience...</p>
    </div>
  );
}

export function PageError({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:scale-105 transition-transform"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}