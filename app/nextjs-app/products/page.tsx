import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsManagerClient } from "./ProductsManagerClient";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, rawSubmissions] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.finderResult.findMany({
      where: {
        resultImageUrl: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const serializedSubmissions = rawSubmissions.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Products Catalog & Aesthetic Styles
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Single unified management for mosaic designs, aesthetic reference styles, surface placements, material specs, and pricing.
        </p>
      </div>

      <ProductsManagerClient
        initialProducts={products}
        initialSubmissions={serializedSubmissions}
      />
    </div>
  );
}
