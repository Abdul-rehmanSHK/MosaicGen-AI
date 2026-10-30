import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_STUDIO_PAGES } from "@/lib/defaultPages";

/**
 * 1. Cached Products Catalog (Next.js 15 Tagged Caching)
 * Tagged with 'products' for instant on-demand cache invalidation via revalidateTag('products').
 */
export const getCachedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { isTrashed: false },
      orderBy: { createdAt: "desc" },
    });
  },
  ["cached-products-catalog-v2"],
  {
    tags: ["products"],
    revalidate: 60, // Revalidate every minute
  }
);

/**
 * 2. Cached Dynamic Architectural Pages
 * Tagged with 'pages' for instant revalidation when CMS editors modify layout/content.
 */
export const getCachedPages = unstable_cache(
  async () => {
    return prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
  ["cached-dynamic-pages-v2"],
  {
    tags: ["pages"],
    revalidate: 60,
  }
);

/**
 * 3. Cached Single Page by Slug
 */
export async function getCachedPageBySlug(slug: string) {
  return unstable_cache(
    async () => {
      let page = await prisma.page.findUnique({
        where: { slug },
      });

      if (!page) {
        const def = DEFAULT_STUDIO_PAGES.find((p) => p.slug === slug);
        if (def) {
          try {
            page = await prisma.page.create({
              data: {
                title: def.title,
                slug: def.slug,
                templateType: def.templateType,
                heading: def.heading,
                bodyText: def.bodyText,
                secondaryText: def.secondaryText,
              },
            });
          } catch (e) {
            console.error("Auto-seed error for page slug", slug, e);
          }
        }
      }

      return page;
    },
    [`cached-page-${slug}-v3`],
    {
      tags: ["pages", `page-${slug}`],
      revalidate: 60,
    }
  )();
}

/**
 * 4. Cached Page-Specific Products (Product Catalog as Single Source of Truth)
 * Products across all pages come directly from the Product Catalog.
 */
export async function getCachedPageProducts(pageSlug: "customize-space" | "from-scratch") {
  return unstable_cache(
    async () => {
      const whereFilter =
        pageSlug === "customize-space"
          ? { isTrashed: false, showOnCustomize: true }
          : { isTrashed: false, showOnFromScratch: true };

      let products = await prisma.product.findMany({
        where: whereFilter,
        orderBy: { createdAt: "desc" },
      });

      // Fallback: If no products have the specific flag, return all active catalog products
      if (products.length === 0) {
        products = await prisma.product.findMany({
          where: { isTrashed: false },
          orderBy: { createdAt: "desc" },
        });
      }

      return products;
    },
    [`cached-page-products-${pageSlug}-v3`],
    {
      tags: ["products"],
      revalidate: 60,
    }
  )();
}
