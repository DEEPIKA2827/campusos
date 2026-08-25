/**
 * @file app/api/scholarships/[id]/route.ts
 * @description Next.js 16 Route Handler for Scholarship Details.
 * @purpose Exposes GET endpoint returning details for a single scholarship.
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
 * GET /api/scholarships/[id]
 * Retrieves details for a specific scholarship.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    Logger.info("GET /api/scholarships/[id] requested", {
      userId: session.userId,
      scholarshipId,
    });

    const scholarship = await scholarshipService.getScholarshipById(scholarshipId);

    return ResponseBuilder.success(scholarship, "Scholarship retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/scholarships/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving scholarship details.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
