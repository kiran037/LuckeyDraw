import { LucideIcon } from 'lucide-react';

interface BentoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
}

export default function BentoInput({
  icon: Icon,
  label,
  className = '',
  ...props
}: BentoInputProps) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          {...props}
          className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium ${className}`}
        />
      </div>
    </div>
  );
}
