'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCircle2, Clock, ChevronLeft, Loader2, Inbox, RefreshCw, CheckCheck } from 'lucide-react';

// --- Types ---
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  
  // 1. State Declarations
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<{ notifications: Notification[]; unreadCount: number }>('/user/notifications');

      if (!response.success) {
        setError(response.message || 'Failed to load notifications');
      } else {
        setNotifications(response.data?.notifications || []);
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. useEffect calls the function AFTER it is defined
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 4. Action Handlers
  async function markAsRead(notificationId: string) {
    // Optimistic UI Update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // API Call
    await api.patch('/user/notifications', { notificationId });
  }

  async function markAllAsRead() {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    
    // Optimistic Update
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    // API Call
    await api.patch('/user/notifications', {});
    setMarkingAll(false);
  }

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Checking for updates...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Oops! Something went wrong</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs">{error}</p>
        <button 
          onClick={loadNotifications}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white pb-24 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none hidden dark:block">
        <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
        
        {/* === HEADER === */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 sticky top-4 z-20 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg sm:shadow-2xl transition-all">
          <div className="flex items-center gap-3 sm:gap-4">
             {/* Back Button */}
             <button 
               onClick={() => router.back()}
               className="
                 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                 bg-gray-100 dark:bg-[#151925] border border-gray-200 dark:border-white/10 
                 hover:bg-gray-200 dark:hover:bg-white/5 active:scale-95
               "
             >
               <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
             </button>
             
             <div>
                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">Notifications</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Updates & Alerts</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                disabled={markingAll}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                Mark all read
              </button>
            )}

            {/* Bell Icon with Badge */}
            <div className="relative">
              <div className="w-10 h-10 bg-gray-100 dark:bg-[#151925] rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-600 dark:text-purple-400 shadow-inner">
                <Bell size={20} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-[#09090b] shadow-sm animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile "Mark all read" (Visible only on small screens) */}
        {unreadCount > 0 && (
          <div className="flex sm:hidden justify-end mb-4 px-1">
             <button 
                onClick={markAllAsRead}
                disabled={markingAll}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 active:opacity-70"
              >
                {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                Mark all as read
              </button>
          </div>
        )}

        {/* === LIST CONTENT === */}
        {notifications.length === 0 ? (
          /* Empty State Inline */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-gray-100 dark:bg-[#151925] rounded-full flex items-center justify-center mb-4">
                <Inbox size={32} className="text-gray-400 dark:text-gray-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">All caught up!</h3>
             <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
               You don't have any notifications yet. We'll notify you about important updates!
             </p>
             <button 
               onClick={() => router.push('/user/draws')}
               className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-purple-500/20 active:scale-95"
             >
               Browse Draws
             </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 pb-10">
            {notifications.map((notification, index) => {
              const isUnread = !notification.isRead;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => isUnread && markAsRead(notification.id)}
                  className={`
                    group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                    animate-in slide-in-from-bottom-2 fade-in
                    ${isUnread
                      ? 'bg-white dark:bg-[#151925] border-purple-200 dark:border-purple-500/30 shadow-lg shadow-purple-500/5 dark:shadow-[0_4px_20px_-5px_rgba(168,85,247,0.15)]'
                      : 'bg-white/50 dark:bg-[#0f1116] border-gray-100 dark:border-white/5 opacity-80 hover:opacity-100 hover:bg-white dark:hover:bg-[#151925]'}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Unread Glow Indicator (Dark Mode Only) */}
                  {isUnread && (
                    <div className="hidden dark:block absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-[100px] blur-xl pointer-events-none" />
                  )}

                  <div className="flex gap-3 sm:gap-4 relative z-10">
                    {/* Icon Box */}
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors
                      ${isUnread 
                        ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20' 
                        : 'bg-gray-100 dark:bg-[#1a1e29] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/5'}
                    `}>
                      {isUnread ? <Bell size={18} className="sm:w-5 sm:h-5 animate-pulse" /> : <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-bold text-xs sm:text-sm mb-1 truncate pr-2 ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.title}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-500 shadow-[0_0_8px_currentColor] shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <p className={`text-xs leading-relaxed mb-2 sm:mb-3 line-clamp-2 ${isUnread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-white/5 w-fit px-2 py-1 rounded-md border border-gray-200 dark:border-white/5">
                        <Clock size={10} />
                        {formatDateTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}