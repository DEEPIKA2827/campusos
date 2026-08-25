/**
 * @file app/api/attendance/history/route.ts
 * @description Next.js 16 Route Handler for Course Attendance History.
 * @purpose Exposes GET endpoint to fetch chronological attendance logs with optional date range filter.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { attendanceService } from "@/services/attendance.service";
import { AttendanceValidation } from "@/validations/attendance.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/attendance/history
 * Retrieves attendance log history for a specific course, optionally filtered by date range or limited.
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

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limitParam = searchParams.get("limit");

    let limit: number | undefined = undefined;
    if (limitParam !== null) {
      const parsedLimit = Number(limitParam);
      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        return ResponseBuilder.error(
          "Validation Error: Limit must be a positive integer.",
          400,
          "VALIDATION_ERROR"
        );
      }
      limit = parsedLimit;
    }

    // If date range parameters are provided, validate and use date range service method
    if (startDate !== null || endDate !== null) {
      const rangeValidation = AttendanceValidation.validateDateRangeFilter({
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      });

      if (!rangeValidation.valid || !rangeValidation.data) {
        return ResponseBuilder.error(
          `Validation Error: ${rangeValidation.errors?.join(", ")}`,
          400,
          "VALIDATION_ERROR"
        );
      }

      Logger.info("GET /api/attendance/history (date range) requested", {
        userId: session.userId,
        courseId,
        filter: rangeValidation.data,
      });

      const history = await attendanceService.getAttendanceHistoryByDateRange(
        session.userId,
        courseId,
        rangeValidation.data
      );

      return ResponseBuilder.success(history, "Attendance history retrieved successfully.");
    }

    // Otherwise use default history retrieval
    Logger.info("GET /api/attendance/history requested", {
      userId: session.userId,
      courseId,
      limit,
    });

    const history = await attendanceService.getAttendanceHistory(session.userId, courseId, limit);

    return ResponseBuilder.success(history, "Attendance history retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/attendance/history failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving attendance history.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
