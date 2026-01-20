export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderValue = formData.get("folder");

    const folder =
      typeof folderValue === "string" && folderValue.trim()
        ? folderValue
        : "misc";

    if (!file) {
      return NextResponse.json(
        { error: "No file received" },
        { status: 400 }
      );
    }

    // file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // unique filename
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const filename = `${baseName}-${uniqueSuffix}${ext}`;

    // ✅ NEXT PUBLIC UPLOAD PATH
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      folder
    );

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // ✅ PUBLIC URL (AUTO SERVED BY NEXT)
    return NextResponse.json({
      success: true,
      path: `/uploads/${folder}/${filename}`,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
