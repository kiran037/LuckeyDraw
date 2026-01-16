"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Package, CreditCard, Ticket, Trophy,
  BarChart3
} from "lucide-react";

// Simplified menu items
const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, href: "/admin/dashboard" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Draws", icon: Trophy, href: "/admin/draws" },
  { label: "Payments", icon: CreditCard, href: "/admin/payments" },
  { label: "Tickets", icon: Ticket, href: "/admin/tickets" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-1">
        
        {/* Navigation Group */}
        <div className="mb-2 px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Main Menu
        </div>
        
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium" 
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }
                `}
              >
                <item.icon
                  size={18}
                  strokeWidth={2}
                  className={`
                    ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}
                  `}
                />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}

      </nav>
      
      {/* Footer / Version info (Optional) */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-400">v1.0.2 • Sawariya Admin</p>
      </div>
    </aside>
  );
}