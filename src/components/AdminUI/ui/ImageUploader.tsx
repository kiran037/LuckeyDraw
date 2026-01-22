///Users/xeoren/Desktop/lucky_draw/src/components/AdminUI/ui/ImageUploader.tsx
"use client";

import Image from "next/image";
import { FileUploader } from "./FileUploader";
import { getImageUrl } from "@/lib/image-helper";

export function ImageUploader(props: {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const { value, onChange, folder, label } = props;

  return (
    <div className="space-y-2">
      <FileUploader
        value={value}
        onChange={onChange}
        folder={folder}
        label={label}
        accept="image/*"
      />

      {value && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(value)}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
