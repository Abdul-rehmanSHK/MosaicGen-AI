import React from "react";
import { prisma } from "@/lib/prisma";
import { PagesManagerClient } from "./PagesManagerClient";

export const revalidate = 0;

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Pages Content CMS</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Customize live architectural showcase pages, edit headlines, descriptions, hero imagery, and select the exact mosaic products to showcase at the bottom of each page.
        </p>
      </div>

      <PagesManagerClient initialPages={pages} availableProducts={products} />
    </div>
  );
}
