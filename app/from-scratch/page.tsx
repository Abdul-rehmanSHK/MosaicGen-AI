import { getCachedPageProducts } from "@/lib/cache";
import { DesignStudio } from "@/components/studio/DesignStudio";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function FromScratchPage({
  searchParams,
}: {
  searchParams: { product?: string; prompt?: string; placement?: string; verified?: string };
}) {
  const products = await getCachedPageProducts("from-scratch");

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
