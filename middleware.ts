// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./src/lib/jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run the middleware for protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/payment")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const subscriptionExpires = payload.subscriptionExpires;
    if (!subscriptionExpires) {
      return NextResponse.redirect(new URL("/payment", req.url));
    }
    if (new Date(subscriptionExpires) < new Date()) {
      return NextResponse.redirect(new URL("/payment", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*"],
};
