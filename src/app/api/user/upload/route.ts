export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "misc";

    if (!file) {
      return NextResponse.json(
        { error: "No file received" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const filename = `${baseName}-${uniqueSuffix}${ext}`;

    const relativePath = `/uploads/${folder}`;
    const uploadDir = path.join(process.cwd(), "public", relativePath);

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      path: `${relativePath}/${filename}`,
      success: true,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}