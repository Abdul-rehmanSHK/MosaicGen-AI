import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassicGridTemplate } from "@/components/templates/ClassicGridTemplate";
import { HeroShowcaseTemplate } from "@/components/templates/HeroShowcaseTemplate";
import { SplitGalleryTemplate } from "@/components/templates/SplitGalleryTemplate";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

  // Parse featured products selected for this page
  let selectedIds: string[] = [];
  try {
    if (page.featuredProductIds) {
      selectedIds = JSON.parse(page.featuredProductIds);
    }
  } catch (e) {
    selectedIds = [];
  }

  let products;
  if (selectedIds.length > 0) {
    const fetched = await prisma.product.findMany({
      where: {
        id: { in: selectedIds },
        isTrashed: false,
      },
    });
    const ordered = selectedIds
      .map((id) => fetched.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    if (ordered.length < 4) {
      const remaining = await prisma.product.findMany({
        where: {
          id: { notIn: selectedIds },
          isTrashed: false,
        },
        take: 4 - ordered.length,
        orderBy: { createdAt: "desc" },
      });
      products = [...ordered, ...remaining];
    } else {
      products = ordered;
    }
  } else {
    products = await prisma.product.findMany({
      where: { isTrashed: false },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col">
      <Navbar />

      <div className="flex-1">
        {page.templateType === "classic_grid" && (
          <ClassicGridTemplate page={page} products={products} />
        )}

        {page.templateType === "hero_showcase" && (
          <HeroShowcaseTemplate page={page} products={products} />
        )}

        {page.templateType === "split_gallery" && (
          <SplitGalleryTemplate page={page} products={products} />
        )}
      </div>

      <Footer />
    </main>
  );
}
