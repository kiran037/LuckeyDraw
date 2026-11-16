'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import {
  Bell, Clock, ChevronLeft, Loader2,
  Inbox, RefreshCw, CheckCheck, Sparkles, Trophy, Wallet, ShieldAlert
} from 'lucide-react';

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ notifications: Notification[]; unreadCount: number }>(
        '/user/notifications'
      );

      if (!response.success) {
        setError(response.message || 'Failed to load notifications');
      } else {
        setNotifications(response.data?.notifications || []);
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch {
      setError('An unexpected error occurred while loading notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(notificationId: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await api.patch('/user/notifications', { notificationId });
  }

  async function markAllAsRead() {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await api.patch('/user/notifications', {});
    setMarkingAll(false);
  }

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('winner') || lower.includes('won') || lower.includes('congrat')) {
      return <Trophy size={18} className="text-amber-400" />;
    }
    if (lower.includes('wallet') || lower.includes('payment') || lower.includes('cash')) {
      return <Wallet size={18} className="text-emerald-400" />;
    }
    if (lower.includes('security') || lower.includes('alert') || lower.includes('failed')) {
      return <ShieldAlert size={18} className="text-rose-400" />;
    }
    return <Bell size={18} className="text-indigo-400" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Error Loading Updates</h3>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button
          onClick={loadNotifications}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Draw results, transaction confirmations & account alerts
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-xs font-bold text-indigo-400 transition-all active:scale-95"
          >
            {markingAll ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">You're All Caught Up!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-6">
            When you purchase tickets or win draws, real-time alerts will appear right here.
          </p>
          <button
            onClick={() => router.push('/user/draws')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Sparkles size={14} /> Explore Active Draws
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification) => {
              const isUnread = !notification.isRead;
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => isUnread && markAsRead(notification.id)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isUnread
                      ? 'bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 opacity-85 hover:opacity-100 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnread
                          ? 'bg-indigo-500/15 border-indigo-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {getNotificationIcon(notification.title)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-bold truncate ${
                            isUnread ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] shrink-0" />
                        )}
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          isUnread ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                        <Clock size={11} />
                        <span>{formatDateTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
