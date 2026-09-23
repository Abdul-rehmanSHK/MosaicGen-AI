import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");
    const cleanEmail = (emailParam || session?.user?.email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Email query parameter is required." },
        { status: 400 }
      );
    }

    // Find user record if any
    const dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, isVerified: true },
    });

    const whereClause = {
      OR: [
        { userEmail: cleanEmail },
        ...(dbUser ? [{ userId: dbUser.id }] : []),
      ],
      isTrashed: false,
    };

    const [totalCount, generations] = await Promise.all([
      prisma.aIGeneration.count({ where: whereClause }),
      prisma.aIGeneration.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          prompt: true,
          placement: true,
          resultImageUrl: true,
          inputImageUrl: true,
          createdAt: true,
        },
      }),
    ]);

    const maxLimit = 5;
    const remaining = Math.max(0, maxLimit - totalCount);

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      usedCount: totalCount,
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
