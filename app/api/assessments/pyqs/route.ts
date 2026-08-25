/**
 * @file app/api/assessments/pyqs/route.ts
 * @description Next.js 16 Route Handler for Course Previous-Year Questions (PYQs).
 * @purpose Exposes GET endpoint with courseId requirement and optional difficulty/year filters.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { assessmentService } from "@/services/assessment.service";
import { AssessmentValidation } from "@/validations/assessment.validation";
import { Difficulty } from "@/types/api.types";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/assessments/pyqs
 * Retrieves previous-year questions for a course with optional difficulty and year filters.
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

    const difficultyParam = searchParams.get("difficulty");
    const yearParam = searchParams.get("year");

    const rawFilter: { difficulty?: Difficulty; year?: number } = {};

    if (difficultyParam !== null) {
      rawFilter.difficulty = difficultyParam as Difficulty;
    }

    if (yearParam !== null) {
      const parsedYear = Number(yearParam);
      rawFilter.year = parsedYear;
    }

    let filter;
    if (Object.keys(rawFilter).length > 0) {
      const validation = AssessmentValidation.validatePyqFilter(rawFilter);
      if (!validation.valid || !validation.data) {
        return ResponseBuilder.error(
          `Validation Error: ${validation.errors?.join(", ")}`,
          400,
          "VALIDATION_ERROR"
        );
      }
      filter = validation.data;
    }

    Logger.info("GET /api/assessments/pyqs requested", {
      userId: session.userId,
      courseId,
      filter,
    });

    const pyqs = await assessmentService.listPyqs(courseId, filter);

    return ResponseBuilder.success(pyqs, "Previous-year questions retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/assessments/pyqs failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving previous-year questions.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
