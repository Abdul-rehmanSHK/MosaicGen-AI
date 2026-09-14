import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { getSiteAppearance } from "@/lib/appearance";

async function verifyEditorOrAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "CONTENT_EDITOR")) {
    throw new Error("Unauthorized: Access restricted to ADMIN and CONTENT_EDITOR");
  }
  return session.user;
}

// GET: Retrieve current site appearance settings
export async function GET() {
  try {
    await verifyEditorOrAdmin();
    const appearance = await getSiteAppearance();
    return NextResponse.json({ success: true, appearance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch appearance" }, { status: 401 });
  }
}

// PUT: Update header, footer, logo, and menu configuration
export async function PUT(request: Request) {
  try {
    const user = await verifyEditorOrAdmin();
    const body = await request.json();

    const {
      headerBrandName,
      headerTagline,
      headerLogoUrl,
      headerMenuJson,
      footerBrandName,
      footerDescription,
      footerLogoUrl,
      footerCopyright,
      footerContactEmail,
      footerContactPhone,
      footerAddress,
      footerLinksJson,
      socialLinksJson,
    } = body;

    const updated = await prisma.siteAppearance.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        headerBrandName: headerBrandName || "MEC AI MOSAIC",
        headerTagline: headerTagline || "Bespoke Surface Studio",
        headerLogoUrl: headerLogoUrl !== undefined ? (headerLogoUrl || null) : null,
        headerMenuJson: typeof headerMenuJson === "string" ? headerMenuJson : JSON.stringify(headerMenuJson || []),
        footerBrandName: footerBrandName || "MEC AI MOSAIC STUDIO",
        footerDescription: footerDescription || "",
        footerLogoUrl: footerLogoUrl !== undefined ? (footerLogoUrl || null) : null,
        footerCopyright: footerCopyright || "© 2026 MEC Artworks Studio. All Rights Reserved.",
        footerContactEmail: footerContactEmail || null,
        footerContactPhone: footerContactPhone || null,
        footerAddress: footerAddress || null,
        footerLinksJson: typeof footerLinksJson === "string" ? footerLinksJson : JSON.stringify(footerLinksJson || []),
        socialLinksJson: typeof socialLinksJson === "string" ? socialLinksJson : JSON.stringify(socialLinksJson || {}),
      },
      update: {
        ...(headerBrandName !== undefined ? { headerBrandName } : {}),
        ...(headerTagline !== undefined ? { headerTagline } : {}),
        ...(headerLogoUrl !== undefined ? { headerLogoUrl: headerLogoUrl || null } : {}),
        ...(headerMenuJson !== undefined ? { headerMenuJson: typeof headerMenuJson === "string" ? headerMenuJson : JSON.stringify(headerMenuJson) } : {}),
        ...(footerBrandName !== undefined ? { footerBrandName } : {}),
        ...(footerDescription !== undefined ? { footerDescription } : {}),
        ...(footerLogoUrl !== undefined ? { footerLogoUrl: footerLogoUrl || null } : {}),
        ...(footerCopyright !== undefined ? { footerCopyright } : {}),
        ...(footerContactEmail !== undefined ? { footerContactEmail: footerContactEmail || null } : {}),
        ...(footerContactPhone !== undefined ? { footerContactPhone: footerContactPhone || null } : {}),
        ...(footerAddress !== undefined ? { footerAddress: footerAddress || null } : {}),
        ...(footerLinksJson !== undefined ? { footerLinksJson: typeof footerLinksJson === "string" ? footerLinksJson : JSON.stringify(footerLinksJson) } : {}),
        ...(socialLinksJson !== undefined ? { socialLinksJson: typeof socialLinksJson === "string" ? socialLinksJson : JSON.stringify(socialLinksJson) } : {}),
      },
    });

    await logActivity({
      action: "SITE_APPEARANCE_UPDATED",
      userId: user.id,
      userEmail: user.email,
      details: {
        headerBrandName,
        headerLogoUrl,
        footerBrandName,
        footerLogoUrl,
      },
    });

    return NextResponse.json({ success: true, appearance: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update appearance" }, { status: 500 });
  }
}
