"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
const TEST_EMAIL = "abdulrehman.irfan11286@gmail.com"; // As requested for testing

export async function sendVerificationEmail(email: string) {
  try {
    // Generate a secure 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing codes for this email
    await prisma.emailVerificationCode.deleteMany({
      where: { email },
    });

    // Store new code
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code: hashedCode,
        expiresAt,
      },
    });

    // Send email via Resend
    // For testing/owner config, we send to the test email instead of the user's email if specified in requirements.
    // However, usually we send to the user's email or CC the test email.
    // The requirement: "Send the verification code via email using resend to the user's provided email. For initial testing and owner configuration, use abdulrehman.irfan11286@gmail.com as the default test recipient."
    const recipientEmail = process.env.NODE_ENV === "production" ? email : TEST_EMAIL;

    await resend.emails.send({
      from: "AI Mosaic Studio <onboarding@resend.dev>",
      to: recipientEmail,
      subject: "Your AI Generation Verification Code",
      html: `
        <div style="font-family: sans-serif; color: #171922; padding: 20px;">
          <h1 style="color: #F59E0B;">AI Mosaic Studio</h1>
          <p>Please use the following 6-digit code to verify your email and unlock AI generation.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center;">
            ${code}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return { success: false, error: "Failed to send verification email." };
  }
}
