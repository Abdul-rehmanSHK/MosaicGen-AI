import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const record = await prisma.emailVerificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "No verification code found for this email." }, { status: 404 });
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: "Verification code has expired." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(code, record.code);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    // Mark as verified. If the user is logged in, update their user record.
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isVerified: true },
      });
    } else {
      // Upsert a user record for the email to mark as verified
      await prisma.user.upsert({
        where: { email },
        update: { isVerified: true },
        create: {
          email,
          name: "Guest Client",
          passwordHash: "unregistered",
          role: "USER",
          isVerified: true,
        },
      });
    }

    // Delete the used code
    await prisma.emailVerificationCode.delete({
      where: { id: record.id },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully." });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
