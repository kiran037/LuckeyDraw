'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Ticket as TicketIcon, Calendar, ChevronLeft, Search, 
  Trophy, ArrowRight, Loader2, RefreshCw, Filter 
} from 'lucide-react';

// --- Types ---
interface Ticket {
  id: string;
  ticketCode: string;
  status: string;
  isWinner: boolean;
  createdAt: string;
  draw: {
    title: string;
    status: string;
    endTime: string;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

type FilterType = 'ALL' | 'WINNER' | 'ACTIVE';

export default function TicketsPage() {
  const router = useRouter();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Ticket[]>('/user/tickets');
      
      if (!response.success) {
        setError(typeof response.message === 'string' ? response.message : 'Failed to load tickets');
      } else {
        const validTickets = Array.isArray(response.data) ? response.data : [];
        setTickets(validTickets);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!Array.isArray(tickets)) return;

    let result = [...tickets];

    if (filter === 'WINNER') result = result.filter(t => t.isWinner);
    if (filter === 'ACTIVE') result = result.filter(t => t.status === 'ACTIVE');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => 
        t.ticketCode.toLowerCase().includes(q) || 
        t.draw.title.toLowerCase().includes(q)
      );
    }

    setFilteredTickets(result);
  }, [search, filter, tickets]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading tickets...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
          <TicketIcon className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{error}</p>
        <button 
          onClick={loadTickets}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0B0E14] text-gray-900 dark:text-white pb-24 sm:pb-32">
      
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block overflow-hidden">
        <div className="absolute top-[10%] left-[-15%] w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
        {/* === HEADER === */}
        <div className="mb-6 sm:mb-8">
          {/* Top Bar */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#151925] hover:bg-gray-100 dark:hover:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 transition-all active:scale-95"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">My Tickets</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                Total: <span className="text-purple-600 dark:text-purple-400">{Array.isArray(tickets) ? tickets.length : 0}</span> {tickets.length === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by ticket code or draw name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(['ALL', 'ACTIVE', 'WINNER'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' 
                      : 'bg-white dark:bg-[#151925] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1a1f2e] active:scale-95'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === CONTENT === */}
        {!Array.isArray(filteredTickets) || filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white/60 dark:bg-[#151925]/40 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10">
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
              {search ? <Search size={24} /> : <TicketIcon size={24} />}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
              {search ? "No matches found" : "No Tickets Yet"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[280px] px-4">
              {search ? "Try searching with a different keyword." : "Purchase tickets to participate in draws and win amazing prizes!"}
            </p>
            {!search && (
              <button 
                onClick={() => router.push('/user/draws')}
                className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Browse Draws
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                className={`group relative rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 border ${
                  ticket.isWinner 
                    ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 border-yellow-300 dark:border-yellow-500/30 shadow-lg hover:shadow-xl' 
                    : 'bg-white dark:bg-[#151925] border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-xl'
                }`}
              >
                {/* Decorative Circles */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 dark:bg-[#0B0E14] rounded-full -translate-y-1/2 border-r border-gray-200 dark:border-white/10" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 dark:bg-[#0B0E14] rounded-full -translate-y-1/2 border-l border-gray-200 dark:border-white/10" />
                
                {/* Winner Trophy */}
                {ticket.isWinner && (
                  <div className="absolute top-3 right-3">
                    <Trophy size={18} className="text-yellow-500 dark:text-yellow-400 animate-pulse" />
                  </div>
                )}

                {/* Ticket Code Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ticket</span>
                    {!ticket.isWinner && <TicketIcon size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />}
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {ticket.ticketCode}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full border-t border-dashed border-gray-300 dark:border-white/10 my-3" />

                {/* Draw Info */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 line-clamp-2 leading-snug pr-6">
                    {ticket.draw.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        ticket.draw.status === 'LIVE' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                      }`}>
                        {ticket.draw.status}
                      </span>
                      
                      {ticket.isWinner && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                          Winner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {ticket.payment && (
                        <>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(ticket.payment.amount)}</span>
                          <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </>
                      )}
                      <Calendar size={12} />
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}