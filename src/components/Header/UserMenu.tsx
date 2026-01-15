'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client'; 

// 1. Update Interface to include 'role'
interface HeaderUser {
  id: string;
  name?: string | null;
  avatar?: string | null;
  role?: string; // Added role here
}

interface UserMenuProps {
  user: HeaderUser;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const safeName = user.name || "User";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout', {});
      router.push('/signin');
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- Trigger Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:pl-1 sm:pr-3 sm:py-1 rounded-full bg-gray-100 dark:bg-[#151925] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all active:scale-95"
      >
        <div className="relative w-8 h-8 sm:w-9 sm:h-9">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={safeName}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#151925] shadow-sm"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white dark:border-[#151925] shadow-sm">
              <span className="text-xs font-bold text-white uppercase">
                {safeName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Name - Hidden on Mobile */}
        <span className="hidden sm:block text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
          {safeName}
        </span>
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-52 bg-white/80 dark:bg-[#151925]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            
            {/* 2. Admin Button (Conditionally Rendered) */}
            {user.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-xl transition-colors mb-1"
              >
                <ShieldCheck size={16} />
                Admin Panel
              </Link>
            )}

            <Link
              href="/user/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <User size={16} />
              Profile
            </Link>
            
            <button
              onClick={() => {
                setIsOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* --- Logout Modal --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white dark:bg-[#1A1F2E] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/5 scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sign out?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Are you sure you want to log out of your account?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                  {isLoggingOut ? <Loader2 className="animate-spin w-4 h-4" /> : "Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}