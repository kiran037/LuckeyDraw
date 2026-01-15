'use client';

import { 
  CheckCircle2, Clock, XCircle, Trophy, PlayCircle, Lock, LucideIcon 
} from 'lucide-react';

interface StatusBadgeProps {
  type: 'draw' | 'payment' | 'ticket';
  status: string;
}

export default function StatusBadge({ type, status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    // Draw Status
    LIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CLOSED: 'bg-red-500/10 text-red-400 border-red-500/20',
    RESULT_DECLARED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    
    // Ticket Status
    ACTIVE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CANCELLED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    
    // Payment Status
    PENDING: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
    REJECTED: 'bg-red-900/10 text-red-500 border-red-500/20',
  };

  const icons: Record<string, LucideIcon> = {
    LIVE: PlayCircle,
    CLOSED: Lock,
    RESULT_DECLARED: Trophy,
    ACTIVE: CheckCircle2,
    PENDING: Clock,
    CANCELLED: XCircle,
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
  };

  const styleClass = styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${styleClass}`}>
      <Icon size={12} strokeWidth={3} />
      <span>{status.replace('_', ' ')}</span>
    </span>
  );
}