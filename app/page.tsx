import React from "react";
import { prisma } from "@/lib/prisma";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 0;

export default async function StudioPage({
  searchParams,
}: {
  searchParams: { mode?: string, product?: string };
}) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const isScratchMode = searchParams.mode === "scratch";
  const initialProductId = searchParams.product;

  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <DesignStudio 
          initialProducts={products} 
          startFromScratch={isScratchMode} 
          initialSelectedProductId={initialProductId} 
        />
      </div>

      <Footer />
    </main>
  );
}
