/**
 * @file app/api/scholarships/bookmarks/route.ts
 * @description Next.js 16 Route Handler for Retrieving Student's Bookmarked Scholarships.
 * @purpose Exposes GET endpoint returning all bookmarked scholarships for authenticated student.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { scholarshipService } from "@/services/scholarship.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/scholarships/bookmarks
 * Retrieves all scholarships bookmarked by the authenticated student.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    Logger.info("GET /api/scholarships/bookmarks requested", { userId: session.userId });

    const bookmarks = await scholarshipService.getUserBookmarks(session.userId);

    return ResponseBuilder.success(bookmarks, "Bookmarked scholarships retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/scholarships/bookmarks failed", error);
    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving bookmarked scholarships.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
