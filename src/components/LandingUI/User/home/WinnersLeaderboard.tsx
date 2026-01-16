

import { Trophy, Crown } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-helper';

interface Winner {
  id: string;
  userName: string;
  userAvatar: string | null;
  drawTitle: string;
  productName: string;
  declaredAt: string;
}

export default function WinnersLeaderboard({ winners = [] }: { winners?: Winner[] }) {
  if (!winners || winners.length === 0) return null;

  const topThree = winners.slice(0, 3);
  const runnersUp = winners.slice(3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 dark:bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground leading-none">Hall of Fame</h2>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">Top winners this week</p>
          </div>
        </div>
      </div>

      {/* Podium Section */}
      <div className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-muted/0 to-muted/50 rounded-3xl border border-border">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex justify-center items-end gap-2 sm:gap-6 relative z-10">
          {podiumOrder.map((winner) => {
            const isFirst = winner.id === topThree[0]?.id;
            const isSecond = topThree[1] && winner.id === topThree[1].id;

            let rank = 3;
            let colorClass = 'from-orange-300 via-orange-500 to-orange-700';
            let heightClass = 'mb-0 z-10';
            let avatarSize = 'w-14 h-14 sm:w-16 sm:h-16';
            let glow = 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';

            if (isFirst) {
              rank = 1;
              colorClass = 'from-yellow-300 via-yellow-500 to-amber-600';
              heightClass = 'mb-6 scale-110 z-20';
              avatarSize = 'w-20 h-20 sm:w-24 sm:h-24';
              glow = 'shadow-[0_0_30px_rgba(234,179,8,0.4)]';
            } else if (isSecond) {
              rank = 2;
              colorClass = 'from-slate-300 via-slate-400 to-slate-500';
              heightClass = 'mb-0 z-10';
              avatarSize = 'w-14 h-14 sm:w-16 sm:h-16';
              glow = 'shadow-[0_0_20px_rgba(148,163,184,0.3)]';
            }

            return (
              <div key={winner.id} className={cn("flex flex-col items-center text-center transition-all duration-500", heightClass)}>
                
                {/* Crown for 1st Place */}
                {isFirst && (
                  <div className="mb-2 animate-bounce">
                    <Crown size={24} className="text-yellow-400 fill-yellow-400" />
                  </div>
                )}

                {/* Avatar Container */}
                <div className="relative group">
                  {/* Ring Gradient */}
                  <div className={cn("absolute -inset-[3px] rounded-full bg-gradient-to-tr opacity-80", colorClass, glow)} />
                  
                  {/* The Avatar */}
                  <div className={cn("rounded-full border-4 border-background bg-card overflow-hidden relative", avatarSize)}>
                    {winner.userAvatar ? (
                      <img src={getImageUrl(winner.userAvatar)} alt={winner.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-foreground bg-muted text-xl">
                        {winner.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Rank Badge */}
                  <div className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br flex items-center justify-center border-2 border-background font-black text-xs sm:text-sm shadow-lg",
                    colorClass
                  )}>
                    <span className="text-background dark:text-black">{rank}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 max-w-[90px] sm:max-w-[120px]">
                  <h3 className="font-bold text-foreground text-xs sm:text-sm truncate">
                    {winner.userName}
                  </h3>
                  <p className={cn(
                    "text-[10px] sm:text-xs font-medium truncate mt-0.5",
                    isFirst ? "text-yellow-500" : "text-primary"
                  )}>
                    {winner.productName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Runners Up List */}
      {runnersUp.length > 0 && (
        <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border overflow-hidden flex flex-col divide-y divide-border">
          {runnersUp.map((winner, index) => (
            <div key={winner.id} className="flex items-center gap-4 p-3 hover:bg-accent/50 transition-colors">
              {/* Rank Number */}
              <div className="w-8 flex justify-center">
                <span className="text-sm font-bold text-muted-foreground font-mono">#{index + 4}</span>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                {winner.userAvatar ? (
                  <img src={getImageUrl(winner.userAvatar)} alt={winner.userName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {winner.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-foreground truncate">{winner.userName}</h4>
                  <span className="text-[10px] text-muted-foreground ml-2">{formatDate(winner.declaredAt)}</span>
                </div>
                <p className="text-xs text-primary truncate">
                  Won {winner.productName}
                </p>
              </div>
            </div>
          ))}
          
          <button className="w-full py-3 text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors hover:bg-accent/50">
            View All Winners
          </button>
        </div>
      )}
    </div>
  );
}
