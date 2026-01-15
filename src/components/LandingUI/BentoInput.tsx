import { LucideIcon } from 'lucide-react';

interface BentoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
}

export default function BentoInput({ icon: Icon, label, className, ...props }: BentoInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
        </div>
        <input
          {...props}
          className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium ${className}`}
        />
      </div>
    </div>
  );
}