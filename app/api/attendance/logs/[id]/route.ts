/**
 * @file app/api/attendance/logs/[id]/route.ts
 * @description Next.js 16 Route Handler for deleting individual attendance log records.
 * @purpose Exposes DELETE endpoint that atomically removes log and synchronizes summary.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { attendanceService } from "@/services/attendance.service";
import { AttendanceValidation } from "@/validations/attendance.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/attendance/logs/[id]
 * Deletes an attendance log and synchronizes the course attendance summary in an atomic transaction.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const attendanceIdNum = Number(id);

    const idValidation = AttendanceValidation.validateAttendanceId(attendanceIdNum);
    if (!idValidation.valid || !idValidation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${idValidation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    const { searchParams } = new URL(request.url);
    const courseIdParam = searchParams.get("courseId");
    if (!courseIdParam) {
      return ResponseBuilder.error(
        "Validation Error: Course ID query parameter is required for summary synchronization.",
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

    Logger.info("DELETE /api/attendance/logs/[id] requested", {
      userId: session.userId,
      attendanceId: idValidation.data.attendanceId,
      courseId,
    });

    const result = await attendanceService.deleteAttendanceLog(
      idValidation.data.attendanceId,
      session.userId,
      courseId
    );

    return ResponseBuilder.success(result, "Attendance log deleted successfully.");
  } catch (error: unknown) {
    Logger.error("DELETE /api/attendance/logs/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.includes("not found") || message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while deleting the attendance log.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
