import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

async function verifyEditorOrAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CONTENT_EDITOR")) {
    throw new Error("Unauthorized: Access restricted to ADMIN and CONTENT_EDITOR");
  }
  return session.user;
}

export async function GET(request: Request) {
  try {
    await verifyEditorOrAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "active" | "trashed" | "all"

    let whereClause: any = {};
    if (status === "trashed") {
      whereClause = { isTrashed: true };
    } else if (status === "active") {
      whereClause = { isTrashed: false };
    } else if (status !== "all") {
      // Default to active
      whereClause = { isTrashed: false };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const activeCount = await prisma.product.count({ where: { isTrashed: false } });
    const trashedCount = await prisma.product.count({ where: { isTrashed: true } });

    return NextResponse.json({
      success: true,
      products,
      counts: {
        active: activeCount,
        trashed: trashedCount,
        total: activeCount + trashedCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const body = await request.json();
    const { title, slug, description, category, sampleImageUrl, pricePerSqFt, specs, showOnCustomize, showOnFromScratch } = body;

    if (!title || !slug || !category || !sampleImageUrl || !pricePerSqFt) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description: description || "",
        category,
        sampleImageUrl,
        pricePerSqFt: parseFloat(pricePerSqFt),
        specs: typeof specs === "string" ? specs : JSON.stringify(specs || {}),
        showOnCustomize: showOnCustomize !== undefined ? Boolean(showOnCustomize) : true,
        showOnFromScratch: showOnFromScratch !== undefined ? Boolean(showOnFromScratch) : true,
        isTrashed: false,
      },
    });

    await logActivity({
      action: "PRODUCT_CREATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { productId: product.id, title, category, pricePerSqFt },
    });

    revalidateTag("products");
    revalidateTag("pages");
    revalidatePath("/");
    revalidatePath("/from-scratch");

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const body = await request.json();
    const { id, action } = body;

    if (!id && action !== "empty-trash") {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    // Action: Restore trashed product(s)
    if (action === "restore") {
      const ids: string[] = body.ids || (body.id ? [body.id] : []);
      if (ids.length === 0) {
        return NextResponse.json({ error: "Product ID(s) required." }, { status: 400 });
      }

      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: {
          isTrashed: false,
          trashedAt: null,
        },
      });

      await logActivity({
        action: "PRODUCTS_BULK_RESTORED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: ids.length },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    // Action: Soft delete (Move to Trash) for one or multiple products
    if (action === "trash") {
      const ids: string[] = body.ids || (body.id ? [body.id] : []);
      if (ids.length === 0) {
        return NextResponse.json({ error: "Product ID(s) required." }, { status: 400 });
      }

      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: {
          isTrashed: true,
          trashedAt: new Date(),
        },
      });

      await logActivity({
        action: "PRODUCTS_BULK_TRASHED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: ids.length },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    // Action: Update product details
    const { title, slug, description, category, sampleImageUrl, pricePerSqFt, specs, showOnCustomize, showOnFromScratch } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        category,
        sampleImageUrl,
        pricePerSqFt: parseFloat(pricePerSqFt),
        specs: typeof specs === "string" ? specs : JSON.stringify(specs || {}),
        showOnCustomize: showOnCustomize !== undefined ? Boolean(showOnCustomize) : undefined,
        showOnFromScratch: showOnFromScratch !== undefined ? Boolean(showOnFromScratch) : undefined,
      },
    });

    await logActivity({
      action: "PRODUCT_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { productId: id, title, category },
    });

    revalidateTag("products");
    revalidateTag("pages");
    revalidatePath("/");
    revalidatePath("/from-scratch");

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    let permanent = searchParams.get("permanent") === "true";
    const action = searchParams.get("action");

    // Action: Empty entire trash
    if (action === "empty-trash") {
      const deleteResult = await prisma.product.deleteMany({
        where: { isTrashed: true },
      });

      await logActivity({
        action: "TRASH_EMPTIED",
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
      return NextResponse.json({ error: "Product ID(s) required." }, { status: 400 });
    }

    if (permanent) {
      // Hard delete from SQLite database
      const deleteResult = await prisma.product.deleteMany({
        where: { id: { in: ids } },
      });

      await logActivity({
        action: "PRODUCTS_PERMANENTLY_DELETED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: deleteResult.count },
      });

      return NextResponse.json({ success: true, permanent: true, count: deleteResult.count });
    } else {
      // Soft delete: Move to trash
      const updateResult = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: {
          isTrashed: true,
          trashedAt: new Date(),
        },
      });

      await logActivity({
        action: "PRODUCTS_TRASHED",
        userId: adminUser.id,
        userEmail: adminUser.email,
        details: { ids, count: updateResult.count },
      });

      return NextResponse.json({ success: true, permanent: false, count: updateResult.count });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
