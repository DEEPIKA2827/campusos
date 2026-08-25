/**
 * @file app/api/opportunities/[id]/route.ts
 * @description Next.js 16 Route Handler for Opportunity Details.
 * @purpose Exposes GET endpoint returning details for a single opportunity.
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
 * GET /api/opportunities/[id]
 * Retrieves details for a specific opportunity.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    Logger.info("GET /api/opportunities/[id] requested", {
      userId: session.userId,
      opportunityId,
    });

    const opportunity = await opportunityService.getOpportunityById(opportunityId);

    return ResponseBuilder.success(opportunity, "Opportunity retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/opportunities/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving opportunity details.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
