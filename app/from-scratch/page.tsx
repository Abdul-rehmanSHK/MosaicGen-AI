import React from "react";
import { prisma } from "@/lib/prisma";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 0;

export default async function FromScratchPage({
  searchParams,
}: {
  searchParams: { product?: string; prompt?: string; placement?: string; verified?: string };
}) {
  const products = await prisma.product.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950">
      <Navbar />

      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <DesignStudio 
          initialProducts={products} 
          startFromScratch={true} 
          initialSelectedProductId={searchParams.product} 
        />
      </div>

      <Footer />
    </main>
  );
}
