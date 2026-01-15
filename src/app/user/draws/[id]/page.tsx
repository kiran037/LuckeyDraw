'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Clock, Trophy, CheckCircle, Loader2, AlertCircle, Ticket } from 'lucide-react';

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
  hasJoined: boolean;
  pendingPayment: boolean;
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default function DrawDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  // Safe ID extraction
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        // FIX: Removed '/api' prefix. The api-client usually adds this.
        // If your client DOES NOT add it, change this back to `/api/user/draws/${id}`
        const res = await api.get<DrawDetails>(`/user/draws/${id}`) as ApiResponse<DrawDetails>;
        
        if (res.success && res.data) {
          setDraw(res.data);
        } else {
          setError(res.message || "Failed to load draw details");
        }
      } catch (err) {
        console.error(err);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  // Safe Date Formatter
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "TBA";
    try {
      // Fix SQL date format (space to T) for Safari/Firefox
      const isoString = dateString.replace(" ", "T");
      const date = new Date(isoString);
      // Check for invalid date
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return "Date Error";
    }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;
  
  if (error || !draw) return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center flex-col gap-2">
      <AlertCircle className="text-red-500" />
      <p>{error || "Draw not found"}</p>
      <button onClick={() => window.location.reload()} className="text-xs text-gray-500 hover:text-white underline">Retry</button>
    </div>
  );

  // Safe Defaults
  const soldCount = draw.stats?.sold ?? 0;
  const leftCount = draw.stats?.left ?? 0;
  const progressPercent = draw.stats?.progress ?? 0;
  const products = draw.drawproduct || [];

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 w-full bg-gray-900">
        {draw.bannerImage ? (
          <img src={draw.bannerImage} alt={draw.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
            <Trophy size={64} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
             draw.status === 'LIVE' ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-gray-800 text-gray-400 border-gray-700'
           }`}>
             {draw.status === 'LIVE' ? '● LIVE' : draw.status}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-[#151922] rounded-3xl p-6 border border-white/5 shadow-2xl">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">{draw.title || "Untitled Draw"}</h1>
          <p className="text-gray-400 text-sm mb-6">{draw.description || "No description available"}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0B0E14] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Entry Fee</p>
              <p className="text-2xl font-black text-white">₹{draw.entryFee}</p>
            </div>
            <div className="bg-[#0B0E14] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Results On</p>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-purple-400" />
                {formatDate(draw.endTime)}
              </p>
            </div>
          </div>

          {/* Progress */}
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

          {/* Products */}
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

          {/* Rules */}
          {draw.rules && (
             <div className="border-t border-white/5 pt-6">
                <h3 className="font-bold mb-2">Rules & Guidelines</h3>
                <div className="text-xs text-gray-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: draw.rules }} />
             </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0E14]/80 backdrop-blur-xl border-t border-white/10 p-4 z-50">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
               <p className="text-xs text-gray-400">Total Payable</p>
               <p className="text-xl font-black text-white">₹{draw.entryFee}</p>
            </div>

            {draw.hasJoined ? (
               <button 
                 onClick={() => router.push('/user/tickets')}
                 className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2"
               >
                 <CheckCircle size={20} /> You&#39;ve Joined
               </button>
            ) : draw.pendingPayment ? (
                <button 
                  disabled
                  className="w-full sm:w-auto flex-1 bg-yellow-600/50 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Clock size={20} /> Approval Pending
                </button>
            ) : draw.status === 'LIVE' && leftCount > 0 ? (
               <button 
                 onClick={() => router.push(`/user/draws/${id}/buy`)}
                 className="w-full sm:w-auto flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
               >
                 <Ticket size={20} /> Join Now • ₹{draw.entryFee}
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