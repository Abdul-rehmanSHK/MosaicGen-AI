import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");
    const rawFilename = searchParams.get("filename") || `mosaic-design-${Date.now()}.png`;

    if (!rawUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Sanitize filename
    const filename = rawFilename.replace(/[^a-zA-Z0-9_.-]/g, "_");

    // Handle local uploaded files (e.g. /uploads/...)
    if (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/")) {
      const cleanPath = rawUrl.startsWith("/") ? rawUrl.slice(1) : rawUrl;
      const filePath = path.join(process.cwd(), "public", cleanPath);
      
      try {
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(cleanPath).toLowerCase();
        const mimeType = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        return new NextResponse("Local file not found", { status: 404 });
      }
    }

    // Remote URL (Unsplash, OpenAI, Fal.ai, etc.)
    const remoteResponse = await fetch(rawUrl);
    if (!remoteResponse.ok) {
      return new NextResponse("Failed to fetch remote image", { status: remoteResponse.status });
    }

    const contentType = remoteResponse.headers.get("content-type") || "image/png";
    const arrayBuffer = await remoteResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Download proxy error:", error);
    return new NextResponse(error.message || "Failed to download image", { status: 500 });
  }
}
