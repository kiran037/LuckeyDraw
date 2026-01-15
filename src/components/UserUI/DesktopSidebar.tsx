'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Trophy, Bell, User, LogOut } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/user/draws', icon: Ticket, label: 'All Draws' },
  { href: '/user/tickets', icon: Ticket, label: 'My Tickets' }, // Using same icon, maybe distinct in real app
  { href: '/user/results', icon: Trophy, label: 'Results' },
  { href: '/user/profile', icon: User, label: 'Profile' },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-72 bg-gray-50/50 backdrop-blur-xl border-r border-gray-100 h-screen sticky top-0 p-6">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          LuckyApp
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-white text-purple-600 shadow-lg shadow-purple-100/50'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900'
              }`}
            >
              <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-purple-600 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <button className="flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 w-full transition-colors">
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}