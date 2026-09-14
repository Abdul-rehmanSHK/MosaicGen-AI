import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

async function verifyEditorOrAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CONTENT_EDITOR")) {
    throw new Error("Unauthorized: Access restricted to ADMIN and CONTENT_EDITOR");
  }
  return session.user;
}

// GET: Fetch all media items
export async function GET() {
  try {
    await verifyEditorOrAdmin();

    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    const totalOriginalBytes = mediaList.reduce((acc, m) => acc + (m.originalSize || m.size), 0);
    const totalOptimizedBytes = mediaList.reduce((acc, m) => acc + m.size, 0);
    const bytesSaved = Math.max(0, totalOriginalBytes - totalOptimizedBytes);

    return NextResponse.json({
      success: true,
      media: mediaList,
      stats: {
        totalCount: mediaList.length,
        totalOriginalBytes,
        totalOptimizedBytes,
        bytesSaved,
        savingsPercent: totalOriginalBytes > 0 ? Math.round((bytesSaved / totalOriginalBytes) * 100) : 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch media" }, { status: 401 });
  }
}

// POST: Upload and optimize image (compress & convert to WebP)
export async function POST(request: Request) {
  try {
    await verifyEditorOrAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalName = file.name || "upload.png";
    const originalSize = file.size;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Optimize with sharp: auto-rotate, max 2560px, convert to WebP, quality 82
    let pipeline = sharp(inputBuffer).rotate();

    const metadata = await pipeline.metadata();

    if (metadata.width && metadata.width > 2560) {
      pipeline = pipeline.resize({ width: 2560, withoutEnlargement: true });
    }

    const outputBuffer = await pipeline
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const optimizedMetadata = await sharp(outputBuffer).metadata();
    const optimizedSize = outputBuffer.length;

    // Generate safe filename
    const baseName = path
      .parse(originalName)
      .name.toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .slice(0, 50);
    const filename = `${baseName || "mosaic"}-${Date.now()}.webp`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save optimized file to disk
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, outputBuffer);

    const fileUrl = `/uploads/${filename}`;

    // Save to Database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName,
        url: fileUrl,
        mimeType: "image/webp",
        size: optimizedSize,
        originalSize,
        width: optimizedMetadata.width || null,
        height: optimizedMetadata.height || null,
      },
    });

    const savingsPercent = originalSize > 0 ? Math.round(((originalSize - optimizedSize) / originalSize) * 100) : 0;

    return NextResponse.json({
      success: true,
      media,
      savings: {
        originalSize,
        optimizedSize,
        bytesSaved: Math.max(0, originalSize - optimizedSize),
        savingsPercent,
      },
    });
  } catch (error: any) {
    console.error("Media upload optimization error:", error);
    return NextResponse.json({ error: error.message || "Failed to process and optimize image" }, { status: 500 });
  }
}

// DELETE: Delete media item(s) from disk and DB
export async function DELETE(request: Request) {
  try {
    await verifyEditorOrAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");

    let ids: string[] = [];
    if (idsParam) {
      ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      ids = [id];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body.ids)) ids = body.ids;
        if (body.id) ids.push(body.id);
      } catch {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Media ID(s) required" }, { status: 400 });
    }

    const mediaList = await prisma.media.findMany({
      where: { id: { in: ids } },
    });

    for (const media of mediaList) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", media.filename);
        await fs.unlink(filePath);
      } catch (fsErr) {
        // Ignore if already deleted on disk
      }
    }

    const deleteResult = await prisma.media.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, count: deleteResult.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete media" }, { status: 500 });
  }
}
