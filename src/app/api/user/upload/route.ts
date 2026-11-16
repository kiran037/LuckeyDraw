import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_PATH || "uploads");

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const MAX_MB = 5; // 5MB maximum upload limit for security and storage protection
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderRaw = formData.get("folder");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Invalid file extension. Only .jpg, .jpeg, .png, .webp, and .gif are allowed." },
        { status: 400 }
      );
    }

    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_MB}MB.` },
        { status: 400 }
      );
    }

    const folder =
      typeof folderRaw === "string"
        ? folderRaw.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 30)
        : "misc";

    const targetDir = path.join(UPLOAD_ROOT, folder);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const base = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 60);

    const filename = `${Date.now()}-${base || "upload"}${ext}`;
    const diskPath = path.join(targetDir, filename);
    const tmpPath = diskPath + ".part";

    // Convert File stream to Node.js Readable stream
    const webStream = file.stream() as unknown as ReadableStream<Uint8Array>;
    const nodeStream = Readable.fromWeb(webStream);

    let written = 0;
    await new Promise<void>((resolve, reject) => {
      const out = fs.createWriteStream(tmpPath);

      nodeStream.on("data", (chunk: Buffer) => {
        written += chunk.length;
        if (written > maxBytes) {
          out.destroy(new Error("File too large"));
          nodeStream.destroy();
        }
      });

      nodeStream.on("error", reject);
      out.on("error", reject);
      out.on("finish", resolve);

      nodeStream.pipe(out);
    });

    await fs.promises.rename(tmpPath, diskPath);

    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      path: url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}