/**
 * @file app/api/assessments/viva/route.ts
 * @description Next.js 16 Route Handler for Course Viva Questions.
 * @purpose Exposes GET endpoint with courseId requirement and optional difficulty filter.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { assessmentService } from "@/services/assessment.service";
import { Difficulty } from "@/types/api.types";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

/**
 * GET /api/assessments/viva
 * Retrieves viva questions for a course with optional difficulty filter.
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

    let difficulty: Difficulty | undefined = undefined;
    if (difficultyParam !== null) {
      if (!VALID_DIFFICULTIES.includes(difficultyParam as Difficulty)) {
        return ResponseBuilder.error(
          `Validation Error: Difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}.`,
          400,
          "VALIDATION_ERROR"
        );
      }
      difficulty = difficultyParam as Difficulty;
    }

    Logger.info("GET /api/assessments/viva requested", {
      userId: session.userId,
      courseId,
      difficulty,
    });

    const vivaQuestions = await assessmentService.listVivaQuestions(courseId, difficulty);

    return ResponseBuilder.success(vivaQuestions, "Viva questions retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/assessments/viva failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving viva questions.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
