'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatCurrency, getTimeRemaining } from '@/lib/utils';
import Header from '@/components/ClientUI/Header';
import BottomNav from '@/components/UserUI/BottomNav';
import { ChevronLeft, ChevronRight, Trophy, Calendar, Clock } from 'lucide-react';

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

interface DrawsResponse {
  success: boolean;
  data: Draw[]; 
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Components ---

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[120px]" />
  </div>
);

const DrawCard = ({ draw }: { draw: Draw }) => {
  const timeRemaining = getTimeRemaining(draw.endTime);
  const isSoldOut = draw.stats.percentage >= 100;

  return (
    <Link href={`/user/draws/${draw.id}`} className="block h-full">
      <div className="group relative bg-[#1A1F2E] border border-white/5 hover:border-purple-500/30 rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 h-full flex flex-col">
        <div className="relative h-48 bg-gray-900 overflow-hidden">
          {draw.bannerImage || (draw.drawproduct[0]?.image) ? (
            <img 
              src={draw.bannerImage || draw.drawproduct[0]?.image || ''} 
              alt={draw.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
            />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
               <Trophy className="text-white/20 w-12 h-12" />
             </div>
          )}
          <div className="absolute top-3 right-3">
             <span className={`
               backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
               ${draw.status === 'LIVE' ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''}
               ${draw.status === 'CLOSED' ? 'bg-red-500/20 border-red-500/30 text-red-400' : ''}
               ${draw.status === 'RESULT_DECLARED' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : ''}
             `}>
               {draw.status === 'RESULT_DECLARED' ? 'Winner Declared' : draw.status}
             </span>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-3">
             <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">
               {draw.drawproduct[0]?.name || 'Mystery Prize'}
             </p>
             <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
               {draw.title}
             </h3>
          </div>
          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-end border-t border-white/5 pt-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Entry Fee</p>
                <p className="text-xl font-bold text-white">{formatCurrency(draw.entryFee)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">
                   {draw.status === 'LIVE' ? 'Ends In' : 'Ended'}
                </p>
                <div className="flex items-center gap-1.5 text-gray-300 text-sm font-medium bg-white/5 px-2 py-1 rounded-lg">
                  <Clock size={12} className="text-purple-400" />
                  {draw.status === 'LIVE' ? timeRemaining : new Date(draw.endTime).toLocaleDateString()}
                </div>
              </div>
            </div>
            {draw.status === 'LIVE' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="text-gray-400">{draw.stats.sold} Sold</span>
                  <span className="text-purple-400">{draw.stats.percentage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
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
  <div className="bg-[#1A1F2E] rounded-[1.5rem] overflow-hidden h-[380px] animate-pulse border border-white/5">
    <div className="h-48 bg-gray-800/50" />
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-gray-800/50 rounded" />
        <div className="h-6 w-3/4 bg-gray-800/50 rounded" />
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-10 bg-gray-800/50 rounded" />
        <div className="h-2 bg-gray-800/50 rounded" />
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

        const res = await api.get<DrawsResponse>(`/user/draws?${query.toString()}`);
        
        // FIXED: Explicit check and variable assignment to satisfy TypeScript
        if (res.success && res.data) {
          const payload = res.data; // Now TypeScript knows 'payload' is DrawsResponse
          setData(payload.data);
          
          if (payload.pagination) {
            setPagination(prev => ({ 
              ...prev, 
              totalPages: payload.pagination.totalPages 
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
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-purple-500/30 pb-24">
      <BackgroundGlow />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              Explore Draws
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Find your lucky ticket from our curated selection
            </p>
          </div>

          <div className="flex p-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/5 self-start md:self-auto">
            {(['live', 'upcoming', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`
                  relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 capitalize z-10
                  ${activeTab === tab ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}
                `}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full -z-10 shadow-lg shadow-purple-900/40" />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <DrawSkeleton key={i} />)}
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.map((draw) => (
              <DrawCard key={draw.id} draw={draw} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-gray-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No draws found</h3>
            <p className="text-gray-400 max-w-xs mx-auto">
              There are currently no {activeTab} draws available. Check back later!
            </p>
          </div>
        )}

        {!loading && data.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="text-sm font-medium text-gray-400">
              Page <span className="text-white font-bold">{pagination.page}</span> of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}