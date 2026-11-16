'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { api } from '@/lib/api-client';
import {
  Trophy,
  Calendar,
  Ticket,
  Crown,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { getImageUrl } from '@/lib/image-helper';

interface Winner {
  id: string;
  userName: string;
  userAvatar: string | null;
  maskedMobile: string;
  prizeName: string;
  prizeImage: string | null;
  drawTitle: string;
  ticketCode: string;
  wonAt: string;
}

interface WinnerData {
  winners: Winner[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

interface PageApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default function WinnersPage() {
  const [data, setData] = useState<WinnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadWinners() {
      try {
        const res = (await api.get('/user/winners?limit=30')) as unknown as PageApiResponse<WinnerData>;

        if (isMounted) {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setError(res.message || res.error || 'Failed to load winners');
          }
        }
      } catch {
        if (isMounted) setError('An unexpected error occurred while loading winners');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadWinners();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredWinners = useMemo(() => {
    if (!data?.winners) return [];
    if (!search.trim()) return data.winners;
    const q = search.toLowerCase().trim();
    return data.winners.filter(
      (w) =>
        w.userName.toLowerCase().includes(q) ||
        w.prizeName.toLowerCase().includes(q) ||
        w.drawTitle.toLowerCase().includes(q) ||
        w.ticketCode.toLowerCase().includes(q)
    );
  }, [data?.winners, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading Winners Hall of Fame...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Could Not Load Winners</h3>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const topWinner = filteredWinners.length > 0 && !search ? filteredWinners[0] : null;
  const regularWinners = topWinner ? filteredWinners.slice(1) : filteredWinners;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Crown size={14} /> Official Hall of Fame
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Winners Podium
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mt-2 leading-relaxed">
            Celebrating our verified winners. Every ticket is cryptographically sealed and drawn fairly with publicly verifiable records.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 px-5 py-3 rounded-2xl w-fit shrink-0">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Winners</div>
            <div className="text-2xl font-black text-amber-400">{data?.pagination?.total ?? 0}</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Fairness</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <ShieldCheck size={14} /> 100% Verified
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by winner name, prize, or draw..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
      </div>

      {/* TOP WINNER SPOTLIGHT */}
      {topWinner && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 p-6 sm:p-8 shadow-2xl shadow-amber-500/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Prize Image */}
            <div className="relative w-full lg:w-80 h-64 lg:h-72 rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 shrink-0 shadow-xl">
              {topWinner.prizeImage ? (
                <Image
                  src={getImageUrl(topWinner.prizeImage)}
                  alt={topWinner.prizeName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-500/40">
                  <Trophy size={64} />
                </div>
              )}
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                <Crown size={14} fill="currentColor" /> Latest Grand Champion
              </div>
            </div>

            {/* Winner Info */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-yellow-600 shrink-0">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900">
                    <Image
                      src={getImageUrl(topWinner.userAvatar)}
                      alt={topWinner.userName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{topWinner.userName}</h3>
                  <p className="text-xs font-mono text-slate-400">{topWinner.maskedMobile}</p>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Won Grand Prize</div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{topWinner.prizeName}</h2>
                <p className="text-sm text-slate-400 mt-1">in draw: <span className="text-slate-200 font-semibold">{topWinner.drawTitle}</span></p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-amber-300 flex items-center gap-2">
                  <Ticket size={14} className="text-amber-400" />
                  <span>Ticket: {topWinner.ticketCode}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Declared {new Date(topWinner.wonAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* WINNERS GRID */}
      {regularWinners.length === 0 && !topWinner ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {search ? 'No winners match your search' : 'No Winners Declared Yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {search ? 'Try adjusting your search terms.' : 'Participate in active draws to be our very first champion!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {regularWinners.map((winner, index) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group rounded-3xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
            >
              <div>
                {/* Prize Image & Ticket Badge */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-white/5 mb-4">
                  {winner.prizeImage ? (
                    <Image
                      src={getImageUrl(winner.prizeImage)}
                      alt={winner.prizeName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Trophy size={36} />
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Ticket size={12} className="text-amber-400" />
                    <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                      {winner.ticketCode}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 relative border border-white/10 shrink-0">
                    <Image
                      src={getImageUrl(winner.userAvatar)}
                      alt={winner.userName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{winner.userName}</h4>
                    <p className="text-[11px] font-mono text-slate-400">{winner.maskedMobile}</p>
                  </div>
                </div>

                {/* Prize Info */}
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug line-clamp-1">
                    {winner.prizeName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    in {winner.drawTitle}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(winner.wonAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Sparkles size={12} /> Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
