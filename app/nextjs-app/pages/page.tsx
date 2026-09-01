import React from "react";
import { prisma } from "@/lib/prisma";
import { PagesManagerClient } from "@/app/admin/pages/PagesManagerClient";

export const revalidate = 0;

export default async function NextAppPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Dynamic CMS Page Manager</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Create dynamic architectural pages and select from 3 strict layout templates: classic_grid, hero_showcase, or split_gallery.
        </p>
      </div>

      <PagesManagerClient initialPages={pages} />
    </div>
  );
}
