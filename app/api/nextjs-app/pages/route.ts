import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    await verifyEditorOrAdmin();
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch pages" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const body = await request.json();
    const { title, slug, templateType, heading, bodyText, heroImageUrl, secondaryText, featuredProductIds } = body;

    if (!title || !slug || !templateType || !heading || !bodyText) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

    const page = await prisma.page.create({
      data: {
        title,
        slug: cleanSlug,
        templateType,
        heading,
        bodyText,
        heroImageUrl: heroImageUrl || null,
        secondaryText: secondaryText || null,
        featuredProductIds: typeof featuredProductIds === "string" ? featuredProductIds : JSON.stringify(featuredProductIds || []),
      },
    });

    await logActivity({
      action: "PAGE_CREATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { pageId: page.id, title, slug: cleanSlug, templateType },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create page" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const body = await request.json();
    const { id, title, slug, templateType, heading, bodyText, heroImageUrl, secondaryText, featuredProductIds } = body;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required." }, { status: 400 });
    }

    const cleanSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") : undefined;

    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        ...(cleanSlug ? { slug: cleanSlug } : {}),
        templateType,
        heading,
        bodyText,
        heroImageUrl: heroImageUrl !== undefined ? (heroImageUrl || null) : undefined,
        secondaryText: secondaryText !== undefined ? (secondaryText || null) : undefined,
        featuredProductIds: featuredProductIds !== undefined ? (typeof featuredProductIds === "string" ? featuredProductIds : JSON.stringify(featuredProductIds || [])) : undefined,
      },
    });

    await logActivity({
      action: "PAGE_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { pageId: id, title, slug: cleanSlug, templateType },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyEditorOrAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Page ID required." }, { status: 400 });
    }

    const page = await prisma.page.findUnique({ where: { id } });
    await prisma.page.delete({ where: { id } });

    await logActivity({
      action: "PAGE_DELETED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { pageId: id, title: page?.title },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete page" }, { status: 500 });
  }
}
