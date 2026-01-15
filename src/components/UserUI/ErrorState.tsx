
// src/components/UserUI/ErrorState.tsx
'use client';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-white">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 text-red-500 border border-red-500/20">
        <AlertTriangle size={32} />
      </div>
      <h3 className="text-lg font-bold mb-2">System Alert</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200">
          <RefreshCcw size={16} /> Retry
        </button>
      )}
    </div>
  );
}