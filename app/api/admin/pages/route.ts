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
    const { title, slug, templateType, heading, bodyText, heroImageUrl, secondaryText } = body;

    if (!title || !slug || !templateType || !heading || !bodyText) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        templateType,
        heading,
        bodyText,
        heroImageUrl: heroImageUrl || null,
        secondaryText: secondaryText || null,
      },
    });

    await logActivity({
      action: "PAGE_CREATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { pageId: page.id, title, slug, templateType },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create page" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const body = await request.json();
    const { id, title, slug, templateType, heading, bodyText, heroImageUrl, secondaryText } = body;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required." }, { status: 400 });
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        templateType,
        heading,
        bodyText,
        heroImageUrl: heroImageUrl || null,
        secondaryText: secondaryText || null,
      },
    });

    await logActivity({
      action: "PAGE_UPDATED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { pageId: id, title, slug, templateType },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Page ID required." }, { status: 400 });
    }

    await prisma.page.delete({ where: { id } });

    await logActivity({
      action: "PAGE_DELETED",
      userId: adminUser.id,
      userEmail: adminUser.email,
      details: { pageId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete page" }, { status: 500 });
  }
}
