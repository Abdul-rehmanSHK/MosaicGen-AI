import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpVerificationEmail } from "@/lib/email";
import { createEmailVerificationToken } from "@/lib/verification";

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
      await prisma.emailVerificationCode.deleteMany({
        where: { email: cleanEmail },
      });

      // Generate 6-digit code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

      await prisma.emailVerificationCode.create({
        data: {
          email: cleanEmail,
          code: generatedCode,
          expiresAt,
        },
      });

      const emailResult = await sendOtpVerificationEmail({
        to: cleanEmail,
        code: generatedCode,
      });

      const isEmailConfigured = emailResult.method === "smtp" || emailResult.method === "resend";

      if (!emailResult.success) {
        await prisma.emailVerificationCode.deleteMany({ where: { email: cleanEmail } });
        return NextResponse.json(
          { error: emailResult.error || "Failed to send verification email. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your email inbox.`,
        devCode: isEmailConfigured ? undefined : generatedCode,
        expiresInSeconds: 300,
      });
    }

    if (action === "verify") {
      if (!code || typeof code !== "string" || code.trim().length !== 6) {
        return NextResponse.json({ error: "Please enter a valid 6-digit code." }, { status: 400 });
      }

      const record = await prisma.emailVerificationCode.findFirst({
        where: { email: cleanEmail, code: code.trim() },
        orderBy: { createdAt: "desc" },
      });

      if (!record) {
        return NextResponse.json(
          { error: "Invalid verification code. Please check your email inbox and try again." },
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
      await prisma.emailVerificationCode.delete({ where: { id: record.id } });

      const verifiedToken = createEmailVerificationToken(cleanEmail);

      const response = NextResponse.json({
        success: true,
        verifiedEmail: cleanEmail,
        verifiedToken,
      });

      response.cookies.set("zm_verified_token", verifiedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      response.cookies.set("zm_verified_email", cleanEmail, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid action requested." }, { status: 400 });
  } catch (error: any) {
    console.error("OTP API Error:", error);
    return NextResponse.json({ error: error.message || "OTP process failed" }, { status: 500 });
  }
}
