// src/components/ui/modal.tsx
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
        {(title || description) && (
          <div className="px-8 pt-8 pb-6 border-b border-gray-200">
            {title && <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
          </div>
        )}
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export const ModalFooter = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center justify-end gap-3 pt-6 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);