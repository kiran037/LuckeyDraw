// src/components/ui/checkbox.tsx
'use client';

import React, { useId } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={`flex items-center justify-center w-5 h-5 border-2 rounded-md cursor-pointer transition-all
              border-gray-300 bg-white
              peer-checked:bg-gray-900 peer-checked:border-gray-900
              peer-focus:ring-2 peer-focus:ring-gray-900 peer-focus:ring-offset-2
              peer-disabled:cursor-not-allowed peer-disabled:opacity-50
              hover:border-gray-400 peer-checked:hover:bg-gray-800
              ${className}`}
          >
            <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
          </label>
        </div>
        {label && (
          <label htmlFor={checkboxId} className="text-sm text-gray-700 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={radioId}
            className={`flex items-center justify-center w-5 h-5 border-2 rounded-full cursor-pointer transition-all
              border-gray-300 bg-white
              peer-checked:border-gray-900
              peer-focus:ring-2 peer-focus:ring-gray-900 peer-focus:ring-offset-2
              peer-disabled:cursor-not-allowed peer-disabled:opacity-50
              hover:border-gray-400
              ${className}`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-gray-900 opacity-0 peer-checked:opacity-100" />
          </label>
        </div>
        {label && (
          <label htmlFor={radioId} className="text-sm text-gray-700 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';