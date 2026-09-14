import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST: Save user quiz result (called from frontend /finder)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { style, shape, color, space, generatedPrompt, userEmail } = body;

    if (!style || !shape || !color || !space) {
      return NextResponse.json({ error: "Missing quiz selection parameters" }, { status: 400 });
    }

    const savedResult = await prisma.finderResult.create({
      data: {
        style,
        shape,
        color,
        space,
        generatedPrompt: generatedPrompt || "",
        userEmail: userEmail || null,
      },
    });

    return NextResponse.json({ success: true, result: savedResult });
  } catch (error: any) {
    console.error("Failed to save finder result:", error);
    return NextResponse.json({ error: error.message || "Failed to save quiz result" }, { status: 500 });
  }
}

// GET: Fetch all saved finder quiz results (for Admin Dashboard)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CONTENT_EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await prisma.finderResult.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch quiz results" }, { status: 500 });
  }
}

// DELETE: Delete saved quiz result(s)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CONTENT_EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    const action = searchParams.get("action");

    if (action === "clear-all") {
      const deleted = await prisma.finderResult.deleteMany();
      return NextResponse.json({ success: true, count: deleted.count });
    }

    let ids: string[] = [];
    if (idsParam) {
      ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      ids = [id];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body.ids)) ids = body.ids;
        if (body.id) ids.push(body.id);
      } catch {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Result ID(s) required" }, { status: 400 });
    }

    const deleted = await prisma.finderResult.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete quiz result" }, { status: 500 });
  }
}
