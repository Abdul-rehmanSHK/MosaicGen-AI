import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      inquiryType = "QUOTE_REQUEST",
      name,
      email,
      phone,
      preferredTime,
      message,
      productId,
      generationId,
    } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: session?.user?.id || null,
        productId: productId || null,
        generationId: generationId || null,
        inquiryType,
        name,
        email,
        phone: phone || null,
        preferredTime: preferredTime || null,
        message,
        status: "PENDING",
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
