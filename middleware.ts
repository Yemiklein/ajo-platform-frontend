import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// const publicRoutes = ["/login", "/register"];
const publicRoutes = ["/login", "/register", "/register-admin", "/payments/callback"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("ajo_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Not logged in + trying to access protected page → redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in + trying to access login/register → redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};