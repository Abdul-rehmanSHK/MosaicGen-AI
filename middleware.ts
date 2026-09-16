import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { globalRateLimiter } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // 1. IP-Based Blanket Rate Limiting (Upstash Redis)
  // ---------------------------------------------------------------------------
  // Skip rate limiting for static files, media uploads, and internal assets
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (!isStaticAsset) {
    const ip =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { success, limit, remaining, reset } = await globalRateLimiter.limit(ip);

    if (!success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return new NextResponse(
        JSON.stringify({
          error: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Too many requests from this IP address.",
          retryAfter: retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfterSeconds.toString(),
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Legacy Route Redirection
  // ---------------------------------------------------------------------------
  // Redirect legacy /admin to /nextjs-app
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const targetPath = pathname.replace(/^\/admin/, "/nextjs-app");
    const adminUrl = new URL(targetPath, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // ---------------------------------------------------------------------------
  // 3. Admin & Content Editor Studio Protection (Auth.js)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/nextjs-app")) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET || "ai-mosaic-luxury-studio-secret-key-2026-super-secure",
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
  matcher: [
    /*
     * Match all paths except internal Next.js static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
