import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processMosaicGeneration } from "@/lib/ai";
import { uploadImageToStorage } from "@/lib/storage";
import { logActivity } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email || "Guest Client";

    const body = await request.json();
    const {
      prompt,
      placement = "Floor Medallion",
      productId,
      inputImageBase64,
      maskBase64,
      finish = "Polished",
      groutColor = "Champagne Gold"
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid design prompt is required." },
        { status: 400 }
      );
    }

    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId }
      });
    }

    let inputImageUrl: string | null = null;
    let maskUrl: string | null = null;

    if (inputImageBase64 && inputImageBase64.startsWith("data:image")) {
      const base64Data = inputImageBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      inputImageUrl = await uploadImageToStorage(buffer, `input_${Date.now()}.png`);
    }

    if (maskBase64 && maskBase64.startsWith("data:image")) {
      const base64Data = maskBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      maskUrl = await uploadImageToStorage(buffer, `mask_${Date.now()}.png`);
    }

    const aiResult = await processMosaicGeneration({
      prompt,
      placement,
      referenceProductTitle: product?.title,
      referenceProductCategory: product?.category,
      referenceProductImageUrl: product?.sampleImageUrl,
      inputImageUrl: inputImageUrl || undefined,
      maskUrl: maskUrl || undefined,
      finish,
      groutColor
    });

    const generationRecord = await prisma.aIGeneration.create({
      data: {
        userId,
        prompt,
        placement,
        inputImageUrl,
        maskUrl,
        resultImageUrl: aiResult.resultImageUrl,
        productId: product?.id || null,
      },
      include: {
        product: true
      }
    });

    // Record system audit log
    await logActivity({
      action: "AI_GENERATION_CREATED",
      userId,
      userEmail,
      details: {
        generationId: generationRecord.id,
        prompt,
        placement,
        productTitle: product?.title || "Bespoke Italian",
        estimatedCost: aiResult.estimatedMaterialCost,
      },
    });

    return NextResponse.json({
      success: true,
      generation: generationRecord,
      resultImageUrl: aiResult.resultImageUrl,
      estimatedSqFt: aiResult.estimatedSqFt,
      estimatedTileCount: aiResult.estimatedTileCount,
      estimatedMaterialCost: aiResult.estimatedMaterialCost,
      promptApplied: aiResult.promptApplied
    });
  } catch (error: any) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate mosaic design. Please try again." },
      { status: 500 }
    );
  }
}
