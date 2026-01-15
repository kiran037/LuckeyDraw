'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-xs text-purple-400 font-medium animate-pulse">LOADING...</p>
    </div>
  );
}

