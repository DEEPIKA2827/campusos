/**
 * @file app/api/settings/route.ts
 * @description Next.js 16 Route Handler for User Settings & Preferences (GET, PATCH).
 * @purpose Manages student theme and notification configuration scoped to authenticated user identity.
 */

import { NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/settings
 * Retrieves user preferences and configuration.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    Logger.info("GET /api/settings requested", { userId: session.userId });
    const settings = await userService.getSettings(session.userId);

    if (!settings) {
      return ResponseBuilder.error("User settings not found.", 404, "NOT_FOUND");
    }

    return ResponseBuilder.success(settings, "Settings retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/settings failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error("An unexpected error occurred.", 500, "INTERNAL_ERROR");
  }
}

/**
 * PATCH /api/settings
 * Partially updates user preferences and configuration.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json();

    Logger.info("PATCH /api/settings requested", { userId: session.userId });
    const updatedSettings = await userService.updateSettings(session.userId, body);

    return ResponseBuilder.success(updatedSettings, "Settings updated successfully.");
  } catch (error: unknown) {
    Logger.error("PATCH /api/settings failed", error);
    const message = error instanceof Error ? error.message : "Invalid settings data";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error("An unexpected error occurred while updating settings.", 500, "INTERNAL_ERROR");
  }
}
