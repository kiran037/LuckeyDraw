'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import { 
  ArrowLeft, Share2, CreditCard, Hash, Trophy, 
  Calendar, CheckCircle2, Loader2, AlertCircle, Download
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  // --- Error State ---
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ticket Not Found</h3>
        <button 
          onClick={() => router.back()}
          className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white pb-32 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block">
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-20%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 shadow-sm transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <h1 className="text-sm font-black tracking-widest text-gray-500 dark:text-white/80 uppercase">Ticket Details</h1>
          
          <button 
            onClick={() => {/* Share logic */}}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 shadow-sm transition-colors"
          >
            <Share2 size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* --- WINNER BANNER --- */}
        {ticket.isWinner && (
          <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-6 text-center shadow-lg shadow-yellow-500/20 animate-in fade-in slide-in-from-top-4">
            <div className="absolute inset-0 bg-white/20 opacity-50 mix-blend-overlay" />
            <Trophy size={32} className="mx-auto text-white mb-2 drop-shadow-md" />
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">YOU WON!</h2>
            <p className="text-sm text-yellow-50 font-bold opacity-90">Congratulations on your victory!</p>
          </div>
        )}

        {/* --- MAIN TICKET CARD --- */}
        <div className="relative bg-white dark:bg-[#151925] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/5 shadow-2xl">
          
          {/* Top Strip (Header) */}
          <div className="bg-gray-900 dark:bg-[#0f1116] p-8 text-center relative overflow-hidden border-b border-gray-800 dark:border-white/5">
             <div className="relative z-10">
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-2">TICKET ID</p>
               <h2 className="text-4xl sm:text-5xl font-mono font-black tracking-tighter text-white drop-shadow-lg">
                 {ticket.ticketCode}
               </h2>
             </div>
             {/* Abstract Circles */}
             <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="p-6 sm:p-8 relative">
            {/* Cutout Notches */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-gray-50 dark:bg-[#09090b] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner border border-gray-200 dark:border-white/5" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-gray-50 dark:bg-[#09090b] rounded-full translate-x-1/2 -translate-y-1/2 shadow-inner border border-gray-200 dark:border-white/5" />
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">{ticket.draw.title}</h3>
              <div className="flex justify-center">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.draw.status === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'}`}>
                    {ticket.draw.status}
                 </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-200 dark:border-white/10">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Entry Fee</span>
                 <span className="font-bold text-gray-900 dark:text-white text-lg">{formatCurrency(ticket.pricePaid || ticket.draw.entryFee)}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-200 dark:border-white/10">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Purchased</span>
                 <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar size={14} />
                    <span>{formatDateTime(ticket.createdAt).split(',')[0]}</span>
                 </div>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-200 dark:border-white/10">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</span>
                 <span className="text-sm font-bold text-gray-900 dark:text-white">{ticket.status}</span>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="bg-gray-50 dark:bg-[#0f1116] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 mt-6 border border-gray-100 dark:border-white/5 shadow-inner">
                 <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-sm">
                    <Hash size={40} className="text-black" />
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Scan to verify</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PAYMENT INFO --- */}
        {ticket.payment && (
          <div className="mt-6 bg-white dark:bg-[#151925] rounded-3xl p-6 border border-gray-200 dark:border-white/5 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <CreditCard size={16} className="text-purple-600 dark:text-purple-400" /> Payment Details
            </h3>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-500">Status</span>
                 <span className={`text-xs font-bold px-2 py-1 rounded ${ticket.payment.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'}`}>
                   {ticket.payment.status}
                 </span>
               </div>
               
               {ticket.payment.transactionId && (
                 <div className="flex justify-between items-center bg-gray-50 dark:bg-[#0f1116] p-3 rounded-xl border border-gray-100 dark:border-white/5">
                   <span className="text-xs text-gray-500 font-bold">TXN ID</span>
                   <span className="font-mono text-xs text-gray-700 dark:text-purple-300">{ticket.payment.transactionId}</span>
                 </div>
               )}

               {ticket.payment.screenshot && (
                 <div className="mt-4">
                   <p className="text-xs text-gray-500 font-bold mb-3 uppercase">Proof of Payment</p>
                   <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                      <img 
                        src={getImageUrl(ticket.payment.screenshot)} 
                        alt="Receipt" 
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Download className="text-white" size={24} />
                      </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- PRIZE INFO (If Winner) --- */}
        {ticket.winner && (
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-[#1a1500] dark:to-[#2a2005] rounded-3xl p-6 border border-yellow-200 dark:border-yellow-500/20 shadow-lg">
            <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Trophy size={16} /> Prize Details
            </h3>
            <div className="flex items-start gap-4">
              {ticket.winner.drawproduct.image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-yellow-200 dark:border-yellow-500/20 shrink-0 bg-white dark:bg-black">
                   <img 
                     src={getImageUrl(ticket.winner.drawproduct.image)}
                     alt={ticket.winner.drawproduct.name}
                     className="w-full h-full object-cover"
                   />
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{ticket.winner.drawproduct.name}</p>
                {ticket.winner.drawproduct.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{ticket.winner.drawproduct.description}</p>
                )}
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                   <CheckCircle2 size={10} className="text-yellow-600 dark:text-yellow-500" />
                   <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase">
                     Claimed on {formatDateTime(ticket.winner.declaredAt).split(',')[0]}
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