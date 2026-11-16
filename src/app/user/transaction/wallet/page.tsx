'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowDownLeft, ArrowUpRight, Loader2, Wallet,
  ChevronLeft, Sparkles, Calendar
} from 'lucide-react';

interface WalletTx {
  id: string;
  amount: number;
  balanceAfter: number;
  type: 'CREDIT' | 'DEBIT';
  remark: string;
  createdAt: string;
}

type FilterType = 'ALL' | 'CREDIT' | 'DEBIT';

export default function WalletTransactionPage() {
  const router = useRouter();
  const [data, setData] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<WalletTx[]>('/user/transaction/wallet');
        if (res.success && Array.isArray(res.data)) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const totalCredits = data
      .filter((tx) => tx.type === 'CREDIT')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const totalDebits = data
      .filter((tx) => tx.type === 'DEBIT')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const currentBalance = data.length > 0 ? data[0].balanceAfter : 0;
    return { totalCredits, totalDebits, currentBalance };
  }, [data]);

  const filteredData = useMemo(() => {
    if (filter === 'CREDIT') return data.filter((tx) => tx.type === 'CREDIT');
    if (filter === 'DEBIT') return data.filter((tx) => tx.type === 'DEBIT');
    return data;
  }, [data, filter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading wallet statement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="text-indigo-500" size={24} />
            Wallet Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time ledger of instant refunds, deposits, and prize earnings
          </p>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
              Active Wallet Balance
            </span>
            <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {formatCurrency(stats.currentBalance)}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
              <Sparkles size={13} className="text-indigo-400" /> Auto-usable for instant 1-click ticket booking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/70 border border-white/10 p-3.5 rounded-2xl min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Inflow</span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                <ArrowDownLeft size={14} /> +₹{stats.totalCredits}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-white/10 p-3.5 rounded-2xl min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Spent</span>
              <span className="text-sm font-black text-rose-400 flex items-center gap-1">
                <ArrowUpRight size={14} /> -₹{stats.totalDebits}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Transaction History</h2>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl">
          {(['ALL', 'CREDIT', 'DEBIT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === t
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'All' : t === 'CREDIT' ? 'Credits' : 'Debits'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Wallet size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Wallet Activity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            Any refunds, promotional bonuses, or ticket purchases using your wallet will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((tx) => {
            const isCredit = tx.type === 'CREDIT';
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {tx.remark || (isCredit ? 'Wallet Credit' : 'Ticket Purchase')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(tx.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <p
                    className={`text-base font-black tracking-tight ${
                      isCredit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{tx.amount}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Bal ₹{tx.balanceAfter}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
