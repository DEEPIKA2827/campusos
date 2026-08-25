/**
 * @file app/api/attendance/route.ts
 * @description Next.js 16 Route Handler for Student Attendance Dashboard and Logging.
 * @purpose Exposes GET (dashboard/course summary) and POST (log attendance event with atomic summary update).
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { attendanceService } from "@/services/attendance.service";
import { AttendanceValidation } from "@/validations/attendance.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/attendance
 * Retrieves student attendance dashboard or specific course summary with Bunk Defense analytics.
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

      Logger.info("GET /api/attendance course summary requested", {
        userId: session.userId,
        courseId,
      });

      const summary = await attendanceService.getCourseSummary(session.userId, courseId);
      if (!summary) {
        return ResponseBuilder.error(
          `Attendance summary not found for course ID: ${courseId}`,
          404,
          "NOT_FOUND"
        );
      }

      return ResponseBuilder.success(summary, "Course attendance summary retrieved successfully.");
    }

    Logger.info("GET /api/attendance dashboard requested", { userId: session.userId });
    const dashboard = await attendanceService.getStudentDashboard(session.userId);

    return ResponseBuilder.success(dashboard, "Attendance dashboard retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/attendance failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving attendance.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

/**
 * POST /api/attendance
 * Records a single attendance event and synchronizes course summary with real-time Bunk Defense calculation.
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

    const validation = AttendanceValidation.validateLogAttendanceInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("POST /api/attendance requested", {
      userId: session.userId,
      courseId: validation.data.courseId,
    });

    const result = await attendanceService.logAttendance(session.userId, validation.data);

    return ResponseBuilder.success(result, "Attendance logged successfully.", 201);
  } catch (error: unknown) {
    Logger.error("POST /api/attendance failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while recording attendance.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
