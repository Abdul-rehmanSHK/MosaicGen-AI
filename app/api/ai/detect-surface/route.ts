import { NextResponse } from "next/server";
import { detectArchitecturalSurface } from "@/lib/surfaceDetector";

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageBase64, targetSurface, designPrompt } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "A room image (imageBase64 dataUrl) is required for surface detection." },
        { status: 400 }
      );
    }

    if (!targetSurface || typeof targetSurface !== "string") {
      return NextResponse.json(
        { error: "A target surface name is required." },
        { status: 400 }
      );
    }

    const detection = await detectArchitecturalSurface({
      imageBase64,
      targetSurface: targetSurface.trim(),
      designPrompt: designPrompt || "",
    });

    return NextResponse.json({
      success: true,
      detection,
    });
  } catch (error: any) {
    console.error("[SURFACE DETECTION API ERROR]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to detect architectural surface in image." },
      { status: 500 }
    );
  }
}
