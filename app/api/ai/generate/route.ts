import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processMosaicGeneration } from "@/lib/ai";
import { uploadImageToStorage } from "@/lib/storage";
import { logActivity } from "@/lib/logger";
import { aiGenerationRateLimiter } from "@/lib/ratelimit";
import { AIGenerationRequestSchema, formatZodError } from "@/lib/validations";
import { verifyEmailToken } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    // -------------------------------------------------------------------------
    // 1. Authentication & Identity Extraction
    // -------------------------------------------------------------------------
    const session = await auth();
    const sessionUserId = session?.user?.id || null;
    const sessionEmail = session?.user?.email?.toLowerCase().trim() || null;
    const isSessionVerified = (session?.user as any)?.isVerified;

    // Parse JSON request body safely
    let rawBody: any;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // 2. Strict Zod Input Validation & Prompt Sanitization
    // -------------------------------------------------------------------------
    const validationResult = AIGenerationRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_FAILED",
          message: formatZodError(validationResult.error),
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      prompt,
      placement,
      productId,
      referenceProductImageUrl,
      referenceProductTitle,
      referenceProductCategory,
      inputImageBase64: rawInputImageBase64,
      maskBase64,
      inputImageUrl: validatedInputImageUrl,
      maskUrl: validatedMaskUrl,
      finish,
      groutColor,
      surfaceDetection,
      email: rawBodyEmail,
      verifiedToken: bodyVerifiedToken,
    } = validationResult.data;

    let inputImageBase64 = rawInputImageBase64;

    // Active target email for this generation request:
    // When the client explicitly specifies an email (e.g., switched to a different email), honor it.
    const bodyEmail = rawBodyEmail?.toLowerCase().trim() || null;
    const userCleanEmail = bodyEmail || sessionEmail;

    if (!userCleanEmail) {
      return NextResponse.json(
        { error: "Email is required for verification before AI generation." },
        { status: 401 }
      );
    }

    // Determine the userId for this generation:
    // If userCleanEmail matches the active session user, attach sessionUserId.
    // If userCleanEmail is different (e.g. user entered a different email),
    // decouple from the session user so session quota is NOT consumed.
    let userId: string | null = null;
    if (sessionEmail && userCleanEmail === sessionEmail) {
      userId = sessionUserId;
    } else {
      const dbUser = await prisma.user.findUnique({ where: { email: userCleanEmail } });
      if (dbUser) {
        userId = dbUser.id;
      }
    }

    // -------------------------------------------------------------------------
    // 3. User-Specific Upstash Rate Limiting (5 requests per 60s per User/Email)
    // -------------------------------------------------------------------------
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimitIdentifier = userId ? `usr:${userId}` : `email:${userCleanEmail}:${clientIp}`;
    const rateLimitResult = await aiGenerationRateLimiter.limit(rateLimitIdentifier);

    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
      return new NextResponse(
        JSON.stringify({
          error: "TOO_MANY_REQUESTS",
          message: "You have exceeded the generation velocity limit (max 5 requests/minute). Please slow down.",
          retryAfter: retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfterSeconds.toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // -------------------------------------------------------------------------
    // 4. Verification Check
    // -------------------------------------------------------------------------
    let isVerified = false;

    // Check A: Active session verified (only if session email matches userCleanEmail)
    if (sessionEmail && userCleanEmail === sessionEmail && isSessionVerified) {
      isVerified = true;
    }

    // Check B: Database user with isVerified = true
    if (!isVerified) {
      const dbUser = await prisma.user.findUnique({ where: { email: userCleanEmail } });
      if (dbUser && dbUser.isVerified) {
        isVerified = true;
        if (!userId) userId = dbUser.id;
      }
    }

    // Check C: Cryptographic OTP verification token (from body, header, or cookie)
    if (!isVerified) {
      const cookieHeader = request.headers.get("cookie") || "";
      const cookieTokenMatch = cookieHeader.match(/zm_verified_token=([^;]+)/);
      const cookieToken = cookieTokenMatch ? decodeURIComponent(cookieTokenMatch[1]) : null;
      const headerToken = request.headers.get("x-verified-token");
      const tokenToCheck = bodyVerifiedToken || headerToken || cookieToken;

      if (tokenToCheck && verifyEmailToken(tokenToCheck, userCleanEmail)) {
        isVerified = true;
      }
    }

    // Check D: Development environment fallback
    if (!isVerified && process.env.NODE_ENV === "development") {
      isVerified = true;
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: "UNVERIFIED_EMAIL", message: "You must verify your email before generating AI designs." },
        { status: 403 }
      );
    }

    // -------------------------------------------------------------------------
    // 5. Enforce Total Free Previews Quota (Max 5 per verified email)
    // -------------------------------------------------------------------------
    const generationCount = await prisma.aIGeneration.count({
      where: {
        OR: [
          { userEmail: userCleanEmail },
          ...(userId ? [{ userId }] : []),
        ],
        isTrashed: false,
      },
    });

    if (generationCount >= 5) {
      return NextResponse.json(
        {
          error: "LIMIT_REACHED",
          message: `You have reached your limit of 5 free previews for ${userCleanEmail}. Please speak to a specialist or use a different email.`,
          email: userCleanEmail,
          usedCount: generationCount,
          maxLimit: 5,
          remaining: 0,
        },
        { status: 403 }
      );
    }

    // -------------------------------------------------------------------------
    // 6. Product Lookup & Upload Handling
    // -------------------------------------------------------------------------
    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
      });
    }

    let inputImageUrl: string | null = validatedInputImageUrl || null;
    let maskUrl: string | null = validatedMaskUrl || null;

    // If inputImageUrl is provided (e.g. from an inspiration space photo) and inputImageBase64 is not, convert to base64
    if (!inputImageBase64 && inputImageUrl && (inputImageUrl.startsWith("http://") || inputImageUrl.startsWith("https://"))) {
      try {
        const fetchRes = await fetch(inputImageUrl);
        if (fetchRes.ok) {
          const arrBuf = await fetchRes.arrayBuffer();
          const mime = fetchRes.headers.get("content-type") || "image/jpeg";
          inputImageBase64 = `data:${mime};base64,${Buffer.from(arrBuf).toString("base64")}`;
        }
      } catch (e) {
        console.warn("Could not fetch remote inputImageUrl to base64:", e);
      }
    }

    if (inputImageBase64 && inputImageBase64.startsWith("data:image") && !inputImageUrl) {
      const base64Data = inputImageBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      inputImageUrl = await uploadImageToStorage(buffer, `input_${Date.now()}.png`);
    }

    if (maskBase64 && maskBase64.startsWith("data:image")) {
      const base64Data = maskBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      maskUrl = await uploadImageToStorage(buffer, `mask_${Date.now()}.png`);
    }

    // -------------------------------------------------------------------------
    // 7. Execute AI Generation Pipeline
    // -------------------------------------------------------------------------
    const aiResult = await processMosaicGeneration({
      prompt,
      placement,
      referenceProductTitle: referenceProductTitle || product?.title,
      referenceProductCategory: referenceProductCategory || product?.category,
      referenceProductImageUrl: referenceProductImageUrl || product?.sampleImageUrl,
      inputImageUrl: inputImageUrl || undefined,
      maskUrl: maskUrl || undefined,
      inputImageBase64: inputImageBase64 || undefined,
      maskBase64: maskBase64 || undefined,
      finish,
      groutColor,
      surfaceDetection: surfaceDetection || undefined,
    });

    // -------------------------------------------------------------------------
    // 8. Persist Record to Database
    // -------------------------------------------------------------------------
    const generationRecord = await prisma.aIGeneration.create({
      data: {
        userId,
        userEmail: userCleanEmail,
        prompt,
        placement,
        inputImageUrl,
        maskUrl,
        resultImageUrl: aiResult.resultImageUrl,
        productId: product?.id || null,
      },
      include: {
        product: true,
      },
    });

    // Record system audit log
    await logActivity({
      action: "AI_GENERATION_CREATED",
      userId,
      userEmail: userCleanEmail,
      details: {
        generationId: generationRecord.id,
        prompt,
        placement,
        productTitle: product?.title || "Bespoke Italian",
        estimatedCost: aiResult.estimatedMaterialCost,
      },
    });

    const newUsedCount = generationCount + 1;
    const remaining = Math.max(0, 5 - newUsedCount);

    return NextResponse.json(
      {
        success: true,
        generation: generationRecord,
        resultImageUrl: aiResult.resultImageUrl,
        estimatedSqFt: aiResult.estimatedSqFt,
        estimatedTileCount: aiResult.estimatedTileCount,
        estimatedMaterialCost: aiResult.estimatedMaterialCost,
        promptApplied: aiResult.promptApplied,
        usedCount: newUsedCount,
        maxLimit: 5,
        remaining,
      },
      {
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate mosaic design. Please try again." },
      { status: 500 }
    );
  }
}
