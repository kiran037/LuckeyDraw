import { Loader2 } from 'lucide-react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function GradientButton({ children, loading, className, ...props }: GradientButtonProps) {
  return (
    <button
      disabled={loading}
      className={`w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </div>
    </button>
  );
}