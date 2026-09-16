import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { InquiryFormSchema, formatZodError } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    let rawBody: any;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    // Strict Zod validation
    const validationResult = InquiryFormSchema.safeParse(rawBody);
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
      inquiryType = "QUOTE_REQUEST",
      name,
      email,
      phone,
      preferredTime,
      message,
      spaceType,
      dimensions,
      designImageUrl,
      productId,
      generationId,
    } = validationResult.data;

    const inquiry = await prisma.lead.create({
      data: {
        userId: session?.user?.id || null,
        productId: productId || null,
        generationId: generationId || null,
        name,
        email,
        phone: phone || null,
        spaceType,
        roomDimensions: dimensions || null,
        designImageUrl: designImageUrl || null,
        message: preferredTime ? `[Preferred Time: ${preferredTime}] [Type: ${inquiryType}] ${message}` : message,
        status: "NEW",
      },
      include: {
        product: true,
        generation: true,
      },
    });

    // Record system audit log
    await logActivity({
      action: inquiryType === "TALK_TO_SPECIALIST" ? "SPECIALIST_CONSULTATION_REQUESTED" : "LEAD_INQUIRY_SUBMITTED",
      userId: session?.user?.id || null,
      userEmail: email,
      details: {
        inquiryId: inquiry.id,
        inquiryType,
        name,
        email,
        phone: phone || "N/A",
        message,
      },
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry request." }, { status: 500 });
  }
}
