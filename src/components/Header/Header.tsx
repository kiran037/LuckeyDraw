'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

interface HeaderUser {
  id: string;
  name?: string | null;
  avatar?: string | null;
  balance?: number;
}

export default function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<HeaderUser>('/me');
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

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* 
         GLASSMORPHISM BACKGROUND
         Light: White with blur and light gray border
         Dark: Deep blue/black with blur and subtle white border
      */}
      <div className="absolute inset-0 bg-white/70 dark:bg-[#0B0E14]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors duration-300" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* --- LEFT: Brand Logo --- */}
          <Link href="/" className="flex items-center gap-2 group select-none">
             {/* You can add a small SVG icon here if you want */}
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none transition-colors">
                SAWA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">RIYA</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase">
                Luckey Draw
              </span>
            </div>
          </Link>

          {/* --- RIGHT: Actions --- */}
          <div className="flex items-center gap-3">
            
            {/* 1. Theme Toggle (Always Visible) */}
            <ThemeToggle />

            {loading ? (
              // Loading Skeleton
              <div className="w-9 h-9 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse" />
            ) : user ? (
              <>
                {/* 2. Notification (Icon style) */}
                <Link
                  href="/user/notifications"
                  className="relative group w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white hover:shadow-md dark:hover:bg-white/10 transition-all"
                >
                  <Bell size={18} />
                  {/* Pulse Dot */}
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0B0E14] shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                </Link>

                {/* 3. User Menu (Pill on Desktop, Circle on Mobile) */}
                <UserMenu user={user} />
              </>
            ) : (
              // Logged Out State
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/signin"
                  className="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                
                {/* Call to Action Button */}
                <Link
                  href="/signin" // Fixed typo from 'sigin'
                  className="relative overflow-hidden rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex items-center gap-2 px-5 py-2">
                    <span className="text-xs font-bold text-white tracking-wide">Get Started</span>
                    <Sparkles size={12} className="text-white/90" />
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