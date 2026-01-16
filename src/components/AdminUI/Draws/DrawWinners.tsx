"use client";

import { useEffect, useState } from "react";
import { Trophy, User, Ticket } from "lucide-react";
import { Card } from "@/components/AdminUI/ui/Card";

interface Winner {
  id: string;
  user: { name: string; email: string };
  ticket: { ticketCode: string };
  drawproduct: { name: string; image: string | null };
}

export default function DrawWinners({ drawId }: { drawId: string }) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/draws/${drawId}/winners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.winners) setWinners(data.winners);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [drawId]);

  if (loading) return <div className="p-4 text-sm text-zinc-500">Loading winners...</div>;
  if (winners.length === 0) return null;

  return (
    <Card title="🏆 Official Winners" className="border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-900/10">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {winners.map((w) => (
          <div key={w.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{w.drawproduct.name}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3"/> {w.user.name}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
               <span className="flex items-center gap-1 text-sm font-mono font-medium text-zinc-700 dark:text-zinc-300">
                 <Ticket className="w-3 h-3" /> {w.ticket.ticketCode}
               </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}