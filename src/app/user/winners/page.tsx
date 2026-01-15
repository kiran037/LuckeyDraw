'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import { Trophy, Calendar, Ticket, Crown } from 'lucide-react';

// --- Interfaces ---

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

// FIX: Local Response Interface to handle 'message' safely
interface PageApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// --- Components ---

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 pointer-events-none select-none bg-[#09090b]">
    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] mix-blend-screen" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
  </div>
);

const WinnerCard = ({ winner, rank }: { winner: Winner; rank?: number }) => {
  const isTopWinner = rank === 0;

  return (
    <div className={`
      relative group overflow-hidden rounded-3xl border transition-all duration-500
      ${isTopWinner 
        ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#1a1500] to-[#0f0f12] border-yellow-500/30 shadow-[0_0_30px_-5px_rgba(234,179,8,0.15)]' 
        : 'bg-[#12151d] border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:-translate-y-1'
      }
    `}>
      {/* Glow Effects */}
      {isTopWinner && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-50" />}
      
      <div className={`flex flex-col ${isTopWinner ? 'md:flex-row items-center gap-8' : ''} p-5 h-full relative z-10`}>
        
        {/* Prize Image */}
        <div className={`
          relative rounded-2xl overflow-hidden bg-[#0a0c10] border border-white/5 flex-shrink-0
          ${isTopWinner ? 'w-full md:w-64 h-64 shadow-2xl' : 'w-full h-48 mb-4'}
        `}>
          {winner.prizeImage ? (
            <img src={winner.prizeImage} alt={winner.prizeName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
              <Trophy className="text-gray-700" size={isTopWinner ? 64 : 32} />
            </div>
          )}
          
          {/* Ticket Badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Ticket size={12} className="text-purple-400" />
            <span className="text-xs font-mono font-bold text-white tracking-widest">{winner.ticketCode}</span>
          </div>
        </div>

        {/* Info Content */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* User Info */}
          <div className="flex items-center gap-4">
             <div className={`relative ${isTopWinner ? 'w-16 h-16' : 'w-10 h-10'} rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-blue-500`}>
                <img 
                  src={winner.userAvatar || `https://ui-avatars.com/api/?name=${winner.userName}&background=0D0D10&color=fff`} 
                  alt={winner.userName} 
                  className="w-full h-full rounded-full object-cover border-2 border-[#12151d]"
                />
                {isTopWinner && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg animate-bounce">
                    <Crown size={14} fill="currentColor" />
                  </div>
                )}
             </div>
             <div>
                <h3 className={`font-bold text-white ${isTopWinner ? 'text-xl' : 'text-sm'}`}>{winner.userName}</h3>
                <p className="text-xs text-gray-500 font-mono">{winner.maskedMobile}</p>
             </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-white/5" />

          {/* Winning Details */}
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Won Prize</span>
            </div>
            <h2 className={`font-black text-white leading-tight ${isTopWinner ? 'text-3xl mb-2' : 'text-lg line-clamp-1'}`}>
              {winner.prizeName}
            </h2>
            <p className="text-xs text-gray-400 line-clamp-1">in {winner.drawTitle}</p>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
            <Calendar size={12} />
            <span>Declared on {new Date(winner.wonAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function WinnersPage() {
  const [data, setData] = useState<WinnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWinners() {
      try {
        // FIX: Cast response to PageApiResponse
        const res = await api.get('/user/winners?limit=12') as unknown as PageApiResponse<WinnerData>;
        
        if (isMounted) {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            // FIX: Access message safely now
            setError(res.message || res.error || "Failed to load winners");
          }
        }
      } catch (err) {
        if (isMounted) setError("An unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadWinners();

    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white pb-24 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <BackgroundGlow />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-gray-400 mb-2">
              Hall of Fame
            </h1>
            <p className="text-gray-400 max-w-lg">
              Celebrating the lucky winners who turned their dreams into reality. Will you be next?
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-[#12151d] border border-white/10 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[100px]">
                {/* FIX: Safe navigation with optional chaining and nullish coalescing */}
                <span className="text-2xl font-bold text-white">{data?.pagination?.total ?? 0}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Winners</span>
             </div>
          </div>
        </div>

        {/* Content Grid */}
        {!data?.winners || data.winners.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-[#12151d]/50 rounded-3xl border border-dashed border-white/10">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center text-gray-600 mb-4">
                <Trophy size={32} />
              </div>
              <p className="text-gray-400 font-medium">No winners declared yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {data.winners.map((winner, index) => (
              <WinnerCard key={winner.id} winner={winner} rank={index} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}