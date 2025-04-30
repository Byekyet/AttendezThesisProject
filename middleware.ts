import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Pages that don't require authentication
const publicPaths = ["/", "/login", "/register"];

// All dashboard and protected paths
const protectedPaths = [
  "/dashboard",
  "/attendance",
  "/courses",
  "/profile",
  "/request",
  "/mark",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Special case for API routes
  if (pathname.startsWith("/api/")) {
    // Allow NextAuth API routes through without redirects
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // For other API routes, check token but don't redirect
    const token = await getToken({ req: request });
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.next();
  }

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If the path requires authentication and the user is not authenticated
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and tries to access auth pages
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Paths that require middleware
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
