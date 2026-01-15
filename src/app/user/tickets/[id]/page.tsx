// src/app/user/tickets/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import StatusBadge from '@/components/UserUI/StatusBadge';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import { 
  ArrowLeft, Share2, CreditCard, Hash, Trophy, 
  Calendar, CheckCircle2, LucideIcon 
} from 'lucide-react';

// --- Interfaces matching the API Response ---
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

// --- Visual Components ---

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 pointer-events-none select-none bg-[#09090b]">
    <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[20%] right-[-20%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
  </div>
);

// FIX: Replaced 'any' with 'LucideIcon'
const ChromeButton = ({ icon: Icon, onClick }: { icon: LucideIcon, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="
      relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
      bg-[#151925] border border-white/10 hover:bg-white/5 active:scale-95 shadow-lg
    "
  >
    <Icon size={20} className="text-gray-400" />
  </button>
);

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.get<TicketDetail>(`/user/tickets/${params.id}`).then(res => {
        if (res.success && res.data) setTicket(res.data);
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><LoadingSpinner /></div>;
  if (!ticket) return <ErrorState message="Ticket not found" />;

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white pb-32 font-sans overflow-x-hidden">
      <BackgroundGlow />

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-8">
          <ChromeButton icon={ArrowLeft} onClick={() => router.back()} />
          <h1 className="text-lg font-black tracking-wide text-white/90 uppercase">Ticket Details</h1>
          <ChromeButton icon={Share2} onClick={() => {/* Share logic */}} />
        </div>

        {/* --- WINNER BANNER --- */}
        {ticket.isWinner && (
          <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 p-6 text-center shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)] animate-in fade-in slide-in-from-top-4">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
            <Trophy size={32} className="mx-auto text-white mb-2 drop-shadow-md" />
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">YOU WON!</h2>
            <p className="text-sm text-yellow-50 font-medium opacity-90">Congratulations on your victory!</p>
          </div>
        )}

        {/* --- MAIN TICKET CARD --- */}
        <div className="relative bg-[#151925] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
          
          {/* Top Strip (Darker) */}
          <div className="bg-[#0f1116] p-8 text-center relative overflow-hidden border-b border-white/5">
             <div className="relative z-10">
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-2">TICKET ID</p>
               <h2 className="text-4xl sm:text-5xl font-mono font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                 {ticket.ticketCode}
               </h2>
             </div>
             {/* Abstract Circles */}
             <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="p-6 sm:p-8 relative">
            {/* Cutout Notches */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-[#09090b] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-[#09090b] rounded-full translate-x-1/2 -translate-y-1/2 shadow-inner" />
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-white mb-3 leading-snug">{ticket.draw.title}</h3>
              <div className="flex justify-center">
                 <StatusBadge type="draw" status={ticket.draw.status} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-dashed border-white/10">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Entry Fee</span>
                 <span className="font-bold text-white text-lg">{formatCurrency(ticket.pricePaid || ticket.draw.entryFee)}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-dashed border-white/10">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Purchased</span>
                 <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={14} />
                    <span>{formatDateTime(ticket.createdAt).split(',')[0]}</span>
                 </div>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-dashed border-white/10">
                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</span>
                 <StatusBadge type="ticket" status={ticket.status} />
              </div>
              
              {/* QR Code Placeholder (Deep UI Style) */}
              <div className="bg-[#0f1116] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 mt-6 border border-white/5 shadow-inner">
                 <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center">
                    <Hash size={40} className="text-black" />
                 </div>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Scan to verify</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PAYMENT INFO --- */}
        {ticket.payment && (
          <div className="mt-6 bg-[#151925] rounded-3xl p-6 border border-white/5 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <CreditCard size={16} className="text-purple-400" /> Payment Details
            </h3>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Status</span>
                 <StatusBadge type="payment" status={ticket.payment.status} />
               </div>
               
               {ticket.payment.transactionId && (
                 <div className="flex justify-between items-center bg-[#0f1116] p-3 rounded-xl border border-white/5">
                   <span className="text-xs text-gray-500 font-bold">TXN ID</span>
                   <span className="font-mono text-xs text-purple-300">{ticket.payment.transactionId}</span>
                 </div>
               )}

               {ticket.payment.screenshot && (
                 <div className="mt-4">
                   <p className="text-xs text-gray-500 font-bold mb-3 uppercase">Proof of Payment</p>
                   <div className="relative rounded-2xl overflow-hidden border border-white/10">
                      <img 
                        src={getImageUrl(ticket.payment.screenshot)} 
                        alt="Receipt" 
                        className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                      />
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- PRIZE INFO (If Winner) --- */}
        {ticket.winner && (
          <div className="mt-6 bg-gradient-to-br from-[#1a1500] to-[#2a2005] rounded-3xl p-6 border border-yellow-500/20 shadow-[0_4px_20px_-5px_rgba(234,179,8,0.1)]">
            <h3 className="text-sm font-bold text-yellow-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Trophy size={16} /> Prize Details
            </h3>
            <div className="flex items-start gap-4">
              {ticket.winner.drawproduct.image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-yellow-500/20 shrink-0">
                   <img 
                     src={getImageUrl(ticket.winner.drawproduct.image)}
                     alt={ticket.winner.drawproduct.name}
                     className="w-full h-full object-cover"
                   />
                </div>
              )}
              <div>
                <p className="font-bold text-white text-lg leading-tight mb-1">{ticket.winner.drawproduct.name}</p>
                {ticket.winner.drawproduct.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{ticket.winner.drawproduct.description}</p>
                )}
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                   <CheckCircle2 size={10} className="text-yellow-500" />
                   <span className="text-[10px] font-bold text-yellow-500 uppercase">
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