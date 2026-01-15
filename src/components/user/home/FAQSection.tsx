// src/components/user/home/FAQSection.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircleQuestion } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'How do I participate?', a: 'Choose a live draw from the home page, select your lucky number or buy a random ticket via UPI/Card, and wait for the countdown!' },
    { q: 'When are winners announced?', a: 'Winners are declared automatically by our random algorithm immediately after the draw timer hits zero.' },
    { q: 'Is the process fair?', a: 'Absolutely. We use a cryptographically secure random number generator (RNG) that is verifiable and transparent.' },
    { q: 'How do I claim my prize?', a: 'Winnings are credited to your wallet instantly. For physical prizes, our team will contact you within 24 hours.' },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <HelpCircle size={22} className="text-purple-400" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white leading-none">Help Center</h2>
            <p className="text-xs text-gray-500 mt-1">Frequently asked questions</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`
                group rounded-2xl border transition-all duration-300 overflow-hidden
                ${isOpen 
                    ? 'bg-[#1A1F2E] border-purple-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                    : 'bg-[#151925]/40 border-white/5 hover:border-white/10 hover:bg-[#151925]/80'}
              `}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                    <MessageCircleQuestion 
                        size={18} 
                        className={`transition-colors ${isOpen ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} 
                    />
                    <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                    {faq.q}
                    </span>
                </div>
                
                <div className={`
                    p-1 rounded-full transition-all duration-300 
                    ${isOpen ? 'bg-purple-500/20 rotate-180' : 'bg-white/5 group-hover:bg-white/10'}
                `}>
                    <ChevronDown
                        size={16}
                        className={`transition-colors ${isOpen ? 'text-purple-300' : 'text-gray-500'}`}
                    />
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 pl-[3.25rem] text-xs leading-relaxed text-gray-400">
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}