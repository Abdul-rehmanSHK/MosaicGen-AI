import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy /admin to /nextjs-app
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const targetPath = pathname.replace(/^\/admin/, "/nextjs-app");
    const adminUrl = new URL(targetPath, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Protect /nextjs-app studio routes
  if (pathname.startsWith("/nextjs-app")) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.AUTH_SECRET || "ai-mosaic-luxury-studio-secret-key-2026-super-secure" 
    });

    // Both ADMIN and CONTENT_EDITOR can access the studio app
    if (!token || (token.role !== "ADMIN" && token.role !== "CONTENT_EDITOR")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Role Restriction: CONTENT_EDITOR can only access content editors
    // (Pages Content CMS, Aesthetic Finder CMS, Media Library, Products Catalog)
    // Non-content routes (Users & Roles, Client Inquiries, AI Generations, Dashboard Analytics) redirect to /nextjs-app/pages
    if (token.role === "CONTENT_EDITOR") {
      const adminOnlyPaths = [
        "/nextjs-app/users",
        "/nextjs-app/inquiries",
        "/nextjs-app/generations",
      ];
      const isExactRoot = pathname === "/nextjs-app" || pathname === "/nextjs-app/";
      const isRestricted = isExactRoot || adminOnlyPaths.some((p) => pathname.startsWith(p));

      if (isRestricted) {
        const pagesUrl = new URL("/nextjs-app/pages", request.url);
        return NextResponse.redirect(pagesUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/nextjs-app/:path*", "/nextjs-app", "/admin/:path*", "/admin"],
};
