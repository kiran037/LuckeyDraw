'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Trophy, Calendar, Clock } from 'lucide-react';
import { getImageUrl } from '@/lib/image-helper';

// --- Types ---

interface Draw {
  id: string;
  title: string;
  bannerImage: string | null;
  entryFee: number;
  startTime: string;
  endTime: string;
  status: 'LIVE' | 'DRAFT' | 'CLOSED' | 'RESULT_DECLARED';
  stats: {
    sold: number;
    total: number;
    percentage: number;
  };
  drawproduct: {
    name: string;
    image: string | null;
  }[];
}

// FIX 1: Updated Interface to match API structure exactly
interface DrawsResponseData {
  draws: Draw[]; 
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Components ---

const DrawCard = ({ draw }: { draw: Draw }) => {
  const timeRemaining = getTimeRemaining(draw.endTime);
  const isSoldOut = draw.stats.percentage >= 100;
  const isLive = draw.status === 'LIVE';

  return (
    <Link href={`/user/draws/${draw.id}`} className="block h-full">
      <div className="
        group relative h-full flex flex-col overflow-hidden transition-all duration-300
        bg-white dark:bg-[#151925] 
        border border-gray-200 dark:border-white/5 
        hover:border-purple-500/30 dark:hover:border-purple-500/30
        rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-y-1
      ">
        
        {/* Image Section */}
        <div className="relative h-48 bg-gray-100 dark:bg-[#0B0E14] overflow-hidden">
          {draw.bannerImage || (draw.drawproduct[0]?.image) ? (
            <img 
              src={getImageUrl(draw.bannerImage) || getImageUrl(draw.drawproduct[0]?.image) || ''} 
              alt={draw.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#1A1F2E]">
               <Trophy className="text-gray-300 dark:text-white/20 w-12 h-12" />
             </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
             <span className={`
               backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm
               ${draw.status === 'LIVE' 
                 ? 'bg-white/90 text-green-700 border-green-200 dark:bg-black/50 dark:text-green-400 dark:border-green-500/30' 
                 : 'bg-white/90 text-gray-600 border-gray-200 dark:bg-black/50 dark:text-gray-400 dark:border-white/10'}
             `}>
               {draw.status === 'RESULT_DECLARED' ? 'Winner Declared' : draw.status}
             </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-4">
             <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mb-1 line-clamp-1">
               {draw.drawproduct[0]?.name || 'Mystery Prize'}
             </p>
             <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
               {draw.title}
             </h3>
          </div>

          <div className="mt-auto space-y-4">
            {/* Info Row */}
            <div className="flex justify-between items-end border-t border-gray-100 dark:border-white/5 pt-3">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold mb-0.5">Entry Fee</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(draw.entryFee)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold mb-0.5">
                   {isLive ? 'Ends In' : 'Ended'}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300">
                  <Clock size={12} className="text-purple-500" />
                  {isLive ? timeRemaining : new Date(draw.endTime).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar (Only for Live) */}
            {isLive && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-500 dark:text-gray-400">{draw.stats.sold} Sold</span>
                  <span className="text-gray-900 dark:text-white">{draw.stats.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-red-500' : 'bg-purple-600'}`}
                    style={{ width: `${draw.stats.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const DrawSkeleton = () => (
  <div className="bg-white dark:bg-[#151925] rounded-[24px] overflow-hidden h-[380px] border border-gray-200 dark:border-white/5">
    <div className="h-48 bg-gray-100 dark:bg-white/5 animate-pulse" />
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-10 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
        <div className="h-2 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

// --- Main Page ---

export default function DrawsPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'closed'>('live');
  const [data, setData] = useState<Draw[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          tab: activeTab,
          page: pagination.page.toString(),
          limit: '9'
        });

        // Pass the corrected Interface
        const res = await api.get<DrawsResponseData>(`/user/draws?${query.toString()}`);
        
        if (res.success && res.data) {
          // FIX 2: Correctly access the 'draws' array from the data object
          // The API returns: { draws: [], pagination: {} }
          const payload = res.data;
          
          if (Array.isArray(payload.draws)) {
            setData(payload.draws);
          } else {
            setData([]);
          }
          
          if (payload.pagination) {
            setPagination(prev => ({ 
              ...prev, 
              // API uses 'pages' or 'totalPages', fallback safely
              totalPages: payload.pagination.totalPages || 1 
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load draws", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, [activeTab, pagination.page]);

  const handleTabChange = (tab: 'live' | 'upcoming' | 'closed') => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] text-gray-900 dark:text-white font-sans pb-32 transition-colors duration-300">
      
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-gray-600 dark:from-white dark:via-purple-200 dark:to-gray-500 mb-2">
              Explore Draws
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
              Find your lucky ticket from our curated selection of exclusive prizes.
            </p>
          </div>

          {/* Custom Tabs */}
          <div className="flex p-1.5 bg-white dark:bg-[#151925] rounded-full border border-gray-200 dark:border-white/5 shadow-sm self-start md:self-auto overflow-x-auto max-w-full">
            {(['live', 'upcoming', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`
                  relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 capitalize z-10 whitespace-nowrap
                  ${activeTab === tab 
                    ? 'text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
                `}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full -z-10" />
                )}
                <span className={activeTab === tab ? "text-white dark:text-black" : ""}>
                   {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <DrawSkeleton key={i} />)}
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.map((draw) => (
              <DrawCard key={draw.id} draw={draw} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-300 dark:border-white/10 rounded-[32px] bg-white/50 dark:bg-white/5 animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-5">
              <Calendar className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No draws found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
              There are currently no {activeTab} draws available. Please check back later!
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 animate-in fade-in">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-3 rounded-full bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Page <span className="text-gray-900 dark:text-white font-bold">{pagination.page}</span> of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-3 rounded-full bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}