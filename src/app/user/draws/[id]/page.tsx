'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  Clock,
  Trophy,
  CheckCircle,
  Loader2,
  AlertCircle,
  Ticket,
  ChevronLeft,
  Share2,
  Info,
  Users,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { getImageUrl } from '@/lib/image-helper';

// --- Types ---
interface DrawDetails {
  id: string;
  title: string;
  description: string;
  bannerImage: string | null;
  entryFee: number;
  startTime: string;
  endTime: string;
  maxTickets: number;
  status: string;
  rules: string | null;
  stats?: {
    sold: number;
    total: number;
    progress: number;
    left: number;
  };
  userStatus?: {
    hasJoined: boolean;
    pendingPayment: boolean;
    isGuest: boolean;
  };
  drawproduct?: Array<{
    id: string;
    name: string;
    image: string | null;
    quantity: number;
    description?: string | null;
  }>;
}

export default function DrawDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await api.get<DrawDetails>(`/user/draws/${id}`);

        if (res.success && res.data) {
          setDraw(res.data);
        } else {
          setError(res.message || 'Failed to load draw details');
        }
      } catch {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: draw?.title || 'Lucky Draw',
          text: `Check out this verified draw on Sawariya! Win amazing prizes!`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'TBA';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Loading Draw Details...
        </p>
      </div>
    );
  }

  if (error || !draw) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-200 dark:border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Draw Not Found
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {error || 'This contest might have ended or been closed.'}
        </p>
        <button
          onClick={() => router.push('/user/draws')}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          Explore Other Draws
        </button>
      </div>
    );
  }

  const soldCount = draw.stats?.sold ?? 0;
  const leftCount = draw.stats?.left ?? 0;
  const progressPercent = draw.stats?.progress ?? 0;
  const products = draw.drawproduct || [];
  const isLive = draw.status === 'LIVE';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all shadow-xs"
        >
          <Share2 size={15} />
          <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
        </button>
      </div>

      {/* Hero Banner Area */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-white/[0.08] min-h-[260px] sm:min-h-[360px] md:min-h-[400px] flex items-end shadow-md">
        {draw.bannerImage ? (
          <img
            src={getImageUrl(draw.bannerImage)}
            alt={draw.title}
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-950 flex items-center justify-center">
            <Trophy size={64} className="text-white/10" />
          </div>
        )}

        {/* Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Banner Overlay Badge & Title */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 w-full space-y-2 sm:space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs flex items-center gap-1.5 ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              {isLive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {draw.status}
            </span>

            {draw.userStatus?.hasJoined && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <CheckCircle size={13} /> Ticket Booked
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {draw.title}
          </h1>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Description, Key Stats, Prizes, Rules */}
        <div className="lg:col-span-8 space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#0F1626] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">
                Entry Fee
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(draw.entryFee)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#0F1626] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">
                Draw Closing Date
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {formatDate(draw.endTime)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#0F1626] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">
                Max Capacity
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {draw.maxTickets} Tickets
              </p>
            </div>
          </div>

          {/* Ticket Fill Progress */}
          <div className="bg-white dark:bg-[#0F1626] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Users size={16} className="text-primary" />
                <span>
                  {soldCount}{' '}
                  <span className="text-slate-400 font-normal">tickets booked</span>
                </span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {leftCount} remaining
              </span>
            </div>

            <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* About Draw */}
          {draw.description && (
            <div className="bg-white dark:bg-[#0F1626] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Contest Overview
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                {draw.description}
              </p>
            </div>
          )}

          {/* Prizes Catalog */}
          {products.length > 0 && (
            <div className="bg-white dark:bg-[#0F1626] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Prizes To Be Won
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121B2E] border border-slate-200/80 dark:border-white/[0.06]"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Quantity: {product.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules and Fair Play */}
          {draw.rules && (
            <div className="bg-white dark:bg-[#0F1626] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Info size={18} className="text-primary" />
                <h3 className="text-base font-bold">Contest Rules & Terms</h3>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {draw.rules}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Sticky Desktop Checkout Card & Fair Play Guarantee */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white dark:bg-[#0F1626] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Ticket Price
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(draw.entryFee)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 1 ticket</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Draw Closes</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(draw.endTime)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Remaining Tickets</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {leftCount}
                </span>
              </div>
            </div>

            {/* Action Button */}
            {draw.userStatus?.hasJoined ? (
              <button
                onClick={() => router.push('/user/tickets')}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <CheckCircle size={18} />
                <span>View My Ticket</span>
              </button>
            ) : draw.userStatus?.pendingPayment ? (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Clock size={18} />
                <span>Approval Pending</span>
              </button>
            ) : isLive && leftCount > 0 ? (
              <button
                onClick={() => router.push(`/user/draws/${id}/buy`)}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/25 active:scale-95 transition-all"
              >
                <Ticket size={18} />
                <span>Book Tickets Now</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 font-bold text-sm cursor-not-allowed"
              >
                {isLive ? 'Sold Out' : 'Contest Ended'}
              </button>
            )}

            {/* Fair Play Box */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Cryptographically Fair Draw</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Winners are shuffled and picked using an immutable CSPRNG Fisher-Yates algorithm. No admin tampering is possible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] p-4 pb-safe shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(draw.entryFee)}
            </p>
          </div>

          <div className="flex-1 max-w-[220px]">
            {draw.userStatus?.hasJoined ? (
              <button
                onClick={() => router.push('/user/tickets')}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <CheckCircle size={16} />
                <span>View Ticket</span>
              </button>
            ) : draw.userStatus?.pendingPayment ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Clock size={16} />
                <span>Pending</span>
              </button>
            ) : isLive && leftCount > 0 ? (
              <button
                onClick={() => router.push(`/user/draws/${id}/buy`)}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 active:scale-95 transition-all"
              >
                <Ticket size={16} />
                <span>Join Now</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 font-bold text-xs cursor-not-allowed"
              >
                Closed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
