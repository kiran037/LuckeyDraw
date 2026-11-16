'use client';

import { Loader2, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// --- WRAPPER FOR SECTIONS ---
export function BentoSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white dark:bg-[#0F1626] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm p-6 sm:p-8 transition-all ${className}`}
    >
      {children}
    </section>
  );
}

// --- SECTION HEADER ---
export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 px-1">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="group flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <span>{actionLabel}</span>
          <ChevronRight
            size={14}
            className="text-primary group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      )}
    </div>
  );
}

// --- LOADERS & ERRORS ---
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1626] shadow-xl border border-slate-200/80 dark:border-white/[0.08]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Loading Sawariya...
      </p>
    </div>
  );
}

export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-200 dark:border-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
}
