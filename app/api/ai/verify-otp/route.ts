import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, code } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (action === "send" || action === "resend") {
      // Delete old codes for this email
      await prisma.verificationCode.deleteMany({
        where: { email: cleanEmail },
      });

      // Generate 6-digit code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

      await prisma.verificationCode.create({
        data: {
          email: cleanEmail,
          code: generatedCode,
          expiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email.",
        demoCode: generatedCode,
        expiresInSeconds: 300,
      });
    }

    if (action === "verify") {
      if (!code || typeof code !== "string" || code.trim().length !== 6) {
        return NextResponse.json({ error: "Please enter a valid 6-digit code." }, { status: 400 });
      }

      const record = await prisma.verificationCode.findFirst({
        where: { email: cleanEmail, code: code.trim() },
        orderBy: { createdAt: "desc" },
      });

      if (!record) {
        return NextResponse.json(
          { error: "Invalid verification code. Please check and try again." },
          { status: 400 }
        );
      }

      if (new Date() > new Date(record.expiresAt)) {
        return NextResponse.json(
          { error: "Verification code has expired (5 minute limit). Please request a new code." },
          { status: 400 }
        );
      }

      // Cleanup code after successful verification
      await prisma.verificationCode.delete({ where: { id: record.id } });

      return NextResponse.json({ success: true, verifiedEmail: cleanEmail });
    }

    return NextResponse.json({ error: "Invalid action requested." }, { status: 400 });
  } catch (error: any) {
    console.error("OTP API Error:", error);
    return NextResponse.json({ error: error.message || "OTP process failed" }, { status: 500 });
  }
}
