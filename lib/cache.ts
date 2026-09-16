import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

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
  ["cached-products-catalog"],
  {
    tags: ["products"],
    revalidate: 3600, // Revalidate in background every hour if no manual tag purge occurred
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
  ["cached-dynamic-pages"],
  {
    tags: ["pages"],
    revalidate: 3600,
  }
);

/**
 * 3. Cached Single Page by Slug
 */
export async function getCachedPageBySlug(slug: string) {
  return unstable_cache(
    async () => {
      return prisma.page.findUnique({
        where: { slug },
      });
    },
    [`cached-page-${slug}`],
    {
      tags: ["pages", `page-${slug}`],
      revalidate: 3600,
    }
  )();
}
