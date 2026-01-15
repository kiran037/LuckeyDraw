'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import EmptyState from '@/components/UserUI/EmptyState';
import StatusBadge from '@/components/UserUI/StatusBadge';
import { 
  Ticket as TicketIcon, Calendar, ChevronLeft, Search, 
  Trophy, ArrowRight, LucideIcon 
} from 'lucide-react';

// --- Types & Interfaces ---

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

interface ChromeButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

type FilterType = 'ALL' | 'WINNER' | 'ACTIVE';

// --- Visual Components ---

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 pointer-events-none select-none bg-[#09090b]">
    <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
  </div>
);

const ChromeButton = ({ icon: Icon, onClick, active }: ChromeButtonProps) => (
  <button 
    onClick={onClick}
    className={`
      relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
      border border-white/10 active:scale-95 shadow-lg
      ${active ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-[#151925] text-gray-400 hover:text-white'}
    `}
  >
    <Icon size={18} />
  </button>
);

const SearchInput = ({ value, onChange }: SearchInputProps) => (
  <div className="relative flex-1 group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
      <Search size={16} />
    </div>
    <input
      type="text"
      placeholder="Search ticket code or draw..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full bg-[#151925] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white 
        placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-[#1a1f2e]
        shadow-inner transition-all duration-300
      "
    />
  </div>
);

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    // FIX: Safety check to ensure tickets is an array before filtering
    if (!Array.isArray(tickets)) return;

    let result = [...tickets];

    // 1. Filter by Status
    if (filter === 'WINNER') result = result.filter(t => t.isWinner);
    if (filter === 'ACTIVE') result = result.filter(t => t.status === 'ACTIVE');

    // 2. Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => 
        t.ticketCode.toLowerCase().includes(q) || 
        t.draw.title.toLowerCase().includes(q)
      );
    }

    setFilteredTickets(result);
  }, [search, filter, tickets]);

  async function loadTickets() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Ticket[]>('/user/tickets');
      
      if (!response.success) {
          setError(typeof response.error === 'string' ? response.error : 'Failed to load tickets');
      } else {
        // FIX: Ensure response.data is actually an array before setting state
        // If the API returns an object or null, fallback to empty array
        const validTickets = Array.isArray(response.data) ? response.data : [];
        setTickets(validTickets);
        setFilteredTickets(validTickets);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorState message={error} onRetry={loadTickets} />;

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white pb-24 font-sans overflow-x-hidden">
      <BackgroundGlow />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* === HEADER === */}
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-4">
               <ChromeButton icon={ChevronLeft} onClick={() => router.back()} />
               <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">My Tickets</h1>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Total Entries: <span className="text-purple-400">{Array.isArray(tickets) ? tickets.length : 0}</span>
                  </p>
               </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-[#151925]/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                <SearchInput value={search} onChange={setSearch} />
                
                <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                    {(['ALL', 'ACTIVE', 'WINNER'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`
                          px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                          ${filter === f 
                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'}
                        `}
                      >
                        {f}
                      </button>
                    ))}
                </div>
            </div>
        </div>

        {/* === CONTENT === */}
        {/* FIX: Check Array.isArray(filteredTickets) to prevent .map crash */}
        {!Array.isArray(filteredTickets) || filteredTickets.length === 0 ? (
          <EmptyState
            icon={<TicketIcon size={40} className="text-gray-600" />}
            title={search ? "No matches found" : "No Tickets Yet"}
            description={search ? "Try searching for a different ID or draw name." : "You haven't purchased any tickets yet. Join a draw to get started!"}
            action={!search ? {
              label: 'Browse Active Draws',
              onClick: () => router.push('/user/draws'),
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  group relative h-48 rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300
                  ${ticket.isWinner 
                    ? 'bg-gradient-to-br from-yellow-900/20 to-[#151925] border-yellow-500/30 shadow-[0_0_30px_-5px_rgba(234,179,8,0.15)]' 
                    : 'bg-[#151925] border-white/5 hover:border-purple-500/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]'}
                  border
                `}
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-50" />
                
                {ticket.isWinner && (
                  <div className="absolute top-4 right-4 animate-bounce">
                    <Trophy size={24} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                  </div>
                )}

                {/* Top Section */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ticket ID</span>
                     {!ticket.isWinner && <TicketIcon size={18} className="text-gray-600 group-hover:text-purple-400 transition-colors" />}
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight group-hover:tracking-normal transition-all">
                    {ticket.ticketCode}
                  </div>
                </div>

                {/* Middle - Dashed Line */}
                <div className="relative w-full border-t border-dashed border-white/10 my-2">
                   <div className="absolute -left-8 -top-3 w-6 h-6 bg-[#09090b] rounded-full" />
                   <div className="absolute -right-8 -top-3 w-6 h-6 bg-[#09090b] rounded-full" />
                </div>

                {/* Bottom Section */}
                <div className="relative z-10">
                   <h3 className="font-bold text-white text-sm mb-3 truncate pr-4">{ticket.draw.title}</h3>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                         <StatusBadge type="draw" status={ticket.draw.status} />
                         {ticket.isWinner && (
                           <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                             Winner
                           </span>
                         )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                         {ticket.payment && (
                           <>
                             <span>{formatCurrency(ticket.payment.amount)}</span>
                             <div className="w-1 h-1 bg-gray-600 rounded-full" />
                           </>
                         )}
                         <Calendar size={12} />
                         <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                   </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight size={20} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}