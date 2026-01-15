'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Clock, Ticket, Trophy, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

// --- Types ---

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface JoinResponse {
  paymentId: string;
  amount: number;
  orderId?: string;
}

interface VerifyResponse {
  ticketId: string;
  ticketCode: string;
}

interface DrawDetails {
  id: string;
  title: string;
  description: string;
  bannerImage: string | null;
  entryFee: number;
  startTime: string;
  endTime: string;
  maxTickets: number;
  status: 'DRAFT' | 'LIVE' | 'CLOSED' | 'RESULT_DECLARED';
  rules: string | null;
  stats?: {
    sold: number;
    total: number;
    progress: number;
    left: number;
  };
  hasJoined: boolean;
  // Make arrays optional to be safe
  drawproduct?: Array<{
    id: string;
    name: string;
    image: string | null;
    quantity: number;
  }>;
  winner?: Array<{
    user: { name: string; avatar: string | null };
    drawproduct: { name: string };
  }>;
}

export default function DrawDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrawDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchDrawDetails() {
    try {
      const res = await api.get<DrawDetails>(`/user/draws/${id}`) as ApiResponse<DrawDetails>;
      
      if (res.success && res.data) {
        setDraw(res.data);
      } else {
        const msg = res.message || res.error || "Failed to load data";
        setError(msg);
      }
    } catch (err) {
      setError("Failed to load draw details");
    } finally {
      setLoading(false);
    }
  }

  const handleJoin = async () => {
    if (!draw) return;
    setJoining(true);

    try {
      // 1. Initiate Join
      const joinRes = await api.post<JoinResponse>(`/user/draws/${id}/join`) as ApiResponse<JoinResponse>;
      
      if (!joinRes.success || !joinRes.data) {
        throw new Error(joinRes.message || joinRes.error || "Join failed");
      }

      const { paymentId } = joinRes.data;
      const mockGatewayId = `MOCK_PAY_${Date.now()}`;
      
      // 2. Verify Payment
      const verifyRes = await api.post<VerifyResponse>(`/user/payment/verify`, {
        paymentId,
        gatewayPaymentId: mockGatewayId
      }) as ApiResponse<VerifyResponse>;

      if (verifyRes.success && verifyRes.data) {
        router.push(`/user/tickets/${verifyRes.data.ticketId}`);
      } else {
        throw new Error(verifyRes.message || verifyRes.error || "Verification failed");
      }

    } catch (err: unknown) {
      let message = "Payment failed";
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      alert(message);
      setJoining(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;
  if (error || !draw) return <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center flex-col gap-2"><AlertCircle className="text-red-500" />{error || "Draw not found"}</div>;

  // Safe accessors with defaults
  const soldCount = draw.stats?.sold ?? 0;
  const totalCount = draw.stats?.total ?? draw.maxTickets ?? 0;
  const leftCount = draw.stats?.left ?? (totalCount - soldCount);
  const progressPercent = draw.stats?.progress ?? 0;
  
  // FIX: Ensure arrays exist before mapping
  const products = draw.drawproduct || [];
  const winners = draw.winner || [];

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24">
      {/* 1. Hero / Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-gray-900">
        {draw.bannerImage ? (
          <img src={draw.bannerImage} alt={draw.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
            <Trophy size={64} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
             draw.status === 'LIVE' ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-gray-800 text-gray-400 border-gray-700'
           }`}>
             {draw.status === 'LIVE' ? '● LIVE' : draw.status}
           </span>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        
        <div className="bg-[#151922] rounded-3xl p-6 border border-white/5 shadow-2xl">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">{draw.title}</h1>
          <p className="text-gray-400 text-sm mb-6">{draw.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0B0E14] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Entry Fee</p>
              <p className="text-2xl font-black text-white">₹{draw.entryFee}</p>
            </div>
            <div className="bg-[#0B0E14] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Results On</p>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-purple-400" />
                {new Date(draw.endTime).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
             <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>{soldCount} Sold</span>
                <span className="text-purple-400">{leftCount} Remaining</span>
             </div>
             <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
             </div>
          </div>

          {/* 3. Products / Prizes */}
          {products.length > 0 && (
            <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" /> Prizes
                </h3>
                <div className="space-y-3">
                {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 bg-[#0B0E14] p-3 rounded-xl border border-white/5">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                        )}
                        </div>
                        <div>
                        <p className="font-bold text-white">{product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
          )}

          {/* 4. Winners */}
          {draw.status === 'RESULT_DECLARED' && winners.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-yellow-900/10 to-transparent p-6 rounded-2xl border border-yellow-500/20">
              <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                 <Trophy size={18} /> Official Winners
              </h3>
              <div className="grid gap-3">
                {winners.map((win, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold border border-yellow-500/30">
                        {idx + 1}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white">{win.user.name}</p>
                        <p className="text-xs text-gray-400">Won: {win.drawproduct.name}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {draw.rules && (
             <div className="border-t border-white/5 pt-6">
                <h3 className="font-bold mb-2">Rules & Guidelines</h3>
                <div className="text-xs text-gray-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: draw.rules }} />
             </div>
          )}
        </div>
      </div>

      {/* 5. Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0E14]/80 backdrop-blur-xl border-t border-white/10 p-4 z-50">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
               <p className="text-xs text-gray-400">Total Payable</p>
               <p className="text-xl font-black text-white">₹{draw.entryFee}</p>
            </div>

            {draw.hasJoined ? (
               <button 
                 onClick={() => router.push('/user/tickets')}
                 className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
               >
                 <CheckCircle size={20} /> You&#39;ve Joined
               </button>
            ) : draw.status === 'LIVE' && leftCount > 0 ? (
               <button 
                 onClick={handleJoin}
                 disabled={joining}
                 className="w-full sm:w-auto flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                 {joining ? (
                   <>Processing...</>
                 ) : (
                   <><Ticket size={20} /> Join Now • ₹{draw.entryFee}</>
                 )}
               </button>
            ) : (
               <button disabled className="w-full sm:w-auto flex-1 bg-gray-700 text-gray-400 font-bold py-3 px-8 rounded-xl cursor-not-allowed">
                 {draw.status === 'LIVE' ? 'Sold Out' : 'Draw Closed'}
               </button>
            )}
         </div>
      </div>

    </div>
  );
}