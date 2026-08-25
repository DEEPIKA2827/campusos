/**
 * @file app/api/opportunities/tracked/route.ts
 * @description Next.js 16 Route Handler for Retrieving Student's Tracked Opportunities.
 * @purpose Exposes GET endpoint returning all tracked opportunities for authenticated student.
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { opportunityService } from "@/services/opportunity.service";
import { OpportunityStatus } from "@/types/api.types";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

const VALID_STATUSES: OpportunityStatus[] = ["saved", "applied", "shortlisted", "rejected"];

/**
 * GET /api/opportunities/tracked
 * Retrieves all opportunities tracked by the authenticated student, with optional status filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    let statusFilter: OpportunityStatus | undefined = undefined;
    if (statusParam !== null) {
      if (!VALID_STATUSES.includes(statusParam as OpportunityStatus)) {
        return ResponseBuilder.error(
          `Validation Error: Status must be one of: ${VALID_STATUSES.join(", ")}.`,
          400,
          "VALIDATION_ERROR"
        );
      }
      statusFilter = statusParam as OpportunityStatus;
    }

    Logger.info("GET /api/opportunities/tracked requested", {
      userId: session.userId,
      status: statusFilter,
    });

    const tracked = await opportunityService.getUserTrackedOpportunities(session.userId, statusFilter);

    return ResponseBuilder.success(tracked, "Tracked opportunities retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/opportunities/tracked failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving tracked opportunities.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
