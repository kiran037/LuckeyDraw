
// src/components/user/home/TrustIndicators.tsx
'use client';

import { Shield, Lock, CheckCircle, Users } from 'lucide-react';

export default function TrustIndicators() {
  const trustBadges = [
    { icon: Shield, title: 'Secure', color: 'text-green-400' },
    { icon: CheckCircle, title: 'Verified', color: 'text-blue-400' },
    { icon: Lock, title: 'Private', color: 'text-purple-400' },
    { icon: Users, title: '10K+ Users', color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {trustBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="bg-[#151925]/50 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2"
          >
            <Icon size={20} className={badge.color} />
            <span className="text-[10px] font-medium text-gray-400">{badge.title}</span>
          </div>
        );
      })}
    </div>
  );
}