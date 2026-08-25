/**
 * @file app/api/opportunities/track/route.ts
 * @description Next.js 16 Route Handler for Tracking / Updating Student Opportunity Status.
 * @purpose Exposes POST endpoint to save, apply, shortlist, or update tracking status.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { opportunityService } from "@/services/opportunity.service";
import { OpportunityValidation } from "@/validations/opportunity.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * POST /api/opportunities/track
 * Updates or creates opportunity tracking status for the authenticated student.
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

    const validation = OpportunityValidation.validateTrackOpportunityInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("POST /api/opportunities/track requested", {
      userId: session.userId,
      opportunityId: validation.data.opportunityId,
      status: validation.data.status,
    });

    const result = await opportunityService.trackOpportunity(session.userId, validation.data);

    return ResponseBuilder.success(result, "Opportunity tracking updated successfully.", 200);
  } catch (error: unknown) {
    Logger.error("POST /api/opportunities/track failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while updating opportunity tracking.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
