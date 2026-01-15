// src/components/ClientUI/Header.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Wallet, Sparkles } from 'lucide-react'; // Removed unused imports
import { api } from '@/lib/api-client';

interface HeaderUser {
  id: string;
  name?: string | null; // Mark as optional to prevent TypeScript assumptions
  avatar?: string | null;
  balance?: number; 
}

export default function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<HeaderUser>('/me'); // Ensure your API route exists
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      } finally {
        setLoading(false);
      }
    };
    void fetchUser();
  }, []);

  // Helper to ensure we always have a string to work with
  const getSafeName = () => user?.name || "User";

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Glass Background with gradient border bottom */}
      <div className="absolute inset-0 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5" />
      
      {/* Subtle bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* LEFT: Logo Area */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            
            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none group-hover:text-purple-100 transition-colors">
                SAWA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">RIYA</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                Luckey Draw
              </span>
            </div>
          </Link>

          {/* RIGHT: User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {loading ? (
              // Loading Skeleton
              <div className="flex items-center gap-2">
                <div className="w-20 h-8 bg-white/5 rounded-full animate-pulse" />
                <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
              </div>
            ) : user ? (
              <>
                {/* 1. Wallet Pill (Hidden on tiny screens, visible on mobile+) */}
                <div className="hidden min-[380px]:flex items-center gap-2 bg-[#151925] border border-white/5 rounded-full px-3 py-1.5 hover:border-purple-500/30 transition-colors cursor-pointer group/wallet">
                  <div className="p-1 bg-green-500/10 rounded-full">
                    <Wallet size={14} className="text-green-400" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[9px] text-gray-400 font-bold uppercase group-hover/wallet:text-purple-400 transition-colors">Balance</span>
                    <span className="text-xs font-bold text-white">₹ {user.balance?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>

                {/* 2. Notification */}
                <Link
                  href="/user/notifications"
                  className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
                >
                  <Bell size={18} className="text-gray-300" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0B0E14] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                </Link>

                {/* 3. User Profile Chip */}
                <Link
                  href="/user/profile"
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#151925] border border-white/5 hover:border-white/20 transition-all hover:bg-[#1A1F2E]"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-[2px]" />
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={getSafeName()}
                        className="relative w-8 h-8 rounded-full object-cover border-2 border-[#151925]"
                      />
                    ) : (
                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-[#151925]">
                        {/* FIX: Use helper function or fallback string before charAt */}
                        <span className="text-xs font-bold text-white">
                          {getSafeName().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Name - Visible now on mobile, styled nicely */}
                  <span className="text-xs font-bold text-white max-w-[80px] truncate">
                    {/* FIX: Ensure split works on a string, even if name is null */}
                    {getSafeName().split(' ')[0]}
                  </span>
                </Link>
              </>
            ) : (
              // Logged Out State
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="hidden sm:block text-sm font-bold text-gray-400 hover:text-white transition-colors px-2"
                >
                  Login
                </Link>
                
                {/* Shiny Register Button */}
                <Link
                  href="/sigin"
                  className="relative group overflow-hidden rounded-full p-[1px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-70 group-hover:opacity-100 transition-opacity blur-[2px]" />
                  <div className="relative bg-[#0B0E14] hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-pink-900/40 rounded-full px-5 py-2 transition-all flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-purple-100">Get Started</span>
                    <Sparkles size={12} className="text-purple-400 group-hover:text-white" />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}