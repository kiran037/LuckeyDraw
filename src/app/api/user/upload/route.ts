export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";

const UPLOAD_ROOT = process.env.UPLOAD_PATH ?? "/var/www/project/uploads";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderValue = formData.get("folder");
    const folder =
      typeof folderValue === "string" && folderValue.trim()
        ? folderValue
        : "misc";

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const filename = `${baseName}-${uniqueSuffix}${ext}`;



    const uploadDir = path.join(UPLOAD_ROOT, folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      path: `/uploads/${folder}/${filename}`, // 👈 public URL
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
