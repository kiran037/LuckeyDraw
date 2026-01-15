'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import EmptyState from '@/components/UserUI/EmptyState';
import { Bell, CheckCircle2, Clock, ChevronLeft, Trash2 } from 'lucide-react';

// --- Types ---
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// --- Visual Components ---

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 pointer-events-none select-none bg-[#09090b]">
    <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
  </div>
);

const ChromeBackButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="
      relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
      bg-[#151925] border border-white/10 hover:bg-white/5 active:scale-95
      shadow-[0_4px_10px_rgba(0,0,0,0.3)] group
    "
  >
    <ChevronLeft size={20} className="text-gray-400 group-hover:text-white transition-colors" />
  </button>
);

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    const response = await api.get<{ notifications: Notification[]; unreadCount: number }>('/user/notifications');

    if (!response.success) {
      setError(response.error || 'Failed to load notifications');
    } else {
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    }
    setLoading(false);
  }

  async function markAsRead(notificationId: string) {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await api.post('/user/notifications/read', { notificationId });
  }

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorState message={error} onRetry={loadNotifications} />;

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white pb-24 font-sans overflow-x-hidden">
      <BackgroundGlow />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* === HEADER === */}
        <div className="flex justify-between items-center mb-8 sticky top-4 z-20 bg-[#09090b]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
             <ChromeBackButton onClick={() => router.back()} />
             <div>
                <h1 className="text-xl font-black text-white tracking-tight">Notifications</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Updates & Alerts</p>
             </div>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 bg-[#151925] rounded-xl border border-white/5 flex items-center justify-center text-purple-400 shadow-inner">
              <Bell size={20} />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full border-2 border-[#09090b] shadow-lg animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* === LIST === */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} className="text-purple-400" />}
            title="All caught up!"
            description="You don't have any notifications yet. We'll notify you about important updates!"
            action={{
              label: 'Browse Draws',
              onClick: () => router.push('/user/draws'),
            }}
          />
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {notifications.map((notification, index) => {
              const isUnread = !notification.isRead;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => isUnread && markAsRead(notification.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                    ${isUnread
                      ? 'bg-[#151925] border-purple-500/30 shadow-[0_4px_20px_-5px_rgba(168,85,247,0.15)] hover:border-purple-500/50'
                      : 'bg-[#0f1116] border-white/5 hover:bg-[#151925] hover:border-white/10 opacity-80 hover:opacity-100'}
                  `}
                >
                  {/* Unread Glow Indicator */}
                  {isUnread && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-[100px] blur-xl pointer-events-none" />
                  )}

                  <div className="flex gap-4 relative z-10">
                    {/* Icon Box */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${isUnread 
                        ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/20' 
                        : 'bg-[#1a1e29] text-gray-500 border border-white/5'}
                    `}>
                      {isUnread ? <Bell size={20} className="animate-pulse" /> : <CheckCircle2 size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-bold text-sm mb-1 truncate pr-2 ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                          {notification.title}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${isUnread ? 'text-gray-300' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-white/5 w-fit px-2 py-1 rounded-md border border-white/5">
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