import { prisma } from "@/lib/prisma";

export interface MenuLinkItem {
  id?: string;
  label: string;
  url: string;
  external?: boolean;
}

export interface SiteAppearanceData {
  id: string;
  headerBrandName: string;
  headerTagline: string;
  headerLogoUrl: string | null;
  headerMenuJson: string;
  footerBrandName: string;
  footerDescription: string;
  footerLogoUrl: string | null;
  footerCopyright: string;
  footerContactEmail: string | null;
  footerContactPhone: string | null;
  footerAddress: string | null;
  footerLinksJson: string;
  socialLinksJson: string | null;
  updatedAt: Date | string;
}

export const DEFAULT_HEADER_MENU: MenuLinkItem[] = [
  { label: "Customize your space", url: "/" },
  { label: "Imagine from scratch", url: "/from-scratch" },
  { label: "Find your aesthetic", url: "/finder" },
  { label: "Contact Us", url: "https://zakiahmarble.com/contact-us/", external: true },
];

export const DEFAULT_FOOTER_LINKS: MenuLinkItem[] = [
  { label: "Customize your space", url: "/" },
  { label: "Imagine from scratch", url: "/from-scratch" },
  { label: "Find your aesthetic", url: "/finder" },
  { label: "Contact Us", url: "https://zakiahmarble.com/contact-us/", external: true },
];

export async function getSiteAppearance(): Promise<SiteAppearanceData> {
  try {
    let appearance = await prisma.siteAppearance.findUnique({
      where: { id: "default" },
    });

    if (!appearance) {
      appearance = await prisma.siteAppearance.create({
        data: {
          id: "default",
          headerBrandName: "MEC AI MOSAIC",
          headerTagline: "Bespoke Surface Studio",
          headerLogoUrl: null,
          headerMenuJson: JSON.stringify(DEFAULT_HEADER_MENU),
          footerBrandName: "MEC AI MOSAIC STUDIO",
          footerDescription:
            "Pioneering luxury architectural surface design with AI-powered inpainting, custom waterjet mesh manufacturing, and Italian marble artistry.",
          footerLogoUrl: null,
          footerCopyright: "© 2026 MEC Artworks Studio. All Rights Reserved.",
          footerContactEmail: "concierge@mecartworks.com",
          footerContactPhone: "+1 (800) 555-MOSAIC",
          footerAddress: "Carrara, Italy & NY, USA",
          footerLinksJson: JSON.stringify(DEFAULT_FOOTER_LINKS),
          socialLinksJson: JSON.stringify({
            instagram: "https://instagram.com",
            pinterest: "https://pinterest.com",
            linkedin: "https://linkedin.com",
          }),
        },
      });
    }

    return appearance;
  } catch (error) {
    console.error("Error retrieving site appearance:", error);
    // Safe fallback if database isn't ready
    return {
      id: "default",
      headerBrandName: "MEC AI MOSAIC",
      headerTagline: "Bespoke Surface Studio",
      headerLogoUrl: null,
      headerMenuJson: JSON.stringify(DEFAULT_HEADER_MENU),
      footerBrandName: "MEC AI MOSAIC STUDIO",
      footerDescription:
        "Pioneering luxury architectural surface design with AI-powered inpainting, custom waterjet mesh manufacturing, and Italian marble artistry.",
      footerLogoUrl: null,
      footerCopyright: "© 2026 MEC Artworks Studio. All Rights Reserved.",
      footerContactEmail: "concierge@mecartworks.com",
      footerContactPhone: "+1 (800) 555-MOSAIC",
      footerAddress: "Carrara, Italy & NY, USA",
      footerLinksJson: JSON.stringify(DEFAULT_FOOTER_LINKS),
      socialLinksJson: JSON.stringify({}),
      updatedAt: new Date(),
    };
  }
}
