import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { id, prompt, placement, productId } = body;

    if (!id || !prompt || !placement) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const updatedGen = await prisma.aIGeneration.update({
      where: { id },
      data: {
        prompt,
        placement,
        productId: productId || null,
      },
      include: {
        product: true,
        user: true,
      },
    });

    await logActivity({
      action: "AI_GENERATION_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { generationId: id, prompt, placement },
    });

    return NextResponse.json({ success: true, generation: updatedGen });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update generation" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 });
    }

    const gen = await prisma.aIGeneration.findUnique({ where: { id } });

    await prisma.aIGeneration.delete({ where: { id } });

    await logActivity({
      action: "AI_GENERATION_DELETED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { generationId: id, prompt: gen?.prompt || "" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete generation" }, { status: 500 });
  }
}
