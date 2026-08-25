/**
 * @file app/api/assessments/marks/route.ts
 * @description Next.js 16 Route Handler for Student CIE Marks.
 * @purpose Exposes GET (dashboard marks / course marks) and POST (record / update mark).
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { assessmentService } from "@/services/assessment.service";
import { AssessmentValidation } from "@/validations/assessment.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/assessments/marks
 * Retrieves all CIE marks for the authenticated student, or marks for a specific course if courseId is provided.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const courseIdParam = searchParams.get("courseId");

    if (courseIdParam !== null) {
      const courseId = Number(courseIdParam);
      if (!Number.isInteger(courseId) || courseId <= 0) {
        return ResponseBuilder.error(
          "Validation Error: Course ID must be a positive integer.",
          400,
          "VALIDATION_ERROR"
        );
      }

      Logger.info("GET /api/assessments/marks (course-specific) requested", {
        userId: session.userId,
        courseId,
      });

      const courseMarks = await assessmentService.getStudentCourseMarks(session.userId, courseId);
      return ResponseBuilder.success(courseMarks, "Student course marks retrieved successfully.");
    }

    Logger.info("GET /api/assessments/marks (dashboard) requested", { userId: session.userId });
    const allMarks = await assessmentService.getAllStudentMarks(session.userId);

    return ResponseBuilder.success(allMarks, "Student marks retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/assessments/marks failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving student marks.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

/**
 * POST /api/assessments/marks
 * Records or updates a student mark for a CIE assessment with semantic validation (marksObtained <= maxMarks).
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

    const validation = AssessmentValidation.validateRecordStudentMarkInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("POST /api/assessments/marks requested", {
      userId: session.userId,
      cieId: validation.data.cieId,
      marksObtained: validation.data.marksObtained,
    });

    const result = await assessmentService.recordStudentMark(session.userId, validation.data);

    return ResponseBuilder.success(result, "Student mark recorded successfully.", 201);
  } catch (error: unknown) {
    Logger.error("POST /api/assessments/marks failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while recording student mark.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
