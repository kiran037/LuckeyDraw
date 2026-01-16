import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "misc";

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name);
    const filename = `${file.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}${ext}`;
    
    // Define storage path (public/storage/{folder})
    const relativePath = `/storage/${folder}`;
    const uploadDir = path.join(process.cwd(), "public", relativePath);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the absolute path relative to site root
    return NextResponse.json({ 
      path: `${relativePath}/${filename}`,
      success: true 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}