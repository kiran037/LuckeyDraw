'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Ticket as TicketIcon, Calendar, ChevronLeft, Search,
  Trophy, ArrowRight, Loader2, RefreshCw, Copy, Check,
  Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketCode: string;
  status: string;
  isWinner: boolean;
  createdAt: string;
  draw: {
    title: string;
    status: string;
    endTime: string;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

type FilterType = 'ALL' | 'ACTIVE' | 'WINNER';

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Ticket[]>('/user/tickets');

      if (!response.success) {
        setError(typeof response.message === 'string' ? response.message : 'Failed to load tickets');
      } else {
        const validTickets = Array.isArray(response.data) ? response.data : [];
        setTickets(validTickets);
      }
    } catch {
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const copyTicketCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];

    let result = [...tickets];

    if (filter === 'WINNER') result = result.filter(t => t.isWinner);
    if (filter === 'ACTIVE') result = result.filter(t => t.status === 'ACTIVE');

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(t =>
        t.ticketCode.toLowerCase().includes(q) ||
        t.draw.title.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tickets, filter, search]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const winners = tickets.filter(t => t.isWinner).length;
    const active = tickets.filter(t => t.status === 'ACTIVE').length;
    return { total, winners, active };
  }, [tickets]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading your ticket vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Failed to Load Tickets</h3>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button
          onClick={loadTickets}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              My Ticket Vault
              {stats.winners > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Trophy size={12} /> {stats.winners} Won
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verified cryptographic entries in all official lucky draws
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 px-4 py-2 rounded-2xl w-fit">
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
            <div className="text-sm font-black text-white">{stats.total}</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Active</div>
            <div className="text-sm font-black text-emerald-400">{stats.active}</div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-amber-400">Wins</div>
            <div className="text-sm font-black text-amber-400">{stats.winners}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket code or draw title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl shrink-0">
          {(
            [
              { key: 'ALL', label: `All (${stats.total})` },
              { key: 'ACTIVE', label: `Active (${stats.active})` },
              { key: 'WINNER', label: `Wins (${stats.winners})` },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="ticketFilterTab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket Grid */}
      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            {search ? <Search size={28} /> : <TicketIcon size={28} />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {search ? 'No tickets found matching your search' : 'No Tickets in this Category'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            {search
              ? 'Try searching with another keyword or clear your filter.'
              : 'Join active lucky draws today and stand a chance to win luxury rewards!'}
          </p>
          {!search && (
            <button
              onClick={() => router.push('/user/draws')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles size={16} /> Explore Active Draws
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTickets.map((ticket) => {
              const isWinner = ticket.isWinner;
              const isCopied = copiedId === ticket.id;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                  className={`group relative rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden border ${
                    isWinner
                      ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 border-amber-500/40 shadow-xl shadow-amber-500/10'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5'
                  }`}
                >
                  {/* Perforation Left/Right Cutouts */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#090D16] border border-white/10 -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#090D16] border border-white/10 -translate-y-1/2" />

                  {/* Top Header: Monospace Ticket Code & Copy Button */}
                  <div className="flex items-center justify-between gap-3 mb-3 pl-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isWinner ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {isWinner ? <Trophy size={16} /> : <TicketIcon size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Official Ticket Code
                        </div>
                        <div className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                          {ticket.ticketCode}
                          <button
                            onClick={(e) => copyTicketCode(ticket.ticketCode, ticket.id, e)}
                            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                            title="Copy Code"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Trophy size={12} /> Winner
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          ticket.draw.status === 'LIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          {ticket.draw.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Perforation Line */}
                  <div className="relative my-4">
                    <div className="border-t border-dashed border-slate-300 dark:border-white/10" />
                  </div>

                  {/* Draw Title & Footer Details */}
                  <div className="pl-3 pr-3 space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {ticket.draw.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Booked on {formatDate(ticket.createdAt)}</span>
                      </div>

                      {ticket.payment && (
                        <div className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                          {formatCurrency(ticket.payment.amount)}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Hint */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-500" /> Cryptographically Verified
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
