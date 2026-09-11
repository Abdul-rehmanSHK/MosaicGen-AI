import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy /admin to /nextjs-app (just in case)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const targetPath = pathname.replace(/^\/admin/, "/nextjs-app");
    const adminUrl = new URL(targetPath, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Protect /nextjs-app routes
  if (pathname.startsWith("/nextjs-app")) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.AUTH_SECRET || "ai-mosaic-luxury-studio-secret-key-2026-super-secure" 
    });

    if (!token || (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/nextjs-app/:path*", "/nextjs-app", "/admin/:path*", "/admin"],
};
