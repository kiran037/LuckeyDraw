"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import {
  Trophy,
  Calendar,
  Ticket,
  Crown,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getImageUrl } from "@/lib/image-helper";
import Image from "next/image";

// --- Interfaces ---

interface Winner {
  id: string;
  userName: string;
  userAvatar: string | null;
  maskedMobile: string;
  prizeName: string;
  prizeImage: string | null;
  drawTitle: string;
  ticketCode: string;
  wonAt: string;
}

interface WinnerData {
  winners: Winner[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// Helper Type for API Response
interface PageApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// --- Components ---

const WinnerCard = ({ winner, rank }: { winner: Winner; rank?: number }) => {
  const isTopWinner = rank === 0;

  return (
    <div
      className={`
      relative group overflow-hidden rounded-[24px] sm:rounded-[32px] border transition-all duration-500
      ${
        isTopWinner
          ? "col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-[#1a1500] dark:to-[#0f0f12] border-yellow-500/30 shadow-[0_0_30px_-5px_rgba(234,179,8,0.15)]"
          : "bg-white dark:bg-[#151925] border-gray-100 dark:border-white/5 hover:border-purple-500/30 hover:shadow-xl hover:-translate-y-1"
      }
    `}
    >
      {/* Glow Effects (Top Winner Only) */}
      {isTopWinner && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      )}

      <div
        className={`flex flex-col ${
          isTopWinner ? "md:flex-row items-center gap-6 md:gap-10" : ""
        } p-5 sm:p-6 h-full relative z-10`}
      >
        {/* Prize Image Area */}
        <div
          className={`
          relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#0a0c10] border border-gray-100 dark:border-white/5 flex-shrink-0
          ${
            isTopWinner
              ? "w-full md:w-72 h-64 md:h-72 shadow-2xl"
              : "w-full h-48 mb-4"
          }
        `}
        >
          {winner.prizeImage ? (
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={getImageUrl(winner.prizeImage)}
                alt={winner.prizeName}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <Trophy
                className="text-gray-300 dark:text-gray-700"
                size={isTopWinner ? 64 : 32}
              />
            </div>
          )}

          {/* Ticket Badge */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Ticket
              size={12}
              className="text-purple-600 dark:text-purple-400"
            />
            <span className="text-xs font-mono font-bold text-gray-900 dark:text-white tracking-widest">
              {winner.ticketCode}
            </span>
          </div>
        </div>

        {/* Info Content */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`
                relative flex-shrink-0 
                ${
                  isTopWinner
                    ? "w-14 h-14 sm:w-16 sm:h-16"
                    : "w-10 h-10 sm:w-12 sm:h-12"
                } 
                rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-blue-500
             `}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-[#12151d]">
                <Image
                  src={getImageUrl(winner.userAvatar)}
                  alt={winner.userName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              {isTopWinner && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black p-1.5 rounded-full shadow-lg animate-bounce">
                  <Crown size={14} fill="currentColor" />
                </div>
              )}
            </div>
            <div>
              <h3
                className={`font-bold text-gray-900 dark:text-white ${
                  isTopWinner ? "text-lg sm:text-2xl" : "text-sm sm:text-base"
                }`}
              >
                {winner.userName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-wide">
                {winner.maskedMobile}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gray-100 dark:bg-white/5" />

          {/* Winning Details */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded">
                Won Prize
              </span>
            </div>
            <h2
              className={`font-black text-gray-900 dark:text-white leading-tight ${
                isTopWinner
                  ? "text-2xl sm:text-4xl mb-2"
                  : "text-lg line-clamp-1"
              }`}
            >
              {winner.prizeName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              in {winner.drawTitle}
            </p>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 pt-1 sm:pt-2 font-medium">
            <Calendar size={12} />
            <span>
              Declared on{" "}
              {new Date(winner.wonAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function WinnersPage() {
  const [data, setData] = useState<WinnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWinners() {
      try {
        const res = (await api.get(
          "/user/winners?limit=12"
        )) as unknown as PageApiResponse<WinnerData>;

        if (isMounted) {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setError(res.message || res.error || "Failed to load winners");
          }
        }
      } catch {
        if (isMounted) setError("An unexpected error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadWinners();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Loading Hall of Fame...
        </p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Oops! Something went wrong
        </h3>
        <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white pb-32 font-sans transition-colors duration-300 overflow-x-hidden">
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-purple-100 dark:to-gray-400 mb-3 tracking-tight">
              Hall of Fame
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Celebrating the lucky winners who turned their dreams into
              reality. Will you be next?
            </p>
          </div>

          {/* Total Winners Counter */}
          <div className="flex-shrink-0">
            <div className="bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center shadow-lg sm:shadow-none min-w-[120px]">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {data?.pagination?.total ?? 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-1">
                Total Winners
              </span>
            </div>
          </div>
        </div>

        {/* Winners Grid */}
        {!data?.winners || data.winners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-[#12151d]/50 rounded-[32px] border border-dashed border-gray-300 dark:border-white/10 text-center animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center text-gray-400 mb-5">
              <Trophy size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No winners yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Be the first one to win!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {data.winners.map((winner, index) => (
              <WinnerCard key={winner.id} winner={winner} rank={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
