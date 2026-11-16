'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Ticket, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Sparkles, label: 'Draws', href: '/user/draws' },
    { icon: Ticket, label: 'Tickets', href: '/user/tickets' },
    { icon: Trophy, label: 'Winners', href: '/user/winners' },
    { icon: User, label: 'Profile', href: '/user/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Native App-Style Blur Dock with Safe Area */}
      <nav className="relative bg-white/85 dark:bg-[#090D16]/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] px-3 pt-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] select-none transition-colors group"
              >
                <div className="relative">
                  {/* Subtle active background glow */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavPill"
                      className="absolute -inset-1.5 rounded-full bg-primary/10 dark:bg-primary/20 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={`transition-all duration-200 ${
                      isActive
                        ? 'text-primary scale-110'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] tracking-tight mt-1 transition-all duration-200 font-medium ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Micro-Indicator Dot */}
                {isActive && (
                  <motion.span
                    layoutId="bottomNavDot"
                    className="w-1 h-1 rounded-full bg-primary mt-0.5"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
