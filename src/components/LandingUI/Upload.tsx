'use client';

import { useState, useRef } from 'react';
import { X,Camera, UploadCloud, Loader2 } from 'lucide-react';
import { validateImageFile, compressImage } from '@/lib/image';

interface UploadProps {
  label?: string;
  value?: string | null;
  onChange: (base64: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  className = '',
  disabled = false
}: UploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      // Logic from previous implementation
      const validation = validateImageFile(file);
      if (!validation.valid) throw new Error(validation.error);
      const compressed = await compressImage(file, 800);
      onChange(compressed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process image';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const triggerUpload = () => {
    if (!disabled && !loading) inputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {label}
        </label>
      )}

      <div 
        onClick={triggerUpload}
        className={`
          relative group cursor-pointer transition-all duration-300
          w-32 h-32 rounded-full overflow-hidden
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}
          ${!value ? 'border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 hover:border-purple-500 dark:hover:border-purple-400' : 'ring-4 ring-white dark:ring-[#1A1F2E] shadow-xl'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || loading}
        />

        {loading ? (
          // Loading State
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1A1F2E]">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : value ? (
          // Image Preview State
          <>
            <img 
              src={value} 
              alt="Uploaded preview" 
              className="w-full h-full object-cover"
            />
            
            {/* Hover Overlay */}
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="text-white w-8 h-8 mb-1" />
                <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide">Change</span>
              </div>
            )}

            {/* Remove Button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 z-10"
                title="Remove image"
              >
                <X size={12} />
              </button>
            )}
          </>
        ) : (
          // Empty State
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-white/5 mb-2 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 transition-colors">
               <UploadCloud size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide">Upload</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
          <p className="text-[10px] font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}