import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

interface Token {
  id?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // If it's an admin route, check for admin authentication
  if (path.startsWith("/admin")) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as Token | null;

    // If not authenticated or not admin, redirect to sign-in
    if (!session || !session.isAdmin) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  // If it's a user route, check for user authentication
  if (path.startsWith("/user")) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as Token | null;

    // If not authenticated, redirect to sign-in
    if (!session) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Specify the paths that should be checked by the middleware
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
}; 