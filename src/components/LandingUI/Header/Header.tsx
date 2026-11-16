'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles, Wallet } from 'lucide-react';
import { api } from '@/lib/api-client';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

interface HeaderUser {
  id: string;
  name?: string | null;
  avatar?: string | null;
  wallet?: number;
  unreadCount: number;
}

export default function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<HeaderUser>('/me');
        if (response.success && response.data) {
          setUser(response.data); // ✅ NO ERROR
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/70 dark:bg-[#0B0E14]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                SAWA
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  RIYA
                </span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase">
                Lucky Draw
              </span>
            </div>
          </Link>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            <ThemeToggle />

            {loading ? (
              <div className="w-9 h-9 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse" />
            ) : user ? (
              <>
                {/* WALLET BALANCE */}
                <Link
                  href="/user/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full
                             bg-emerald-50 dark:bg-emerald-900/20
                             text-emerald-700 dark:text-emerald-300
                             border border-emerald-200 dark:border-emerald-500/20
                             hover:shadow-sm transition"
                >
                  <Wallet size={14} />
                  <span className="text-xs font-bold">
                    ₹{user.wallet ?? 0}
                  </span>
                </Link>

                {/* NOTIFICATIONS */}
                <Link
                  href="/user/notifications"
                  className="relative group w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
             rounded-full bg-gray-100 dark:bg-white/5
             text-gray-600 dark:text-gray-300
             hover:bg-white hover:shadow-md dark:hover:bg-white/10 transition-all"
                >
                  <Bell size={18} />

                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0B0E14] shadow" >
                    {user.unreadCount > 99 ? '99+' : user.unreadCount || 0}
                  </span>
                </Link>

                {/* USER MENU */}
                <UserMenu user={user} />
              </>
            ) : (
              /* LOGGED OUT */
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/signin"
                  className="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  Login
                </Link>

                <Link href="/signin" className="relative overflow-hidden rounded-full group">
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100" />
                  <div className="relative flex items-center gap-2 px-5 py-2">
                    <span className="text-xs font-bold text-white">Get Started</span>
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
