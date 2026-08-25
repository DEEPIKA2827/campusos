/**
 * @file app/api/scholarships/[id]/bookmark/route.ts
 * @description Next.js 16 Route Handler for Removing Scholarship Bookmarks.
 * @purpose Exposes DELETE endpoint to remove a scholarship bookmark for the authenticated student.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { scholarshipService } from "@/services/scholarship.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/scholarships/[id]/bookmark
 * Removes a scholarship bookmark for the authenticated student.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const scholarshipId = Number(id);

    if (!Number.isInteger(scholarshipId) || scholarshipId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Scholarship ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("DELETE /api/scholarships/[id]/bookmark requested", {
      userId: session.userId,
      scholarshipId,
    });

    await scholarshipService.removeBookmark(session.userId, scholarshipId);

    return ResponseBuilder.success({ removed: true }, "Scholarship bookmark removed successfully.", 200);
  } catch (error: unknown) {
    Logger.error("DELETE /api/scholarships/[id]/bookmark failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while removing scholarship bookmark.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
