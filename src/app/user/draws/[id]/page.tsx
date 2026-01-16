'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { 
  Clock, Trophy, CheckCircle, Loader2, AlertCircle, Ticket, 
  ChevronLeft, Share2, Info, Users, Crown 
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
  }>;
}

export default function DrawDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await api.get<DrawDetails>(`/user/draws/${id}`);
        
        if (res.success && res.data) {
          setDraw(res.data);
        } else {
          setError(res.message || "Failed to load draw details");
        }
      } catch (err) {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "TBA";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">Loading details...</p>
      </div>
    );
  }
  
  // --- Error State ---
  if (error || !draw) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Draw Not Found</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6">{error || "This draw may have been removed."}</p>
        <button 
          onClick={() => router.push('/user/draws')}
          className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full transition-transform hover:scale-105"
        >
          Browse Draws
        </button>
      </div>
    );
  }

  // Safe Defaults
  const soldCount = draw.stats?.sold ?? 0;
  const leftCount = draw.stats?.left ?? 0;
  const progressPercent = draw.stats?.progress ?? 0;
  const products = draw.drawproduct || [];
  const isLive = draw.status === 'LIVE';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white pb-32 transition-colors duration-300">
      
      {/* Hero Header */}
      <div className="relative h-64 sm:h-96 w-full bg-gray-900 overflow-hidden">
        {draw.bannerImage ? (
          <img src={getImageUrl(draw.bannerImage)} alt={draw.title} className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
            <Trophy size={64} className="text-white/20" />
          </div>
        )}
        
        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10">
           <button 
             onClick={() => router.back()}
             className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-colors"
           >
             <ChevronLeft size={20} />
           </button>
           
           <div className="flex gap-2">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-colors">
               <Share2 size={18} />
             </button>
           </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#09090b] via-transparent to-black/30" />
      </div>

      {/* Main Content Card - Floats over Hero */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-24 relative z-10">
        <div className="bg-white dark:bg-[#151925] rounded-[2rem] p-6 sm:p-8 border border-gray-200 dark:border-white/5 shadow-xl transition-colors duration-300">
          
          {/* Status Chip */}
          <div className="flex items-center gap-3 mb-4">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
               isLive ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' 
               : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
             }`}>
               <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
               {draw.status}
             </span>
             {draw.userStatus?.hasJoined && (
               <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30 flex items-center gap-1">
                 <CheckCircle size={12} /> Joined
               </span>
             )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black mb-3 leading-tight">{draw.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">{draw.description || "Join this exciting draw for a chance to win amazing prizes!"}</p>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-[#0B0E14] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Entry Fee</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(draw.entryFee)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#0B0E14] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Draw Date</p>
              <div className="flex items-center gap-2">
                 <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                 <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {formatDate(draw.endTime)}
                 </p>
              </div>
            </div>
          </div>

          {/* Ticket Progress */}
          <div className="mb-10 bg-gray-50 dark:bg-[#0B0E14] p-5 rounded-2xl border border-gray-100 dark:border-white/5">
             <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                   <Users size={16} className="text-gray-400" />
                   <span>{soldCount} <span className="text-gray-400 font-normal">tickets sold</span></span>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                   {leftCount} left
                </span>
             </div>
             <div className="h-4 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                   <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </div>
             </div>
          </div>

          {/* Products List */}
          {products.length > 0 && (
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                   <Crown size={20} className="text-yellow-500 fill-yellow-500" /> 
                   Win These Prizes
                </h3>
                <div className="space-y-4">
                  {products.map((product) => (
                      <div key={product.id} className="flex gap-4 bg-gray-50 dark:bg-[#0B0E14] p-4 rounded-2xl border border-gray-100 dark:border-white/5 items-center">
                          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-white/5">
                            {product.image ? (
                                <img src={getImageUrl(product.image)} className="w-full h-full object-cover" alt={product.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{product.name}</p>
                            <p className="text-xs text-gray-500 font-medium bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded w-fit">
                               Quantity: {product.quantity}
                            </p>
                          </div>
                      </div>
                  ))}
                </div>
            </div>
          )}

          {/* Rules Accordion Style */}
          {draw.rules && (
             <div className="border-t border-gray-100 dark:border-white/5 pt-6 mt-6">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                   <Info size={18} className="text-gray-400" /> Rules
                </h3>
                <div 
                  className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: draw.rules }} 
                />
             </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 p-4 z-50 transition-colors duration-300">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
               <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Payable</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(draw.entryFee)}</p>
            </div>

            {/* Dynamic Button Logic */}
            {draw.userStatus?.hasJoined ? (
               <button 
                 onClick={() => router.push('/user/tickets')}
                 className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
               >
                 <CheckCircle size={20} /> View Ticket
               </button>
            ) : draw.userStatus?.pendingPayment ? (
                <button 
                  disabled
                  className="w-full sm:w-auto flex-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 font-bold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Clock size={20} /> Approval Pending
                </button>
            ) : isLive && leftCount > 0 ? (
               <button 
                 onClick={() => router.push(`/user/draws/${id}/buy`)}
                 className="w-full sm:w-auto flex-1 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
               >
                 <Ticket size={20} /> Join Now <span className="sm:hidden">• {formatCurrency(draw.entryFee)}</span>
               </button>
            ) : (
               <button disabled className="w-full sm:w-auto flex-1 bg-gray-100 dark:bg-white/10 text-gray-400 font-bold py-3.5 px-8 rounded-full cursor-not-allowed">
                 {isLive ? 'Sold Out' : 'Draw Closed'}
               </button>
            )}
         </div>
      </div>
    </div>
  );
}