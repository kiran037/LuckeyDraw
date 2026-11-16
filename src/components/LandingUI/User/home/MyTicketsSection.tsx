'use client';

import Link from 'next/link';
import { Ticket as TicketIcon, Calendar, Trophy, ArrowRight, QrCode } from 'lucide-react';
import { Ticket } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-helper';

interface ExtendedTicket extends Omit<Ticket, 'draw'> {
  draw: {
    id: string;
    title: string;
    status: string;
    bannerImage: string | null;
    endTime: string;
    resultAt?: string;
    productImage?: string | null;
  } | null;
}

export default function MyTicketsSection({ tickets }: { tickets: ExtendedTicket[] }) {
  if (tickets.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-5 bg-primary rounded-full shadow-xs" />
            My Active Tickets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Participating in live & upcoming draws
          </p>
        </div>
        <Link
          href="/user/tickets"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          View All ({tickets.length}) <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.slice(0, 3).map((ticket) => {
          const isWinner = ticket.isWinner;
          const bgImage = ticket.draw?.bannerImage || ticket.draw?.productImage;

          return (
            <Link
              href={`/user/tickets/${ticket.id}`}
              key={ticket.id}
              className="group block relative w-full"
            >
              <div
                className={`relative w-full h-32 sm:h-36 flex rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isWinner
                    ? 'shadow-lg shadow-amber-500/20 border border-amber-400/50'
                    : 'shadow-xs hover:shadow-md border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                {/* LEFT MAIN TICKET BODY */}
                <div className="relative flex-[0.72] bg-white dark:bg-[#0F1626] border-y border-l border-slate-200/80 dark:border-white/[0.08] rounded-l-2xl overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    {bgImage ? (
                      <img
                        src={getImageUrl(bgImage)}
                        alt=""
                        className="w-full h-full object-cover opacity-15 dark:opacity-25"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#0F1626] via-white/90 dark:via-[#0F1626]/90 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-3.5 sm:p-4 flex flex-col justify-between h-full">
                    <div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5 ${
                          isWinner
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 border border-primary/20'
                        }`}
                      >
                        {isWinner ? (
                          <>
                            <Trophy size={10} /> WINNER
                          </>
                        ) : (
                          ticket.status
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                        {ticket.draw?.title || 'Contest Raffle Ticket'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <TicketIcon size={12} className="text-primary" />
                        <span className="font-mono">1 Entry</span>
                      </div>
                      <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-primary" />
                        <span>{formatDate(ticket.draw?.endTime || '')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NOTCH SEPARATOR */}
                <div className="relative w-[1px] bg-white dark:bg-[#0F1626] flex flex-col justify-between py-2">
                  <div className="absolute inset-y-2 left-0 w-[2px] border-l-2 border-dashed border-slate-300 dark:border-slate-700 z-20" />
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#090D16] z-30 border border-slate-200/80 dark:border-white/[0.08]" />
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#090D16] z-30 border border-slate-200/80 dark:border-white/[0.08]" />
                </div>

                {/* RIGHT TICKET STUB */}
                <div
                  className={`relative flex-[0.28] bg-slate-50 dark:bg-[#121B2E] border-y border-r border-slate-200/80 dark:border-white/[0.08] rounded-r-2xl flex flex-col items-center justify-center p-2 text-center ${
                    isWinner ? 'bg-amber-500/10 dark:bg-amber-500/15' : ''
                  }`}
                >
                  <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">
                    CODE
                  </span>
                  <p className="text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider">
                    {ticket.ticketCode.slice(-6)}
                  </p>
                  <div className="mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <QrCode size={26} className="text-slate-800 dark:text-slate-200 mx-auto" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
