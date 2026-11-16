'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  Clock,
  Search,
  Sparkles,
} from 'lucide-react';
import { getImageUrl } from '@/lib/image-helper';
import { motion } from 'framer-motion';

// --- Types ---
interface Draw {
  id: string;
  title: string;
  bannerImage: string | null;
  entryFee: number;
  startTime: string;
  endTime: string;
  status: 'LIVE' | 'DRAFT' | 'CLOSED' | 'RESULT_DECLARED';
  stats: {
    sold: number;
    total: number;
    percentage: number;
  };
  drawproduct: {
    name: string;
    image: string | null;
  }[];
}

interface DrawsResponseData {
  draws: Draw[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Card Component ---
const DrawCard = ({ draw }: { draw: Draw }) => {
  const timeRemaining = getTimeRemaining(draw.endTime);
  const percentage = draw.stats?.percentage ?? 0;
  const isSoldOut = percentage >= 100;
  const isLive = draw.status === 'LIVE';
  const prizeName = draw.drawproduct?.[0]?.name || 'Exclusive Grand Prize';
  const displayImage = draw.bannerImage || draw.drawproduct?.[0]?.image;

  return (
    <Link href={`/user/draws/${draw.id}`} className="block h-full group">
      <div className="relative h-full flex flex-col overflow-hidden transition-all duration-300 bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-xs hover:shadow-xl hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {displayImage ? (
            <img
              src={getImageUrl(displayImage)}
              alt={draw.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
              <Trophy className="text-slate-300 dark:text-white/20 w-14 h-14" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs flex items-center gap-1.5 ${
                draw.status === 'LIVE'
                  ? 'bg-slate-950/80 text-emerald-400 border-emerald-500/30'
                  : draw.status === 'RESULT_DECLARED'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900/80 text-slate-300 border-white/10'
              }`}
            >
              {draw.status === 'LIVE' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {draw.status === 'RESULT_DECLARED'
                ? 'Winner Declared'
                : draw.status}
            </span>
          </div>

          {/* Prize Name Pill */}
          <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-white text-[11px] font-semibold truncate shadow-xs">
            Prize: {prizeName}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-4">
            {draw.title}
          </h3>

          <div className="mt-auto space-y-4">
            {/* Info Row: Price & Time */}
            <div className="flex justify-between items-end border-t border-slate-100 dark:border-white/5 pt-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">
                  Ticket Price
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(draw.entryFee)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">
                  {isLive ? 'Closing In' : 'Status'}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                  <Clock size={12} className="text-primary" />
                  {isLive
                    ? timeRemaining
                    : new Date(draw.endTime).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar (Only for Live) */}
            {isLive && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">
                    {draw.stats?.sold || 0} / {draw.stats?.total || 0} Tickets
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSoldOut
                        ? 'bg-red-500'
                        : percentage >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-red-500'
                        : 'bg-gradient-to-r from-primary to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const DrawSkeleton = () => (
  <div className="bg-white dark:bg-[#0F1626] rounded-3xl overflow-hidden h-[390px] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
    <div className="h-48 bg-slate-100 dark:bg-white/5 animate-pulse" />
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-10 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

// --- Main Page ---
export default function DrawsPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'closed'>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<Draw[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          tab: activeTab,
          page: pagination.page.toString(),
          limit: '12',
        });

        const res = await api.get<DrawsResponseData>(`/user/draws?${query.toString()}`);

        if (res.success && res.data) {
          const payload = res.data;
          setData(Array.isArray(payload.draws) ? payload.draws : []);

          if (payload.pagination) {
            setPagination((prev) => ({
              ...prev,
              totalPages: payload.pagination.totalPages || 1,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load draws', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, [activeTab, pagination.page]);

  const handleTabChange = (tab: 'live' | 'upcoming' | 'closed') => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Local search filter for smooth instant filtering
  const filteredDraws = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.drawproduct?.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs font-bold mb-3">
            <Sparkles size={13} />
            <span>Verified Smart Draws</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Contests & Draws
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
            Choose your contest, secure your tickets, and watch the verified CSPRNG draw live.
          </p>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Animated Tabs */}
          <div className="flex p-1 bg-white dark:bg-[#0F1626] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            {(['live', 'upcoming', 'closed'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`relative px-5 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-200 z-10 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="drawsActiveTab"
                      className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search prizes or draws..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <DrawSkeleton key={i} />
          ))}
        </div>
      ) : filteredDraws.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDraws.map((draw) => (
            <DrawCard key={draw.id} draw={draw} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-3xl bg-white/40 dark:bg-white/[0.02]">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No {activeTab} draws found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-5">
            {searchQuery
              ? `No contests matching "${searchQuery}". Try a different keyword.`
              : `There are currently no ${activeTab} draws available. Please check back shortly.`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && data.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page === 1}
            aria-label="Previous page"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-xs"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            Page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of{' '}
            {pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.totalPages, prev.page + 1),
              }))
            }
            disabled={pagination.page === pagination.totalPages}
            aria-label="Next page"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-xs"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
