import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className = "", title, action, noPadding = false }: CardProps) {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          {title && (
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>
        {children}
      </div>
    </div>
  );
}