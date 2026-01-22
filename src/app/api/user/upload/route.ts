import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";

export const runtime = "nodejs";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_PATH || "uploads");

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const MAX_MB = 200; // change if needed

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderRaw = formData.get("folder");

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const folder =
      typeof folderRaw === "string"
        ? folderRaw.toLowerCase().replace(/[^a-z0-9-_]/g, "")
        : "misc";

    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_MB}MB` },
        { status: 400 }
      );
    }

    const targetDir = path.join(UPLOAD_ROOT, folder);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const ext = path.extname(file.name);
    const base = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 60);

    const filename = `${Date.now()}-${base}${ext}`;
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