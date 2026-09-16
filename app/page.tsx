import { getCachedProducts } from "@/lib/cache";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { redirect } from "next/navigation";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: { mode?: string; product?: string; prompt?: string; placement?: string };
}) {
  if (searchParams.mode === "scratch") {
    const params = new URLSearchParams();
    if (searchParams.product) params.set("product", searchParams.product);
    if (searchParams.prompt) params.set("prompt", searchParams.prompt);
    if (searchParams.placement) params.set("placement", searchParams.placement);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    redirect(`/from-scratch${queryString}`);
  }

  const products = await getCachedProducts();

  const initialProductId = searchParams.product;

  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col justify-between selection:bg-gold-500 selection:text-obsidian-950">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <DesignStudio 
          initialProducts={products} 
          startFromScratch={false} 
          initialSelectedProductId={initialProductId} 
        />
      </div>

      <Footer />
    </main>
  );
}
