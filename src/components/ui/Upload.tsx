// // src/components/ui/Upload.tsx
// 'use client';

// import { useState, useRef } from 'react';
// import { Upload, X, ImageIcon } from 'lucide-react';
// import { fileToBase64, validateImageFile, compressImage } from '@/lib/image';

// interface UploadProps {
//   label?: string;
//   value?: string | null;
//   onChange: (base64: string | null) => void;
//   className?: string;
//   maxWidth?: number;
//   preview?: boolean;
//   required?: boolean;
// }

// export default function ImageUpload({
//   label,
//   value,
//   onChange,
//   className = '',
//   maxWidth = 1200,
//   preview = true,
//   required = false,
// }: UploadProps) {
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setError(null);
//     setLoading(true);

//     try {
//       const validation = validateImageFile(file);
//       if (!validation.valid) {
//         setError(validation.error || 'Invalid file');
//         setLoading(false);
//         return;
//       }

//       const compressed = await compressImage(file, maxWidth);
//       onChange(compressed);
//     } catch (err) {
//       setError('Failed to process image');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemove = () => {
//     onChange(null);
//     if (inputRef.current) {
//       inputRef.current.value = '';
//     }
//   };

//   return (
//     <div className={className}>
//       {label && (
//         <label className="block text-sm font-bold text-gray-700 mb-2">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}

//       <div className="space-y-3">
//         {value && preview ? (
//           <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
//             <img
//               src={value}
//               alt="Preview"
//               className="w-full h-64 object-cover"
//             />
//             <button
//               type="button"
//               onClick={handleRemove}
//               className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
//             >
//               <X size={16} />
//             </button>
//           </div>
//         ) : (
//           <div
//             onClick={() => inputRef.current?.click()}
//             className={`
//               relative border-2 border-dashed rounded-2xl p-8 
//               flex flex-col items-center justify-center gap-3 
//               cursor-pointer transition-all
//               ${loading ? 'opacity-50 cursor-wait' : 'hover:border-purple-400 hover:bg-purple-50'}
//               ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
//             `}
//           >
//             <input
//               ref={inputRef}
//               type="file"
//               accept="image/jpeg,image/jpg,image/png,image/webp"
//               onChange={handleFileChange}
//               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               disabled={loading}
//               required={required && !value}
//             />

//             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
//               {loading ? (
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
//               ) : (
//                 <ImageIcon size={32} className="text-gray-400" />
//               )}
//             </div>

//             <div className="text-center">
//               <p className="text-sm font-medium text-gray-700">
//                 {loading ? 'Processing...' : 'Click to upload image'}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 JPEG, PNG, or WebP • Max 5MB
//               </p>
//             </div>

//             {error && (
//               <p className="text-xs text-red-600 mt-2">{error}</p>
//             )}
//           </div>
//         )}

//         {value && !preview && (
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <span className="text-sm text-gray-600">Image uploaded</span>
//             <button
//               type="button"
//               onClick={handleRemove}
//               className="text-red-500 hover:text-red-600 text-sm font-medium"
//             >
//               Remove
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/components/ui/Upload.tsx
'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
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
      const validation = validateImageFile(file);
      if (!validation.valid) throw new Error(validation.error);
      const compressed = await compressImage(file, 800);
      onChange(compressed);
    } catch (err: unknown) {
      // FIX: Unknown type handling
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

  return (
    <div className={className}>
      {label && <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>}

      <div 
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative group cursor-pointer transition-all duration-300
          ${value 
            ? 'w-32 h-32 rounded-full ring-4 ring-[#151925]' 
            : 'w-full h-32 rounded-2xl border-2 border-dashed border-white/10 bg-[#0B0E14] hover:bg-[#151925] hover:border-purple-500/50'}
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

        {value ? (
          <div className="relative w-32 h-32 mx-auto">
            <img 
              src={value} 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full shadow-2xl"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <X size={14} />
              </button>
            )}
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 group-hover:text-purple-400 transition-colors">
            {loading ? (
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImageIcon size={24} />
                <span className="text-xs font-medium">Upload Photo</span>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-red-400 mt-2 text-center">{error}</p>}
    </div>
  );
}