import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only ADMIN can manage AI generations");
  }
  return session.user;
}

export async function GET(request: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "active" | "trashed" | "all"

    let whereClause: any = {};
    if (status === "trashed") {
      whereClause = { isTrashed: true };
    } else if (status === "active") {
      whereClause = { isTrashed: false };
    } else if (status !== "all") {
      whereClause = { isTrashed: false };
    }

    const generations = await prisma.aIGeneration.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        user: true,
      },
    });

    const activeCount = await prisma.aIGeneration.count({ where: { isTrashed: false } });
    const trashedCount = await prisma.aIGeneration.count({ where: { isTrashed: true } });

    return NextResponse.json({
      success: true,
      generations,
      counts: {
        active: activeCount,
        trashed: trashedCount,
        total: activeCount + trashedCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch generations" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { id, action, prompt, placement, productId } = body;

    const ids: string[] = body.ids || (body.id ? [body.id] : []);

    if (action === "restore") {
      if (ids.length === 0) {
        return NextResponse.json({ error: "Generation ID(s) required" }, { status: 400 });
      }

      await prisma.aIGeneration.updateMany({
        where: { id: { in: ids } },
        data: {
          isTrashed: false,
          trashedAt: null,
        },
      });

      await logActivity({
        action: "AI_GENERATIONS_BULK_RESTORED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: ids.length },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    // Action: Move to Trash (Soft delete)
    if (action === "trash") {
      if (ids.length === 0) {
        return NextResponse.json({ error: "Generation ID(s) required" }, { status: 400 });
      }

      await prisma.aIGeneration.updateMany({
        where: { id: { in: ids } },
        data: {
          isTrashed: true,
          trashedAt: new Date(),
        },
      });

      await logActivity({
        action: "AI_GENERATIONS_BULK_TRASHED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: ids.length },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 });
    }

    // Standard update
    if (!prompt || !placement) {
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
    const idsParam = searchParams.get("ids");
    let permanent = searchParams.get("permanent") === "true";
    const action = searchParams.get("action");

    // Action: Empty entire trash
    if (action === "empty-trash") {
      const deleteResult = await prisma.aIGeneration.deleteMany({
        where: { isTrashed: true },
      });

      await logActivity({
        action: "AI_GENERATION_TRASH_EMPTIED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { count: deleteResult.count },
      });

      return NextResponse.json({ success: true, count: deleteResult.count });
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
        if (body.permanent !== undefined) permanent = Boolean(body.permanent);
      } catch {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Generation ID(s) required" }, { status: 400 });
    }

    if (permanent) {
      // Hard delete from database
      const deleteResult = await prisma.aIGeneration.deleteMany({
        where: { id: { in: ids } },
      });

      await logActivity({
        action: "AI_GENERATIONS_PERMANENTLY_DELETED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: deleteResult.count },
      });

      return NextResponse.json({ success: true, permanent: true, count: deleteResult.count });
    } else {
      // Soft delete: Move to trash
      const updateResult = await prisma.aIGeneration.updateMany({
        where: { id: { in: ids } },
        data: {
          isTrashed: true,
          trashedAt: new Date(),
        },
      });

      await logActivity({
        action: "AI_GENERATIONS_TRASHED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: updateResult.count },
      });

      return NextResponse.json({ success: true, permanent: false, count: updateResult.count });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete generation" }, { status: 500 });
  }
}
