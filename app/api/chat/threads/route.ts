/**
 * @file app/api/chat/threads/route.ts
 * @description Next.js 16 Route Handler for AI Mentor Chat Threads.
 * @purpose Exposes GET (list threads with preview or summary) and POST (create new thread session).
 * @security Strictly enforces getAuthenticatedUser() session verification.
 */

import { NextRequest } from "next/server";
import { chatService } from "@/services/chat.service";
import { ChatValidation } from "@/validations/chat.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

/**
 * GET /api/chat/threads
 * Retrieves chat threads for the authenticated student.
 * Defaults to threads with preview snippets and message counts; if preview=false is supplied, returns standard threads.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const previewParam = searchParams.get("preview");
    const includePreview = previewParam !== "false";

    Logger.info("GET /api/chat/threads requested", {
      userId: session.userId,
      includePreview,
    });

    const threads = includePreview
      ? await chatService.getUserThreadsWithPreview(session.userId)
      : await chatService.getUserThreads(session.userId);

    return ResponseBuilder.success(threads, "Chat threads retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/chat/threads failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving chat threads.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

/**
 * POST /api/chat/threads
 * Creates a new chat thread for the authenticated student.
 */
export async function POST(request: NextRequest) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json().catch(() => ({}));
    if (typeof body !== "object" || body === null) {
      return ResponseBuilder.error(
        "Validation Error: Request body must be a valid JSON object.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const validation = ChatValidation.validateCreateThreadInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("POST /api/chat/threads requested", {
      userId: session.userId,
      title: validation.data.title,
    });

    const thread = await chatService.createThread(session.userId, validation.data);

    return ResponseBuilder.success(thread, "Chat thread created successfully.", 201);
  } catch (error: unknown) {
    Logger.error("POST /api/chat/threads failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while creating chat thread.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
