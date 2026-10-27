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
    <main className="min-h-screen bg-[#f4f3f2] flex flex-col justify-between selection:bg-stone-300 selection:text-stone-900">
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
