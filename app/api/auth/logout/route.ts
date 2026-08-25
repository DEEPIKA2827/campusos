/**
 * @file app/api/auth/logout/route.ts
 * @description Next.js 16 Route Handler for User Logout / Session Termination.
 * @purpose Clears the auth_session HTTP-only cookie and ends the client session.
 */

import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * POST /api/auth/logout
 * Terminates user session.
 */
export async function POST() {
  Logger.info("POST /api/auth/logout requested");

  const response = ResponseBuilder.success(null, "Logged out successfully", 200);
  clearAuthCookie(response);

  return response;
}
