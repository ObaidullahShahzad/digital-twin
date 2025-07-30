// middleware.tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const success = request.nextUrl.searchParams.get("success");
  const session = request.nextUrl.searchParams.get("session");
  const url = request.nextUrl.clone();

  console.log(
    "Middleware: Pathname:",
    request.nextUrl.pathname,
    "Token:",
    token || "none",
    "Query:",
    request.nextUrl.search,
    "Full URL:",
    url.toString(),
    "Timestamp:",
    new Date().toISOString()
  );

  const publicRoutes = ["/signin", "/login", "/api/login/google"];

  // Allow OAuth callback to proceed to /
  if (request.nextUrl.pathname === "/" && success === "true" && session) {
    console.log("Middleware: Allowing OAuth callback to /");
    return NextResponse.next();
  }

  // Allow public routes without token
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    console.log("Middleware: Allowing public route:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Redirect unauthenticated users to /signin
  if (!token) {
    console.log(
      "Middleware: Redirecting unauthenticated user to /signin from:",
      url.toString()
    );
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  console.log("Middleware: Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
