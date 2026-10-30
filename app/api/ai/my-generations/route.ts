import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch {
      // Safe fallback if session headers are unavailable outside request context
    }

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
      select: { id: true, email: true, isVerified: true, role: true },
    });

    const whereClause = {
      OR: [
        { userEmail: cleanEmail },
        ...(dbUser ? [{ userId: dbUser.id }] : []),
      ],
      isTrashed: false,
    };

    let [totalCount, generations] = await Promise.all([
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

    // If 0 found for this email query, but the user's logged-in session email has generations, smoothly fall back to it
    let activeEmail = cleanEmail;
    if (totalCount === 0 && session?.user?.email) {
      const sessionEmail = session.user.email.trim().toLowerCase();
      if (sessionEmail && sessionEmail !== cleanEmail) {
        const sessionUser = await prisma.user.findUnique({
          where: { email: sessionEmail },
          select: { id: true },
        });
        const sessionClause = {
          OR: [
            { userEmail: sessionEmail },
            ...(sessionUser ? [{ userId: sessionUser.id }] : []),
          ],
          isTrashed: false,
        };
        const [sCount, sGens] = await Promise.all([
          prisma.aIGeneration.count({ where: sessionClause }),
          prisma.aIGeneration.findMany({
            where: sessionClause,
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
        if (sCount > 0) {
          totalCount = sCount;
          generations = sGens;
          activeEmail = sessionEmail;
        }
      }
    }

    const maxLimit = 5;
    const remaining = Math.max(0, maxLimit - totalCount);

    return NextResponse.json({
      success: true,
      email: activeEmail,
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
