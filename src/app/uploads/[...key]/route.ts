import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_PATH || "uploads");

function clean(seg: string) {
  const s = seg.replace(/[^a-zA-Z0-9._-]/g, "");
  return s && s !== "." && s !== ".." ? s : "";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    // Await params as required by Next.js 15+
    const params = await context.params;
    
    const safe = params.key.map(clean).filter(Boolean);
    if (!safe.length) {
      return Response.json({ error: "Invalid file" }, { status: 400 });
    }

    const abs = path.normalize(path.join(UPLOAD_ROOT, ...safe));
    const root = path.normalize(UPLOAD_ROOT);

    if (!abs.startsWith(root + path.sep)) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(abs)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const stat = await fs.promises.stat(abs);
    const ext = path.extname(abs).toLowerCase();

    const mime: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".mkv": "video/x-matroska",
      ".pdf": "application/pdf",
    };

    const type = mime[ext] || "application/octet-stream";

    const buffer = await fs.promises.readFile(abs);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });

  } catch (error) {
    console.error("File fetch error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}