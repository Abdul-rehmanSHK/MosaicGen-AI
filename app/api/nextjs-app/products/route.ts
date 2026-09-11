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

export async function POST(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { title, slug, description, category, sampleImageUrl, pricePerSqFt, specs } = body;

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
      },
    });

    await logActivity({
      action: "PRODUCT_CREATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { productId: product.id, title, category, pricePerSqFt },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { id, title, slug, description, category, sampleImageUrl, pricePerSqFt, specs } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

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
      },
    });

    await logActivity({
      action: "PRODUCT_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { productId: id, title, category },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required." }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    await logActivity({
      action: "PRODUCT_DELETED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { productId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
