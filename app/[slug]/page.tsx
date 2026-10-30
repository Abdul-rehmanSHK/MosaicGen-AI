import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HeroShowcaseTemplate } from "@/components/templates/HeroShowcaseTemplate";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function DynamicSlugPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch page record from Prisma DB
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page) {
    notFound();
  }

  // Products come directly from the Product Catalog as the single source of truth
  const products = await prisma.product.findMany({
    where: { isTrashed: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f4f3f2] flex flex-col justify-between selection:bg-stone-300 selection:text-stone-900">
      <Navbar />

      <div className="flex-1">
        <HeroShowcaseTemplate page={page} products={products} />
      </div>

      <Footer />
    </main>
  );
}
