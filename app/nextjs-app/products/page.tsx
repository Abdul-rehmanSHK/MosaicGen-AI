import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsManagerClient } from "@/app/admin/products/ProductsManagerClient";

export const revalidate = 0;

export default async function NextAppProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Mosaic Products Catalog</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage mosaic texture references, material specs, pricing per square foot, and sample imagery.
        </p>
      </div>

      <ProductsManagerClient initialProducts={products} />
    </div>
  );
}
