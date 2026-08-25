/**
 * @file app/api/profile/route.ts
 * @description Next.js 16 Route Handler for Student Profile operations (GET, POST, PATCH).
 * @purpose Connects HTTP requests to ProfileService using authenticated session identity.
 * @security Strictly enforces getAuthenticatedUser() session verification and eliminates hardcoded user IDs.
 */

import { NextRequest } from "next/server";
import { profileService } from "@/services/profile.service";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/profile
 * Retrieves profile for the currently authenticated student.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    Logger.info("GET /api/profile requested", { userId: session.userId });
    const profile = await profileService.getStudentProfile(session.userId);

    if (!profile) {
      return ResponseBuilder.error("Student profile not found.", 404, "NOT_FOUND");
    }

    return ResponseBuilder.success(profile, "Profile retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/profile failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error("An unexpected error occurred.", 500, "INTERNAL_ERROR");
  }
}

/**
 * POST /api/profile
 * Creates or initializes a new student profile during onboarding.
 */
export async function POST(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json();

    Logger.info("POST /api/profile requested", { userId: session.userId });
    const newProfile = await profileService.setupStudentProfile(session.userId, body);

    return ResponseBuilder.success(newProfile, "Profile created successfully.", 201);
  } catch (error: unknown) {
    Logger.error("POST /api/profile failed", error);
    const message = error instanceof Error ? error.message : "Invalid request data";

    if (message.startsWith("Conflict Error") || message.includes("already exists")) {
      return ResponseBuilder.error(message, 409, "CONFLICT");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error("An unexpected error occurred while creating profile.", 500, "INTERNAL_ERROR");
  }
}

/**
 * PATCH /api/profile
 * Partially updates an existing student profile for the authenticated student.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json();

    Logger.info("PATCH /api/profile requested", { userId: session.userId });
    const updatedProfile = await profileService.updateStudentProfile(session.userId, body);

    return ResponseBuilder.success(updatedProfile, "Profile updated successfully.");
  } catch (error: unknown) {
    Logger.error("PATCH /api/profile failed", error);
    const message = error instanceof Error ? error.message : "Invalid update data";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }
    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }

    return ResponseBuilder.error("An unexpected error occurred while updating profile.", 500, "INTERNAL_ERROR");
  }
}
