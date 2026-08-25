/**
 * @file app/api/roadmaps/[id]/progress/route.ts
 * @description Next.js 16 Route Handler for Student Roadmap Progress (GET, PATCH).
 * @purpose Manages node completion status scoped exclusively to the authenticated student session.
 * @security Strictly enforces getAuthenticatedUser() identity and prevents request-body userId spoofing.
 */

import { NextRequest } from "next/server";
import { roadmapService } from "@/services/roadmap.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/roadmaps/[id]/progress
 * Retrieves node-by-node completion status for the authenticated student on a specific roadmap.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const roadmapId = parseInt(id, 10);

    if (isNaN(roadmapId) || !Number.isInteger(roadmapId) || roadmapId <= 0) {
      return ResponseBuilder.error("Validation Error: Roadmap ID must be a positive integer.", 400, "VALIDATION_ERROR");
    }

    Logger.info("GET /api/roadmaps/[id]/progress requested", { userId: session.userId, roadmapId });
    const progressDetails = await roadmapService.getStudentRoadmapProgress(session.userId, roadmapId);

    return ResponseBuilder.success(progressDetails, "Student roadmap progress retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/roadmaps/[id]/progress failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error("An unexpected error occurred while retrieving progress.", 500, "INTERNAL_ERROR");
  }
}

/**
 * PATCH /api/roadmaps/[id]/progress
 * Updates student completion status for a specific node in a roadmap.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const roadmapId = parseInt(id, 10);

    if (isNaN(roadmapId) || !Number.isInteger(roadmapId) || roadmapId <= 0) {
      return ResponseBuilder.error("Validation Error: Roadmap ID must be a positive integer.", 400, "VALIDATION_ERROR");
    }

    const body = await request.json();

    Logger.info("PATCH /api/roadmaps/[id]/progress requested", { userId: session.userId, roadmapId });
    const updatedProgress = await roadmapService.updateNodeProgress(session.userId, roadmapId, body);

    return ResponseBuilder.success(updatedProgress, "Roadmap node progress updated successfully.");
  } catch (error: unknown) {
    Logger.error("PATCH /api/roadmaps/[id]/progress failed", error);
    const message = error instanceof Error ? error.message : "Invalid update data";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error("An unexpected error occurred while updating roadmap progress.", 500, "INTERNAL_ERROR");
  }
}
