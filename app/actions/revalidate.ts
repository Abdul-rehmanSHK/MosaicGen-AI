"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Server Action to invalidate the mosaic products catalog cache.
 * Called immediately when an admin adds, edits, or archives a product in the catalog.
 */
export async function revalidateProductsAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    // 1. Invalidate all tagged queries relying on 'products'
    revalidateTag("products");

    // 2. Purge path-based pages that render product showcases
    revalidatePath("/");
    revalidatePath("/from-scratch");
    revalidatePath("/finder");
    revalidatePath("/nextjs-app/products");

    return {
      success: true,
      tag: "products",
      revalidatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Revalidation error:", error);
    return {
      success: false,
      error: error?.message || "Failed to revalidate products cache.",
    };
  }
}

/**
 * Server Action to invalidate dynamic architectural CMS pages.
 * Called when an admin updates page copy, layout template, or hero images.
 */
export async function revalidatePagesAction(slug?: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    revalidateTag("pages");
    if (slug) {
      revalidateTag(`page-${slug}`);
      revalidatePath(`/${slug}`);
    }
    revalidatePath("/");
    revalidatePath("/nextjs-app/pages");

    return {
      success: true,
      tag: "pages",
      revalidatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Pages revalidation error:", error);
    return {
      success: false,
      error: error?.message || "Failed to revalidate pages cache.",
    };
  }
}

/**
 * Complete Global Cache Flush (e.g., after full catalog sync or site-wide theme change)
 */
export async function revalidateAllAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized. Super Admin session required." };
  }

  try {
    revalidateTag("products");
    revalidateTag("pages");
    revalidatePath("/", "layout");

    return {
      success: true,
      revalidatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Global revalidation error:", error);
    return {
      success: false,
      error: error?.message || "Failed to flush global cache.",
    };
  }
}
