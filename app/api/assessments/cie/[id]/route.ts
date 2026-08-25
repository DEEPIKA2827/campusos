/**
 * @file app/api/assessments/cie/[id]/route.ts
 * @description Next.js 16 Route Handler for Single CIE Assessment Definition.
 * @purpose Exposes GET endpoint returning details for a single CIE assessment.
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
 * GET /api/assessments/cie/[id]
 * Retrieves details for a specific CIE assessment definition.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const cieId = Number(id);

    if (!Number.isInteger(cieId) || cieId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: CIE Assessment ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("GET /api/assessments/cie/[id] requested", {
      userId: session.userId,
      cieId,
    });

    const assessment = await assessmentService.getCieAssessmentById(cieId);

    return ResponseBuilder.success(assessment, "CIE assessment retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/assessments/cie/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving CIE assessment details.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
