/**
 * @file app/api/scholarships/bookmark/route.ts
 * @description Next.js 16 Route Handler for Bookmarking Scholarships.
 * @purpose Exposes POST endpoint to bookmark a scholarship for the authenticated student.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { scholarshipService } from "@/services/scholarship.service";
import { ScholarshipValidation } from "@/validations/scholarship.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * POST /api/scholarships/bookmark
 * Creates a scholarship bookmark for the authenticated student.
 */
export async function POST(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return ResponseBuilder.error(
        "Validation Error: Request body must be a valid JSON object.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const validation = ScholarshipValidation.validateBookmarkInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("POST /api/scholarships/bookmark requested", {
      userId: session.userId,
      scholarshipId: validation.data.scholarshipId,
    });

    const result = await scholarshipService.bookmarkScholarship(session.userId, validation.data);

    return ResponseBuilder.success(result, "Scholarship bookmarked successfully.", 200);
  } catch (error: unknown) {
    Logger.error("POST /api/scholarships/bookmark failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while bookmarking scholarship.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
