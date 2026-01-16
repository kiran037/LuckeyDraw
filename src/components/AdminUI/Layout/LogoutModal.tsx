"use client";

import { X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-xl shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Log out?
          </h3>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            Are you sure you want to end your current session? You will be returned to the login screen.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}