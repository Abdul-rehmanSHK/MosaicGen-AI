import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email query parameter is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user record if any
    const dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, isVerified: true },
    });

    const generations = await prisma.aIGeneration.findMany({
      where: {
        OR: [
          { userEmail: cleanEmail },
          ...(dbUser ? [{ userId: dbUser.id }] : []),
        ],
        isTrashed: false,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        prompt: true,
        placement: true,
        resultImageUrl: true,
        inputImageUrl: true,
        createdAt: true,
      },
    });

    const usedCount = generations.length;
    const maxLimit = 5;
    const remaining = Math.max(0, maxLimit - usedCount);

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      usedCount,
      maxLimit,
      remaining,
      generations,
    });
  } catch (error: any) {
    console.error("Fetch my-generations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user generation history." },
      { status: 500 }
    );
  }
}
