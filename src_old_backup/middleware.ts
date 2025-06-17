import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Als de gebruiker is ingelogd en probeert naar login/register te gaan
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
    ) {
      return NextResponse.redirect(new URL("/ask", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/ask/:path*", "/profile/:path*", "/admin/:path*", "/login", "/register"],
}; 