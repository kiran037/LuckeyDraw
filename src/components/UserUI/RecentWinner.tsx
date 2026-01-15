'use client';

import { Trophy } from 'lucide-react';

interface Winner {
  name: string;
  prize: string;
  avatar?: string;
  drawTitle: string;
  winDate: string;
}

interface RecentWinnerProps {
  winner: Winner;
}

export default function RecentWinner({ winner }: RecentWinnerProps) {
  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
      {/* Avatar Section */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-100 to-orange-100 p-0.5">
          {winner.avatar ? (
            <img src={winner.avatar} alt={winner.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-orange-600 font-bold text-lg">
              {winner.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-white ring-2 ring-white">
          <Trophy size={10} fill="currentColor" />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-sm truncate">{winner.name}</h4>
        <p className="text-xs text-purple-600 font-medium truncate">Won: {winner.prize}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{winner.drawTitle} • {winner.winDate}</p>
      </div>
    </div>
  );
}