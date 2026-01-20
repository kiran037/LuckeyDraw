export const getImageUrl = (path?: string | null) => {
  // 1️⃣ No image → placeholder
  if (!path || typeof path !== "string" || path.trim() === "") {
    return "/placeholder-image.png";
  }

  // 2️⃣ Absolute URL (Cloudinary / S3 / external)
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // 3️⃣ Already correct absolute local path
  // eg: /uploads/users/avatar.jpg
  if (path.startsWith("/")) {
    return path;
  }

  // 4️⃣ Fallback → make it root-relative
  return `/${path}`;
};
