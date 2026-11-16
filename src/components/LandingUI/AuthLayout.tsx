'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#090D16] p-4 sm:p-6 transition-colors duration-300">
      {/* Subtle Atmospheric Spotlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-6 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <Trophy size={20} className="text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Sawariya
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                Lucky Draw
              </span>
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
