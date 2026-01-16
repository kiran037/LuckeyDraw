'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    { q: 'How do I participate?', a: 'Choose a live draw, buy a ticket via UPI/Card, and wait for the countdown.' },
    { q: 'Is the process fair?', a: 'Yes. We use a cryptographically secure random number generator (RNG).' },
    { q: 'How do I claim prizes?', a: 'Winnings are credited to your wallet instantly or physical prizes are shipped.' },
  ];

  return (
    <div className="bg-white dark:bg-[#151925] rounded-[32px] p-6 border border-gray-100 dark:border-white/5">
      <h3 className="font-bold text-xl mb-6 text-gray-900 dark:text-white">FAQ</h3>
      <div className="space-y-2">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-gray-50 dark:border-white/5 last:border-0">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full py-4 flex items-center justify-between text-left"
              >
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{faq.q}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden text-xs text-gray-500 leading-relaxed">
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