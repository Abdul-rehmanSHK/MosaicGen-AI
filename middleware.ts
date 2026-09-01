import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy /admin or /next-app to /nextjs-app
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/next-app" ||
    pathname.startsWith("/next-app/")
  ) {
    const targetPath = pathname
      .replace(/^\/admin/, "/nextjs-app")
      .replace(/^\/next-app/, "/nextjs-app");
    const nextJsAppUrl = new URL(targetPath, request.url);
    return NextResponse.redirect(nextJsAppUrl);
  }

  // Protect /nextjs-app routes (except /nextjs-app/login)
  if (pathname.startsWith("/nextjs-app") && !pathname.startsWith("/nextjs-app/login")) {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      const loginUrl = new URL("/nextjs-app/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/next-app/:path*", "/next-app", "/nextjs-app/:path*", "/nextjs-app"],
};
