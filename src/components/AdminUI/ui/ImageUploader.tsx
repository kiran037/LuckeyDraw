"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/image-helper";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (path: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUploader({ value, onChange, folder = "draws", label = "Banner Image" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onChange(data.path);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative group">
        {value ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <Image src={getImageUrl(value)} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-3 text-zinc-400" />
                  <p className="mb-2 text-sm text-zinc-500"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-zinc-500">PNG, JPG or WEBP</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}