// src/components/Navigation/ResponsiveNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Trophy, User, LayoutGrid } from 'lucide-react';

export default function ResponsiveNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutGrid, label: 'Draws', href: '/user/draws' },
    { icon: Ticket, label: 'Tickets', href: '/user/tickets' },
    { icon: Trophy, label: 'Winners', href: '/user/winners' },
    { icon: User, label: 'Profile', href: '/user/profile' },
  ];

  return (
    <div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:w-auto md:max-w-none">
      
      {/* THE FLOATING PILL CONTAINER */}
      <nav className="relative bg-white/80 dark:bg-[#151925]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] rounded-full md:rounded-3xl p-1.5 flex md:flex-col items-center justify-between md:justify-center md:gap-4">
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full md:rounded-2xl transition-all duration-300 ${isActive ? 'bg-purple-50 dark:bg-white/10 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              {/* Icon */}
              <Icon 
                size={22} 
                className={`transition-all duration-300 ${isActive ? 'text-purple-600 dark:text-white scale-110' : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} 
              />

              {/* Mobile Active Dot (Instagram Style) */}
              <span 
                className={`md:hidden absolute bottom-1.5 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-purple-600 dark:bg-white scale-100' : 'scale-0'}`} 
              />
              
              {/* Desktop Tooltip (Left Hover) */}
              <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-gray-900 dark:bg-white border border-gray-800 dark:border-white/10 rounded-lg text-xs font-bold text-white dark:text-black opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl z-50">
                {item.label}
                {/* Tooltip Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-[4px] border-b-[4px] border-r-[4px] border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-white" />
              </div>

            </Link>
          );
        })}
      </nav>
    </div>
  );
}