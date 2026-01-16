

// src/components/user/home/MyTicketsSection.tsx
'use client';

import Link from 'next/link';
import { Ticket as TicketIcon, Calendar, Trophy, ArrowRight, QrCode } from 'lucide-react';
import { Ticket } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// We need to extend the type locally to match the new API response
// until you update your global types file.
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
      <div className="flex justify-between items-end mb-5 px-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="w-1.5 h-5 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
           My Tickets
        </h2>
        <Link 
          href="/user/tickets" 
          className="text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {tickets.slice(0, 3).map((ticket) => {
          const isWinner = ticket.isWinner;
          const bgImage = ticket.draw?.bannerImage || ticket.draw?.productImage;

          return (
            <Link href={`/user/tickets/${ticket.id}`} key={ticket.id} className="group block relative w-full">
               
               {/* 
                  TICKET CONTAINER 
                  Using CSS Masking Logic via pseudo elements for the "Notches"
               */}
               <div className={`
                 relative w-full h-32 sm:h-36 flex rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1
                 ${isWinner 
                    ? 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                    : 'shadow-[0_4px_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_25px_rgba(168,85,247,0.25)]'}
               `}>
                 
                 {/* ================= LEFT SIDE (MAIN) ================= */}
                 <div className="relative flex-[0.7] sm:flex-[0.75] bg-[#1A1F2E] border-y border-l border-white/5 rounded-l-2xl overflow-hidden">
                    
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        {bgImage ? (
                            <img src={bgImage} alt="" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1F2E] via-[#1A1F2E]/80 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between h-full">
                        <div>
                            {/* Status Badge */}
                            <div className={`
                                inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2
                                ${isWinner ? 'bg-yellow-500 text-black' : 'bg-white/10 text-purple-300 border border-purple-500/30'}
                            `}>
                                {isWinner ? <><Trophy size={10} /> WINNER</> : ticket.status}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-2 leading-tight">
                                {ticket.draw?.title || 'Unknown Draw'}
                            </h3>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                             <div className="flex items-center gap-1">
                                <TicketIcon size={12} className="text-purple-400" />
                                <span className="font-mono text-gray-300">x1</span>
                             </div>
                             <div className="h-3 w-[1px] bg-white/10" />
                             <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-purple-400" />
                                <span>{formatDate(ticket.draw?.endTime || '')}</span>
                             </div>
                        </div>
                    </div>

                    {/* DECORATION: "Admit One" Watermark */}
                    <div className="absolute -bottom-4 -right-2 transform -rotate-12 opacity-5 select-none pointer-events-none">
                        <span className="text-6xl font-black text-white">ADMIT ONE</span>
                    </div>
                 </div>

                 {/* ================= SEPARATOR (DASHED LINE) ================= */}
                 <div className="relative w-[1px] bg-[#1A1F2E] flex flex-col justify-between py-2">
                    {/* The Dashed Line */}
                    <div className="absolute inset-y-2 left-0 w-[2px] border-l-2 border-dashed border-gray-600/30 z-20" />
                    
                    {/* Top Notch (Cutout) */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#0B0E14] z-30 box-content border-b border-white/5" />
                    
                    {/* Bottom Notch (Cutout) */}
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#0B0E14] z-30 box-content border-t border-white/5" />
                 </div>

                 {/* ================= RIGHT SIDE (STUB) ================= */}
                 <div className={`
                    relative flex-[0.3] sm:flex-[0.25] bg-[#151925] border-y border-r border-white/5 rounded-r-2xl flex flex-col items-center justify-center p-2
                    ${isWinner ? 'bg-gradient-to-b from-yellow-900/10 to-transparent' : ''}
                 `}>
                    <div className="text-center space-y-1">
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Ticket No</span>
                        <p className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">
                            {ticket.ticketCode.slice(-6)}
                        </p>
                    </div>

                    {/* Barcode / QR Simulation */}
                    <div className="mt-2 sm:mt-3 opacity-50 group-hover:opacity-100 transition-opacity">
                        <QrCode size={32} className="text-white mx-auto" />
                    </div>
                    
                    {/* Hover Shine on Stub */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 </div>

               </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}