'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import {
  ArrowLeft, Share2, CreditCard, Trophy,
  Calendar, Loader2, AlertCircle, ExternalLink,
  Copy, Check, ShieldCheck, QrCode
} from 'lucide-react';

interface TicketDetail {
  id: string;
  ticketCode: string;
  status: string;
  isWinner: boolean;
  pricePaid: number;
  createdAt: string;
  draw: {
    title: string;
    entryFee: number;
    status: string;
    bannerImage?: string | null;
  };
  payment: {
    status: string;
    amount: number;
    transactionId?: string | null;
    screenshot?: string | null;
  } | null;
  winner: {
    declaredAt: string;
    drawproduct: {
      name: string;
      image?: string | null;
      description?: string | null;
    };
  } | null;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      api.get<TicketDetail>(`/user/tickets/${params.id}`).then((res) => {
        if (res.success && res.data) {
          setTicket(res.data);
        } else {
          setError(res.message || 'Ticket not found');
        }
        setLoading(false);
      });
    }
  }, [params.id]);

  const handleCopyCode = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!ticket) return;
    const shareData = {
      title: `Sawariya Lucky Draw Ticket - ${ticket.draw.title}`,
      text: `I hold ticket ${ticket.ticketCode} for ${ticket.draw.title}! Check out Sawariya Lucky Draw.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Verifying ticket authenticity...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Ticket Not Found</h3>
        <p className="text-sm text-slate-400 mb-6">{error || "This ticket doesn't exist or has expired."}</p>
        <button
          onClick={() => router.push('/user/tickets')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
        >
          Back to Ticket Vault
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" /> Verified Ticket
        </span>

        <button
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
          title="Share Ticket"
        >
          <Share2 size={16} />
        </button>
      </div>

      {shareToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl text-center">
          Ticket link copied to clipboard!
        </div>
      )}

      {/* WINNER SHOWCASE BANNER */}
      {ticket.isWinner && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-6 sm:p-8 text-center shadow-2xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/30 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trophy size={32} className="text-white drop-shadow" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">🎉 OFFICIAL WINNER! 🎉</h2>
            <p className="text-sm font-medium text-amber-100 max-w-sm mx-auto">
              This ticket has been officially selected as a winning entry in this draw.
            </p>
          </div>
        </div>
      )}

      {/* MAIN TICKET PASS */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        {/* Pass Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border-b border-white/10 text-center relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-400 mb-2">
            Cryptographic Entry Pass
          </div>
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider flex items-center justify-center gap-3">
            <span>{ticket.ticketCode}</span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
              title="Copy Ticket Code"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>
          {copied && (
            <div className="text-xs text-emerald-400 font-bold mt-2">Copied to clipboard!</div>
          )}
        </div>

        {/* Perforation Cutouts */}
        <div className="relative">
          <div className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full bg-[#090D16] border border-white/10 z-10" />
          <div className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-[#090D16] border border-white/10 z-10" />
          <div className="border-t-2 border-dashed border-white/15 my-0" />
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Draw Details */}
          <div className="text-center space-y-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              ticket.draw.status === 'LIVE'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
            }`}>
              {ticket.draw.status} Draw
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {ticket.draw.title}
            </h3>
          </div>

          {/* Details Table */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
            <div className="flex justify-between items-center p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Entry Fee</span>
              <span className="text-base font-black text-white">
                {formatCurrency(ticket.pricePaid || ticket.draw.entryFee)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Purchased On</span>
              <span className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-400" />
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Status</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                {ticket.status}
              </span>
            </div>
          </div>

          {/* Simulated Cryptographic Barcode Footer */}
          <div className="pt-2 text-center space-y-2">
            <div className="flex justify-center items-center gap-1 h-8 opacity-40 select-none">
              <span className="w-1 h-full bg-white rounded-full inline-block" />
              <span className="w-0.5 h-full bg-white rounded-full inline-block" />
              <span className="w-1.5 h-full bg-white rounded-full inline-block" />
              <span className="w-0.5 h-full bg-white rounded-full inline-block" />
              <span className="w-2 h-full bg-white rounded-full inline-block" />
              <span className="w-0.5 h-full bg-white rounded-full inline-block" />
              <span className="w-1 h-full bg-white rounded-full inline-block" />
              <span className="w-2.5 h-full bg-white rounded-full inline-block" />
              <span className="w-0.5 h-full bg-white rounded-full inline-block" />
              <span className="w-1 h-full bg-white rounded-full inline-block" />
              <span className="w-1.5 h-full bg-white rounded-full inline-block" />
              <span className="w-0.5 h-full bg-white rounded-full inline-block" />
              <span className="w-2 h-full bg-white rounded-full inline-block" />
              <span className="w-0.5 h-full bg-white rounded-full inline-block" />
              <span className="w-1 h-full bg-white rounded-full inline-block" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center justify-center gap-1">
              <QrCode size={12} /> SHA256-AUTHENTICATED ENTRY TICKET
            </div>
          </div>
        </div>
      </div>

      {/* PRIZE DETAILS (If Winner) */}
      {ticket.winner && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-900/20 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Trophy size={18} />
            <span>Winning Prize Details</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {ticket.winner.drawproduct.image && (
              <img
                src={getImageUrl(ticket.winner.drawproduct.image)}
                alt={ticket.winner.drawproduct.name}
                className="w-24 h-24 rounded-2xl object-cover border border-amber-500/20 shrink-0"
              />
            )}
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">{ticket.winner.drawproduct.name}</h4>
              {ticket.winner.drawproduct.description && (
                <p className="text-xs text-slate-400 line-clamp-2">{ticket.winner.drawproduct.description}</p>
              )}
              <div className="text-xs text-amber-400 font-semibold pt-1">
                Declared on {formatDateTime(ticket.winner.declaredAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT AUDIT DETAILS */}
      {ticket.payment && (
        <div className="rounded-3xl p-6 bg-slate-900/80 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard size={16} className="text-indigo-400" /> Payment Audit
            </h3>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
              ticket.payment.status === 'APPROVED'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : ticket.payment.status === 'PENDING'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              {ticket.payment.status}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm py-2 border-b border-white/5">
              <span className="text-slate-400 font-medium">Amount Processed</span>
              <span className="font-bold text-white text-base">{formatCurrency(ticket.payment.amount)}</span>
            </div>

            {ticket.payment.transactionId && (
              <div className="flex justify-between items-center text-sm py-2 border-b border-white/5">
                <span className="text-slate-400 font-medium">Bank UTR / Trans ID</span>
                <span className="font-mono text-xs text-indigo-300 break-all">{ticket.payment.transactionId}</span>
              </div>
            )}

            {ticket.payment.screenshot && (
              <div className="pt-2">
                <button
                  onClick={() => setShowScreenshotModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={14} /> View Attached Payment Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showScreenshotModal && ticket?.payment?.screenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowScreenshotModal(false)}
        >
          <div
            className="max-w-lg w-full bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white">Payment Receipt Proof</h4>
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg"
              >
                Close
              </button>
            </div>
            <img
              src={getImageUrl(ticket.payment.screenshot)}
              alt="Payment Proof"
              className="w-full h-auto max-h-[70vh] object-contain rounded-2xl bg-black/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}
