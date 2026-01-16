'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import { 
  ArrowLeft, Share2, CreditCard, Trophy, 
  Calendar, CheckCircle2, Loader2, AlertCircle, Download, ExternalLink
} from 'lucide-react';

// --- Types ---
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

  useEffect(() => {
    if (params.id) {
      api.get<TicketDetail>(`/user/tickets/${params.id}`).then(res => {
        if (res.success && res.data) {
          setTicket(res.data);
        } else {
          setError(res.message || "Ticket not found");
        }
        setLoading(false);
      });
    }
  }, [params.id]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading ticket...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ticket Not Found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This ticket doesn't exist or has been removed.</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0B0E14] text-gray-900 dark:text-white pb-24 sm:pb-32">
      
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] bg-purple-500/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#1a1f2e] active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <h1 className="text-sm font-black tracking-wider text-gray-500 dark:text-gray-400 uppercase">Ticket Details</h1>
          
          <button 
            onClick={() => {/* Share logic */}}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#1a1f2e] active:scale-95 transition-all"
          >
            <Share2 size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* --- WINNER BANNER --- */}
        {ticket.isWinner && (
          <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-6 sm:p-8 text-center shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10">
              <Trophy size={40} className="mx-auto text-white mb-3 drop-shadow-lg" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">🎉 YOU WON! 🎉</h2>
              <p className="text-sm text-white/90 font-semibold">Congratulations on your victory!</p>
            </div>
          </div>
        )}

        {/* --- MAIN TICKET CARD --- */}
        <div className="relative bg-white dark:bg-[#151925] rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl mb-6">
          
          {/* Top Strip (Header) */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-[#0a0d14] dark:via-[#0f1219] dark:to-[#0a0d14] p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-400 dark:text-gray-500 mb-3">TICKET ID</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono font-black tracking-tight text-white break-all">
                {ticket.ticketCode}
              </h2>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="p-5 sm:p-6 relative">
            {/* Cutout Notches */}
            <div className="absolute top-0 left-4 w-6 h-6 bg-gray-50 dark:bg-[#0B0E14] rounded-full -translate-y-1/2 border border-gray-200 dark:border-white/10" />
            <div className="absolute top-0 right-4 w-6 h-6 bg-gray-50 dark:bg-[#0B0E14] rounded-full -translate-y-1/2 border border-gray-200 dark:border-white/10" />
            
            {/* Draw Title */}
            <div className="text-center mb-6 pt-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight px-4">{ticket.draw.title}</h3>
              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                ticket.draw.status === 'LIVE' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                  : ticket.draw.status === 'COMPLETED' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
              }`}>
                {ticket.draw.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="space-y-0">
              <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-200 dark:border-white/10">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Entry Fee</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">{formatCurrency(ticket.pricePaid || ticket.draw.entryFee)}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-200 dark:border-white/10">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Purchased</span>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="font-medium">{formatDateTime(ticket.createdAt).split(',')[0]}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Status</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                  ticket.status === 'ACTIVE' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- PAYMENT INFO --- */}
        {ticket.payment && (
          <div className="bg-white dark:bg-[#151925] rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-white/10 shadow-lg mb-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-5 flex items-center gap-2 uppercase tracking-wider">
              <CreditCard size={16} className="text-purple-600 dark:text-purple-400" /> Payment Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Amount</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(ticket.payment.amount)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Status</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  ticket.payment.status === 'APPROVED' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                    : ticket.payment.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                }`}>
                  {ticket.payment.status}
                </span>
              </div>
              
              {ticket.payment.transactionId && (
                <div className="bg-gray-50 dark:bg-[#0f1219] p-4 rounded-xl border border-gray-200 dark:border-white/5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block mb-2">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-700 dark:text-purple-300 break-all">{ticket.payment.transactionId}</span>
                </div>
              )}

              {ticket.payment.screenshot && (
                <div className="mt-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-3 uppercase tracking-wider">Payment Proof</p>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-[#0f1219]">
                    <img 
                      src={getImageUrl(ticket.payment.screenshot)} 
                      alt="Payment Receipt" 
                      className="w-full h-auto max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <ExternalLink size={18} />
                        <span>View Full Size</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PRIZE INFO (If Winner) --- */}
        {ticket.winner && (
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 rounded-2xl p-5 sm:p-6 border border-yellow-300 dark:border-yellow-500/20 shadow-lg">
            <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400 mb-5 flex items-center gap-2 uppercase tracking-wider">
              <Trophy size={16} /> Prize Details
            </h3>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {ticket.winner.drawproduct.image && (
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden border-2 border-yellow-200 dark:border-yellow-500/30 shrink-0 bg-white dark:bg-black/50">
                  <img 
                    src={getImageUrl(ticket.winner.drawproduct.image)}
                    alt={ticket.winner.drawproduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 w-full">
                <p className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl leading-tight mb-2">{ticket.winner.drawproduct.name}</p>
                {ticket.winner.drawproduct.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{ticket.winner.drawproduct.description}</p>
                )}
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30">
                  <CheckCircle2 size={14} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                    Won on {formatDateTime(ticket.winner.declaredAt).split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}