import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
}

export function Avatar({ src, alt, fallback, className = "" }: AvatarProps) {
  return (
    <div className={`relative h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700 ${className}`}>
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover"
          sizes="40px"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-500 uppercase">
          {fallback ? fallback.slice(0, 2) : alt.charAt(0)}
        </div>
      )}
    </div>
  );
}