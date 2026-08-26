/**
 * @file app/api/chat/threads/[id]/route.ts
 * @description Next.js 16 Route Handler for Single AI Mentor Chat Thread.
 * @purpose Exposes GET (thread with messages), PATCH (update title), and DELETE (delete thread).
 * @security Strictly enforces getAuthenticatedUser() session verification and user ownership.
 */

import { NextRequest } from "next/server";
import { chatService } from "@/services/chat.service";
import { ChatValidation } from "@/validations/chat.validation";
import { getAuthenticatedUser } from "@/lib/auth";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/chat/threads/[id]
 * Retrieves a chat thread and all its ordered messages for the authenticated user.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const chatId = Number(id);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Chat ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("GET /api/chat/threads/[id] requested", {
      userId: session.userId,
      chatId,
    });

    const threadWithMessages = await chatService.getThreadWithMessages(chatId, session.userId);

    return ResponseBuilder.success(threadWithMessages, "Chat thread retrieved successfully.");
  } catch (error: unknown) {
    Logger.error("GET /api/chat/threads/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while retrieving chat thread.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

/**
 * PATCH /api/chat/threads/[id]
 * Updates the title of an AI mentor chat thread.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const chatId = Number(id);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Chat ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return ResponseBuilder.error(
        "Validation Error: Request body must be a valid JSON object.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const validation = ChatValidation.validateUpdateThreadTitleInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("PATCH /api/chat/threads/[id] requested", {
      userId: session.userId,
      chatId,
      title: validation.data.title,
    });

    const updatedThread = await chatService.updateThreadTitle(chatId, session.userId, validation.data);

    return ResponseBuilder.success(updatedThread, "Chat thread title updated successfully.");
  } catch (error: unknown) {
    Logger.error("PATCH /api/chat/threads/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while updating chat thread title.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

/**
 * DELETE /api/chat/threads/[id]
 * Deletes a chat thread and all its messages, scoped by user ownership.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return ResponseBuilder.error("Unauthorized: Authentication required.", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const chatId = Number(id);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return ResponseBuilder.error(
        "Validation Error: Chat ID must be a positive integer.",
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("DELETE /api/chat/threads/[id] requested", {
      userId: session.userId,
      chatId,
    });

    await chatService.deleteThread(chatId, session.userId);

    return ResponseBuilder.success({ deleted: true }, "Chat thread deleted successfully.");
  } catch (error: unknown) {
    Logger.error("DELETE /api/chat/threads/[id] failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while deleting chat thread.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
