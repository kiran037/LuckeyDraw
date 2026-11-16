'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  Loader2, CheckCircle2, XCircle, Clock, ChevronLeft,
  CreditCard, AlertCircle, Calendar, ShieldCheck
} from 'lucide-react';

interface PaymentTx {
  id: string;
  amount: number;
  status: string;
  method: string;
  gateway: string;
  drawTitle: string;
  remark?: string | null;
  createdAt: string;
}

type StatusFilter = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED';

export default function PaymentTransactionPage() {
  const router = useRouter();
  const [data, setData] = useState<PaymentTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<PaymentTx[]>('/user/transaction/payments');
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
    const totalSpent = data
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const approvedCount = data.filter((p) => p.status === 'APPROVED').length;
    const pendingCount = data.filter((p) => p.status === 'PENDING').length;
    const rejectedCount = data.filter((p) => p.status === 'REJECTED').length;
    return { totalSpent, approvedCount, pendingCount, rejectedCount };
  }, [data]);

  const filteredData = useMemo(() => {
    if (filter === 'APPROVED') return data.filter((p) => p.status === 'APPROVED');
    if (filter === 'PENDING') return data.filter((p) => p.status === 'PENDING');
    if (filter === 'REJECTED') return data.filter((p) => p.status === 'REJECTED');
    return data;
  }, [data, filter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading payment ledger...</p>
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
            <CreditCard className="text-indigo-500" size={24} />
            Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official records for UPI payments, bank receipts, and verification audit trail
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Approved</div>
          <div className="text-xl font-black text-white">{formatCurrency(stats.totalSpent)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">{stats.approvedCount} orders</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Pending Review</div>
          <div className="text-xl font-black text-amber-400">{stats.pendingCount}</div>
          <div className="text-[11px] text-slate-400">Verifying UTR</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Rejected</div>
          <div className="text-xl font-black text-rose-400">{stats.rejectedCount}</div>
          <div className="text-[11px] text-slate-400">Failed / Invalid</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Security</div>
          <div className="text-xl font-black text-indigo-400">100%</div>
          <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
            <ShieldCheck size={12} /> Encrypted
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">All Transactions</h2>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-x-auto">
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === t
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'ALL'
                ? `All (${data.length})`
                : t === 'APPROVED'
                ? `Approved (${stats.approvedCount})`
                : t === 'PENDING'
                ? `Pending (${stats.pendingCount})`
                : `Rejected (${stats.rejectedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Records */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <CreditCard size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Payments in this View</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            Join active lucky draws or make deposits to see your transaction history here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((p) => {
            const isApproved = p.status === 'APPROVED';
            const isPending = p.status === 'PENDING';
            const isRejected = p.status === 'REJECTED';

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                      {p.drawTitle || 'Lucky Draw Ticket Purchase'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(p.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-semibold tracking-wider text-[11px] text-slate-400">
                        {p.method || 'UPI'} via {p.gateway || 'MANUAL_UPI'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <p className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(p.amount)}
                    </p>
                    <div>
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock size={12} /> Under Review
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isRejected && p.remark && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Rejection Reason:</span> {p.remark}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
