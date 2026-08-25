/**
 * @file app/api/assessments/cie/route.ts
 * @description Next.js 16 Route Handler for Course CIE Assessment Definitions.
 * @purpose Exposes GET endpoint listing all CIE assessments under a given course.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { assessmentService } from "@/services/assessment.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/assessments/cie
 * Lists all CIE assessment definitions for a course. Requires courseId query parameter.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const courseIdParam = searchParams.get("courseId");

    if (!courseIdParam) {
      return ResponseBuilder.error(
        "Validation Error: Course ID query parameter is required.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const courseId = Number(courseIdParam);
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Course ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("GET /api/assessments/cie requested", { userId: session.userId, courseId });
    const assessments = await assessmentService.listCieAssessments(courseId);

    return ResponseBuilder.success(assessments, "CIE assessments retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/assessments/cie failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving CIE assessments.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
