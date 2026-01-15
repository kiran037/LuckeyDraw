'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import EmptyState from '@/components/UserUI/EmptyState';
import { Trophy, Gift, Calendar, ChevronLeft } from 'lucide-react';

interface DrawResult {
  id: string;
  title: string;
  description: string | null;
  endTime: string;
  status: string;
  products: {
    id: string;
    name: string;
    image: string | null;
    quantity: number;
    winners: {
      id: string;
      ticketCode: string;
      declaredAt: string;
      winnerName: string;
      isCurrentUser: boolean;
    }[];
  }[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);
    setError(null);
    const response = await api.get<DrawResult[]>('/user/results');
    if (!response.success) setError(response.error || 'Failed to load results');
    else setResults(response.data || []);
    setLoading(false);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={loadResults} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white rounded-b-[2rem] shadow-sm px-6 pt-12 pb-6 mb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
             <ChevronLeft size={24} />
           </button>
           <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        </div>
      </div>

      <div className="px-6">
        {results.length === 0 ? (
          <EmptyState
            icon={<Trophy size={48} className="text-yellow-400" />}
            title="No Results Yet"
            description="No draws have declared results yet. Check back soon!"
            action={{
              label: 'View Live Draws',
              onClick: () => router.push('/user/draws'),
            }}
          />
        ) : (
          <div className="space-y-6">
            {results.map((draw) => (
              <div key={draw.id} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100">
                {/* Header Section of Card */}
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                   <h2 className="text-xl font-bold mb-1 relative z-10">{draw.title}</h2>
                   <div className="flex items-center gap-2 text-xs opacity-80 relative z-10">
                     <Calendar size={12} />
                     <span>Ended: {formatDate(draw.endTime)}</span>
                   </div>
                </div>

                <div className="p-5 space-y-6">
                  {draw.products.map((product) => (
                    <div key={product.id} className="last:mb-0">
                      {/* Product Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-400">
                              <Gift size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg font-medium">
                            {product.quantity} Winner{product.quantity !== 1 && 's'}
                          </span>
                        </div>
                      </div>

                      {/* Winners List */}
                      {product.winners.length > 0 ? (
                        <div className="space-y-2.5 pl-2 border-l-2 border-dashed border-gray-100 ml-8">
                          {product.winners.map((winner) => (
                            <div
                              key={winner.id}
                              className={`p-3 rounded-2xl flex items-center justify-between transition-transform ${
                                winner.isCurrentUser
                                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-100 shadow-sm scale-[1.02]'
                                  : 'bg-gray-50 border border-transparent'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${winner.isCurrentUser ? 'text-orange-700' : 'text-gray-700'}`}>
                                    {winner.winnerName}
                                  </span>
                                  {winner.isCurrentUser && (
                                    <span className="text-[10px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  Ticket: {winner.ticketCode}
                                </div>
                              </div>
                              {winner.isCurrentUser && <Trophy size={18} className="text-orange-500" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-400 py-2 italic bg-gray-50 rounded-xl">
                          Results pending...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}