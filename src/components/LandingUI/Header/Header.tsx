'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Sparkles, Wallet, Trophy, Flame } from 'lucide-react';
import { api } from '@/lib/api-client';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

interface HeaderUser {
  id: string;
  name?: string | null;
  avatar?: string | null;
  wallet?: number;
  unreadCount: number;
  role?: string;
}

export default function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const response = await api.get<HeaderUser>('/me');
        if (isMounted) {
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const navLinks = [
    { label: 'Live Draws', href: '/user/draws', icon: Flame },
    { label: 'Winners Hall', href: '/user/winners', icon: Trophy },
    { label: 'My Tickets', href: '/user/tickets' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Frosted Glass Backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-[#090D16]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] shadow-xs" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LEFT: Premium Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-purple-700 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Trophy size={20} className="text-white drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-1">
                Sawariya
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mt-0.5">
                Lucky Draw
              </span>
            </div>
          </Link>

          {/* CENTER: Desktop Main Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href.startsWith('/#')
                  ? false
                  : pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {link.icon && <link.icon size={15} className={isActive ? 'text-primary' : 'text-slate-400'} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {loading ? (
              <div className="w-9 h-9 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* WALLET CHIP */}
                <Link
                  href="/user/transaction/wallet"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full
                             bg-emerald-500/10 hover:bg-emerald-500/15
                             text-emerald-700 dark:text-emerald-300
                             border border-emerald-500/20
                             transition-all active:scale-95"
                  title="View Wallet Ledger"
                >
                  <Wallet size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold tracking-tight">
                    ₹{(user.wallet ?? 0).toLocaleString('en-IN')}
                  </span>
                </Link>

                {/* NOTIFICATIONS */}
                <Link
                  href="/user/notifications"
                  aria-label="Notifications"
                  className="relative group w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
                             rounded-full bg-slate-100 dark:bg-white/5
                             text-slate-600 dark:text-slate-300
                             hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  <Bell size={18} />
                  {user.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#090D16] shadow-sm animate-pulse">
                      {user.unreadCount > 99 ? '99+' : user.unreadCount}
                    </span>
                  )}
                </Link>

                {/* USER PROFILE MENU */}
                <UserMenu user={user} />
              </div>
            ) : (
              /* LOGGED OUT STATE */
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/signin"
                  className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors px-3 py-2"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-primary to-purple-600 p-[1px] shadow-sm hover:shadow-indigo-500/25 transition-shadow"
                >
                  <div className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold group-hover:bg-primary/95 transition-colors">
                    <span>Join Now</span>
                    <Sparkles size={14} className="text-amber-300" />
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
