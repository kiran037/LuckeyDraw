
// src/components/user/home/RulesGuidelines.tsx
'use client';

import { FileText, AlertCircle } from 'lucide-react';

export default function RulesGuidelines() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Rules */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-purple-400" />
          <h3 className="font-bold text-white text-sm">Key Rules</h3>
        </div>
        <ul className="space-y-3">
          {['Must be 18+ to play', 'One account per user', 'Tickets are non-refundable'].map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-gray-400">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                {i + 1}
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Warning */}
      <div className="bg-orange-500/5 rounded-2xl p-5 border border-orange-500/10">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={18} className="text-orange-400" />
          <h3 className="font-bold text-orange-400 text-sm">Fair Play</h3>
        </div>
        <p className="text-xs text-orange-200/60 leading-relaxed">
          We maintain a zero-tolerance policy towards fraud. Any suspicious activity will result in immediate account suspension. Play responsibly.
        </p>
      </div>
    </div>
  );
}