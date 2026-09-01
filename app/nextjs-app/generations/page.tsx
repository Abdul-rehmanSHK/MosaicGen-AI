import React from "react";
import { prisma } from "@/lib/prisma";
import { GenerationsManagerClient } from "./GenerationsManagerClient";

export const revalidate = 0;

export default async function NextAppGenerationsPage() {
  const generations = await prisma.aIGeneration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
    },
  });

  const products = await prisma.product.findMany({
    select: { id: true, title: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">AI Studio Generations Gallery & Control</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Inspect user/client AI renderings, edit prompt vision or placement classifications, filter by space, or remove records.
        </p>
      </div>

      <GenerationsManagerClient initialGenerations={generations} products={products} />
    </div>
  );
}
