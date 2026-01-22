"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
}

export function FileUploader({
  value,
  onChange,
  folder = "misc",
  label = "Upload File",
  accept = "*/*",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.path);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        <div className="flex items-center gap-3">
          <span className="text-xs truncate">{value}</span>
          <button onClick={() => onChange("")}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-50"
        >
          {uploading ? "Uploading..." : <Upload />}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        disabled={uploading}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            upload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}