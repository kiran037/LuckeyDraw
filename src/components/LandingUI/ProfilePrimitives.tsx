'use client';

import { LucideIcon } from 'lucide-react';

// --- WRAPPER CARD (Bento Style) ---
export const BentoCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`
      bg-white dark:bg-[#151925] 
      border border-gray-200 dark:border-white/5 
      shadow-sm dark:shadow-none
      rounded-3xl p-6 
      transition-all duration-300
      ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 active:scale-[0.98]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// --- INPUT FIELD ---
interface ProfileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
}

export const ProfileInput = ({ label, icon: Icon, className, ...props }: ProfileInputProps) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input 
        {...props}
        className={`
          w-full h-12
          bg-gray-50 dark:bg-[#0B0E14] 
          border border-gray-200 dark:border-white/10 
          rounded-2xl px-4 
          ${Icon ? 'pl-12' : ''} 
          text-sm font-medium text-gray-900 dark:text-white 
          placeholder-gray-400
          focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 
          transition-all duration-200
          ${className}
        `}
      />
    </div>
  </div>
);

// --- ACTION BUTTON ---
export const ActionButton = ({ children, variant = 'primary', loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', loading?: boolean }) => {
  const variants = {
    primary: "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200",
    secondary: "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10",
    danger: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
  };

  return (
    <button 
      disabled={loading}
      className={`
        px-6 py-3 rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2
        ${variants[variant]}
        ${props.className}
      `}
      {...props}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
};

// --- ICON BUTTON ---
export const IconButton = ({ icon: Icon, onClick, active, variant = 'default' }: { icon: LucideIcon, onClick?: () => void, active?: boolean, variant?: 'default' | 'danger' }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`
      w-10 h-10 rounded-xl flex items-center justify-center transition-all
      ${variant === 'danger' 
        ? 'bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20' 
        : active
          ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
          : 'bg-white dark:bg-[#151925] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white'
      }
    `}
  >
    <Icon size={18} />
  </button>
);