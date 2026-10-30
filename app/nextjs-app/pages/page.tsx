import React from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_STUDIO_PAGES } from "@/lib/defaultPages";
import { PagesManagerClient } from "./PagesManagerClient";

export const revalidate = 0;

export default async function AdminPagesPage() {
  // Ensure the 3 primary studio pages exist in database
  for (const def of DEFAULT_STUDIO_PAGES) {
    const existing = await prisma.page.findUnique({ where: { slug: def.slug } });
    if (!existing) {
      await prisma.page.create({
        data: {
          title: def.title,
          slug: def.slug,
          templateType: def.templateType,
          heading: def.heading,
          bodyText: def.bodyText,
          secondaryText: def.secondaryText,
        },
      });
    }
  }

  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Pages Content CMS</h1>
        <p className="text-sm text-stone-500 mt-1">
          Customize live studio page headlines, descriptions, and category badges. All products across all pages are managed directly in the Products Catalog.
        </p>
      </div>

      <PagesManagerClient initialPages={pages} />
    </div>
  );
}
