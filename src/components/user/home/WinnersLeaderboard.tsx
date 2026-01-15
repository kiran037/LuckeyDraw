'use client';

import { Trophy, Crown, Medal, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Winner {
  id: string;
  userName: string;
  userAvatar: string | null;
  drawTitle: string;
  productName: string;
  declaredAt: string;
}

// FIX: Make 'winners' optional and provide a default value of []
export default function WinnersLeaderboard({ winners = [] }: { winners?: Winner[] }) {
  if (!winners || winners.length === 0) return null;

  // Split Top 3 and Rest
  const topThree = winners.slice(0, 3);
  const runnersUp = winners.slice(3);

  // Helper to reorder for visual podium (2nd, 1st, 3rd)
  // If we have index 0, 1, 2 -> we want to render 1, 0, 2 visually
  // The .filter(Boolean) removes undefined slots if we have fewer than 3 winners
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Trophy size={20} className="text-yellow-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white leading-none">Hall of Fame</h2>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Top winners this week</p>
            </div>
        </div>
      </div>

      {/* 1. THE PODIUM SECTION (Top 3) */}
      <div className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-[#151925]/0 to-[#151925]/50 rounded-3xl border border-white/5">
        
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex justify-center items-end gap-2 sm:gap-6 relative z-10">
          {podiumOrder.map((winner, i) => {
            // Determine real rank based on visual position
            // Visual order is [2nd, 1st, 3rd]
            
            const isFirst = winner.id === topThree[0].id;
            // Check existence before accessing id to prevent errors if array is sparse
            const isSecond = topThree[1] && winner.id === topThree[1].id;
            const isThird = topThree[2] && winner.id === topThree[2].id;

            let rank = 0;
            let colorClass = '';
            let heightClass = '';
            let avatarSize = '';
            let glow = '';

            if (isFirst) {
                rank = 1;
                colorClass = 'from-yellow-300 via-yellow-500 to-amber-600';
                heightClass = 'mb-6 scale-110 z-20'; // Higher & Larger
                avatarSize = 'w-20 h-20 sm:w-24 sm:h-24';
                glow = 'shadow-[0_0_30px_rgba(234,179,8,0.4)]';
            } else if (isSecond) {
                rank = 2;
                colorClass = 'from-slate-300 via-slate-400 to-slate-500'; // Silver
                heightClass = 'mb-0 z-10';
                avatarSize = 'w-14 h-14 sm:w-16 sm:h-16';
                glow = 'shadow-[0_0_20px_rgba(148,163,184,0.3)]';
            } else {
                rank = 3;
                colorClass = 'from-orange-300 via-orange-500 to-orange-700'; // Bronze
                heightClass = 'mb-0 z-10';
                avatarSize = 'w-14 h-14 sm:w-16 sm:h-16';
                glow = 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';
            }

            return (
              <div key={winner.id} className={`flex flex-col items-center text-center transition-all duration-500 ${heightClass}`}>
                
                {/* Crown for 1st Place */}
                {isFirst && (
                    <div className="mb-2 animate-bounce duration-[2000ms]">
                        <Crown size={24} className="text-yellow-400 fill-yellow-400" />
                    </div>
                )}

                {/* Avatar Container */}
                <div className="relative group">
                    {/* Ring Gradient */}
                    <div className={`absolute -inset-[3px] rounded-full bg-gradient-to-tr ${colorClass} ${glow} opacity-80`} />
                    
                    {/* The Avatar */}
                    <div className={`${avatarSize} rounded-full border-4 border-[#0B0E14] bg-[#1A1F2E] overflow-hidden relative`}>
                        {winner.userAvatar ? (
                            <img src={winner.userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-white bg-white/10 text-xl">
                                {winner.userName.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Rank Badge Circle */}
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center border-2 border-[#0B0E14] text-[#0B0E14] font-black text-xs sm:text-sm shadow-lg`}>
                        {rank}
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 max-w-[90px] sm:max-w-[120px]">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                        {winner.userName}
                    </h3>
                    <p className={`text-[10px] sm:text-xs font-medium truncate mt-0.5 ${isFirst ? 'text-yellow-400' : 'text-purple-400'}`}>
                        {winner.productName}
                    </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. THE LIST SECTION (Runners Up) */}
      {runnersUp.length > 0 && (
        <div className="bg-[#151925]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden flex flex-col divide-y divide-white/5">
          {runnersUp.map((winner, index) => (
            <div 
                key={winner.id} 
                className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors"
            >
                {/* Rank Number */}
                <div className="w-8 flex justify-center">
                    <span className="text-sm font-bold text-gray-500 font-mono">#{index + 4}</span>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#1A1F2E] border border-white/10 overflow-hidden flex-shrink-0">
                    {winner.userAvatar ? (
                        <img src={winner.userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                            {winner.userName.charAt(0)}
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-200 truncate">{winner.userName}</h4>
                        <span className="text-[10px] text-gray-500">{formatDate(winner.declaredAt)}</span>
                    </div>
                    <p className="text-xs text-purple-400 truncate">
                        Won {winner.productName}
                    </p>
                </div>
            </div>
          ))}
          
          {/* View All Button (Optional visual filler) */}
          <button className="w-full py-3 text-center text-xs font-bold text-gray-500 hover:text-white transition-colors bg-white/0 hover:bg-white/5">
            View All Winners
          </button>
        </div>
      )}
    </div>
  );
}