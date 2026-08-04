/**
 * @file middleware.ts
 * @description Next.js 16 Edge Middleware for HTTP request interception.
 * @purpose Handles CORS headers, request logging, and prepares requests before hitting Route Handlers.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept API routes only
  if (pathname.startsWith("/api/")) {
    // Enable CORS for API routes
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle Preflight OPTIONS Request
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    // TODO: Add Clerk / Supabase Auth session token verification logic here
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
