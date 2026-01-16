// ///Users/xeoren/Desktop/lucky_draw/src/lib/image-helper.ts
// export const getImageUrl = (path: string | null | undefined) => {
//   if (!path) return "/placeholder-image.png"; // Make sure you have a placeholder in public
//   if (path.startsWith("http")) return path;
  
//   // Use env var or fallback to empty string (browser handles relative paths automatically)
//   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
//   return `${baseUrl}${path}`;
// };

export const getImageUrl = (path: string | null | undefined) => {
  // 1. If no path is provided, return the placeholder
  if (!path || path.trim() === "") return "/placeholder-image.png";

  // 2. If it's already an absolute URL (starts with http/https), return it as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 3. For local paths, ensure it starts with a forward slash
  // This makes it a valid root-relative path for Next.js <Image />
  return path.startsWith("/") ? path : `/${path}`;
};