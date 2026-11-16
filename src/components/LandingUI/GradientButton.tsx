import { Loader2 } from 'lucide-react';

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function GradientButton({
  children,
  loading,
  className = '',
  ...props
}: GradientButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`w-full relative overflow-hidden group bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2 text-sm">
        {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
        {children}
      </div>
    </button>
  );
}
