import { Loader2 } from 'lucide-react';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function ModernButton({ children, loading, className, ...props }: ModernButtonProps) {
  return (
    <button
      disabled={loading}
      className={`
        w-full h-14 flex items-center justify-center gap-2
        bg-[#000000] dark:bg-[#FFFFFF]
        text-white dark:text-black 
        text-[15px] font-bold tracking-wide
        rounded-[20px] 
        shadow-xl shadow-black/10 dark:shadow-white/5
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20
        active:scale-[0.98]
        transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}