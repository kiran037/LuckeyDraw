'use client';

import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Ticket as TicketIcon, Calendar, ChevronLeft, Search, 
  Trophy, ArrowRight, Loader2, RefreshCw, Filter, CheckCircle2 
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
  
  // 1. State Declarations
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  // 2. Define loadTickets function FIRST (using useCallback for stability)
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Ticket[]>('/user/tickets');
      
      if (!response.success) {
          setError(typeof response.message === 'string' ? response.message : 'Failed to load tickets');
      } else {
        // Ensure data is an array before setting
        const validTickets = Array.isArray(response.data) ? response.data : [];
        setTickets(validTickets);
        // We don't setFilteredTickets here immediately to avoid double-render; 
        // the filtering useEffect below will handle it when 'tickets' changes.
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. useEffect to fetch data (Now loadTickets is defined)
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // 4. Filtering Logic (Runs when tickets, search, or filter changes)
  useEffect(() => {
    if (!Array.isArray(tickets)) return;

    let result = [...tickets];

    // Filter by Status
    if (filter === 'WINNER') result = result.filter(t => t.isWinner);
    if (filter === 'ACTIVE') result = result.filter(t => t.status === 'ACTIVE');

    // Search
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading tickets...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <TicketIcon className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Oops! Something went wrong</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs">{error}</p>
        <button 
          onClick={loadTickets}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white pb-32 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block">
        <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* === HEADER === */}
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => router.back()}
                 className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[#151925] hover:bg-gray-200 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 transition-colors"
               >
                 <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
               </button>
               <div>
                  <h1 className="text-2xl font-black tracking-tight">My Tickets</h1>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Total Entries: <span className="text-purple-600 dark:text-purple-400">{Array.isArray(tickets) ? tickets.length : 0}</span>
                  </p>
               </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white/80 dark:bg-[#151925]/50 p-2 rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-md shadow-sm">
                {/* Search */}
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search ticket code or draw..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="
                        w-full bg-gray-100 dark:bg-[#151925] border border-transparent dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 
                        focus:outline-none focus:bg-white dark:focus:bg-[#0f1116] focus:border-purple-500/50 
                        transition-all duration-300
                      "
                    />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {(['ALL', 'ACTIVE', 'WINNER'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`
                          px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border
                          ${filter === f 
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg' 
                            : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-white/10'}
                        `}
                      >
                        {f}
                      </button>
                    ))}
                </div>
            </div>
        </div>

        {/* === CONTENT === */}
        {!Array.isArray(filteredTickets) || filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-[#151925]/30 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 text-center animate-in fade-in zoom-in">
             <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-4">
               {search ? <Search size={24} /> : <TicketIcon size={24} />}
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">
               {search ? "No matches found" : "No Tickets Yet"}
             </h3>
             <p className="text-sm text-gray-500 mt-2 max-w-[250px] mx-auto">
               {search ? "Try searching for a different ID or draw name." : "You haven't purchased any tickets yet. Join a draw to get started!"}
             </p>
             {!search && (
               <button 
                 onClick={() => router.push('/user/draws')}
                 className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-purple-500/20 active:scale-95"
               >
                 Browse Active Draws
               </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  group relative h-auto sm:h-48 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300
                  ${ticket.isWinner 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-[#151925] border-yellow-500/30 shadow-lg shadow-yellow-500/5' 
                    : 'bg-white dark:bg-[#151925] border-gray-200 dark:border-white/5 hover:border-purple-500/30 hover:shadow-xl hover:-translate-y-1'}
                  border
                `}
              >
                {/* Background Decor (Circles for "Punch Out" effect) */}
                <div className="absolute top-1/2 left-0 w-4 h-4 sm:w-6 sm:h-6 bg-gray-50 dark:bg-[#09090b] rounded-r-full -translate-y-1/2 border-r border-gray-200 dark:border-white/5" />
                <div className="absolute top-1/2 right-0 w-4 h-4 sm:w-6 sm:h-6 bg-gray-50 dark:bg-[#09090b] rounded-l-full -translate-y-1/2 border-l border-gray-200 dark:border-white/5" />
                
                {ticket.isWinner && (
                  <div className="absolute top-4 right-4 animate-bounce">
                    <Trophy size={20} className="text-yellow-500 dark:text-yellow-400 drop-shadow-sm" />
                  </div>
                )}

                {/* Top Section */}
                <div className="relative z-10 px-2 sm:px-0">
                  <div className="flex justify-between items-start mb-1.5">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</span>
                     {!ticket.isWinner && <TicketIcon size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />}
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover:tracking-normal transition-all">
                    {ticket.ticketCode}
                  </div>
                </div>

                {/* Middle - Dashed Line */}
                <div className="relative w-full border-t border-dashed border-gray-200 dark:border-white/10 my-3 sm:my-2" />

                {/* Bottom Section */}
                <div className="relative z-10 px-2 sm:px-0">
                   <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 truncate pr-4">{ticket.draw.title}</h3>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                         <span className={`
                           inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase
                           ${ticket.draw.status === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'}
                         `}>
                           {ticket.draw.status}
                         </span>
                         
                         {ticket.isWinner && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                             Winner
                           </span>
                         )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                         {ticket.payment && (
                           <>
                             <span className="font-semibold">{formatCurrency(ticket.payment.amount)}</span>
                             <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                           </>
                         )}
                         <Calendar size={12} />
                         <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                   </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
                    <ArrowRight size={20} className="text-purple-600 dark:text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}