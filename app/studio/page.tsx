import React from "react";
import { prisma } from "@/lib/prisma";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const revalidate = 0;

export default async function StudioPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col justify-between">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <DesignStudio initialProducts={products} />
      </div>

      <Footer />
    </main>
  );
}
