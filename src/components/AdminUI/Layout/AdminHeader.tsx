"use client";

import { useTheme } from "next-themes";
import { 
  Moon, Sun, Bell, LogOut, Settings, User, 
  ChevronDown, Trophy 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoutModal from "./LogoutModal";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user: { name: string; email: string; avatar: string | null; role: string };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle click outside to close dropdown
  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <header className="h-16 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-50 px-6 flex items-center justify-between sticky top-0">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center">
            <Trophy size={16} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
              Sawariya
            </h1>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Admin Console
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
          >
            {mounted && (
              <>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            )}
            <span className="sr-only">Toggle theme</span>
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-zinc-900"></span>
          </button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-500 leading-none mt-1">
                  {user.role}
                </p>
              </div>
              <div className="relative w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700">
                 {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                 )}
              </div>
              <ChevronDown size={12} className="text-zinc-400 mr-1" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                
                <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <User size={16} />
                  Profile
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <Settings size={16} />
                  Settings
                </Link>
                
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}