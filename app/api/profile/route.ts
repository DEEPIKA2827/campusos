/**
 * @file app/api/profile/route.ts
 * @description Next.js 16 Route Handler for Student Profile operations (GET, POST).
 * @purpose Connects HTTP requests to ProfileService without embedding business logic.
 */

import { NextRequest } from "next/server";
import { profileService } from "@/services/profile.service";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/profile
 * Retrieves profile for the currently authenticated student.
 */
export async function GET() {
  try {
    // TODO: Extract authenticated User ID from request context (Auth Session)
    const demoUserId = "demo-vtu-user-123";

    Logger.info("GET /api/profile requested", { userId: demoUserId });
    const profile = await profileService.getStudentProfile(demoUserId);

    if (!profile) {
      return ResponseBuilder.error("Student profile not found", 404, "NOT_FOUND");
    }

    return ResponseBuilder.success(profile, "Profile retrieved successfully");
  } catch (error) {
    Logger.error("GET /api/profile failed", error);
    return ResponseBuilder.error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}

/**
 * POST /api/profile
 * Creates or initializes a new student profile during onboarding.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Extract authenticated User ID & Email from Auth context
    const demoUserId = "demo-vtu-user-123";
    const demoEmail = "student@rvce.edu.in";

    Logger.info("POST /api/profile requested", { userId: demoUserId });
    const newProfile = await profileService.setupStudentProfile(demoUserId, demoEmail, body);

    return ResponseBuilder.success(newProfile, "Profile created successfully", 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Invalid request data";
    Logger.error("POST /api/profile failed", error);
    return ResponseBuilder.error(errorMessage, 400, "BAD_REQUEST");
  }
}
