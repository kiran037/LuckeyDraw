'use client';

import { Search, CreditCard, Clock, Trophy } from 'lucide-react';
import { SectionHeader } from '@/components/LandingUI/HomePrimitives';

export default function HowItWorks() {
  const steps = [
    { 
      icon: Search, 
      title: 'Browse', 
      desc: 'Pick Draw', // Shortened text for mobile fitting
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
    },
    { 
      icon: CreditCard, 
      title: 'Buy', 
      desc: 'Get Ticket', 
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' 
    },
    { 
      icon: Clock, 
      title: 'Wait', 
      desc: 'Results', 
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
    },
    { 
      icon: Trophy, 
      title: 'Win', 
      desc: 'Claim Prize', 
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
    },
  ];

  return (
    <div>
      <SectionHeader title="How It Works" />
      
      {/* 
         RESPONSIVE GRID: 
         - grid-cols-4 on ALL screens (keeps it in one row)
         - Reduced gap on mobile 
      */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div 
              key={i} 
              className="flex flex-col items-center text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {/* Icon Wrapper: Smaller on mobile (w-9 h-9) */}
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${step.color} flex items-center justify-center mb-2 sm:mb-3`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              {/* Title: Smaller on mobile */}
              <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                {step.title}
              </h3>
              
              {/* Desc: Tiny on mobile */}
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}