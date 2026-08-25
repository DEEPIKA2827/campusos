/**
 * @file app/api/opportunities/[id]/track/route.ts
 * @description Next.js 16 Route Handler for Untracking / Removing Student Opportunity Tracking.
 * @purpose Exposes DELETE endpoint to remove an opportunity from student tracking.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { opportunityService } from "@/services/opportunity.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/opportunities/[id]/track
 * Untracks an opportunity for the authenticated student.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const opportunityId = Number(id);

    if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Opportunity ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("DELETE /api/opportunities/[id]/track requested", {
      userId: session.userId,
      opportunityId,
    });

    await opportunityService.untrackOpportunity(session.userId, opportunityId);

    return ResponseBuilder.success({ untracked: true }, "Opportunity untracked successfully.", 200);
  } catch (error: unknown) {
    Logger.error("DELETE /api/opportunities/[id]/track failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while untracking the opportunity.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
