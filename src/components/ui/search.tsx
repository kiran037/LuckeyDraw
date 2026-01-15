// src/components/ui/search.tsx
import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className = '', onClear, showClearButton = true, value, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={ref}
          type="text"
          value={value}
          className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-lg transition-all duration-200 
            placeholder:text-gray-400 
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
            hover:border-gray-400
            ${className}`}
          {...props}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';