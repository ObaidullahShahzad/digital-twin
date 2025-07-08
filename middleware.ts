import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/api/login/google"];

  // If the user is not authenticated and trying to access a protected route
  if (!token && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the user is authenticated and trying to access the login page, redirect to /bots
  if (token && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/bots", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
