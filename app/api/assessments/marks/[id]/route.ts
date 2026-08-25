/**
 * @file app/api/assessments/marks/[id]/route.ts
 * @description Next.js 16 Route Handler for Deleting Student CIE Marks.
 * @purpose Exposes DELETE endpoint ensuring student ownership.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { assessmentService } from "@/services/assessment.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/assessments/marks/[id]
 * Deletes a student mark entry ensuring the mark belongs to the authenticated user.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const markId = Number(id);

    if (!Number.isInteger(markId) || markId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Mark ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("DELETE /api/assessments/marks/[id] requested", {
      userId: session.userId,
      markId,
    });

    await assessmentService.deleteStudentMark(markId, session.userId);

    return ResponseBuilder.success({ deleted: true }, "Student mark deleted successfully.", 200);
  } catch (error: unknown) {
    Logger.error("DELETE /api/assessments/marks/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while deleting student mark.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
