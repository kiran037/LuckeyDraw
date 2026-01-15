'use client';

import { Ghost } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-8 group">
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative w-24 h-24 bg-[#151925] border border-white/5 rounded-3xl flex items-center justify-center text-4xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          {icon || <Ghost size={36} className="text-gray-500" />}
        </div>
      </div>
      
      <h3 className="text-xl font-black text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="
            relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 
            text-white font-bold text-sm py-3.5 px-8 shadow-[0_4px_20px_rgba(124,58,237,0.4)]
            border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300
          "
        >
          <span className="relative z-10">{action.label}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </button>
      )}
    </div>
  );
}