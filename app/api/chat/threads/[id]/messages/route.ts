/**
 * @file app/api/chat/threads/[id]/messages/route.ts
 * @description Next.js 16 Route Handler for AI Mentor Chat Messages.
 * @purpose Exposes POST (send/append message) and DELETE (clear all messages in thread).
 * @security Strictly enforces getAuthenticatedUser() session verification and thread ownership.
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
 * POST /api/chat/threads/[id]/messages
 * Appends a new message (user prompt or assistant response) to an existing chat thread.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const validation = ChatValidation.validateSendMessageInput(body);
    if (!validation.valid || !validation.data) {
      return ResponseBuilder.error(
        `Validation Error: ${validation.errors?.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    Logger.info("POST /api/chat/threads/[id]/messages requested", {
      userId: session.userId,
      chatId,
      sender: validation.data.sender,
    });

    const newMessage = await chatService.sendMessage(chatId, session.userId, validation.data);

    return ResponseBuilder.success(newMessage, "Message sent successfully.", 201);
  } catch (error: unknown) {
    Logger.error("POST /api/chat/threads/[id]/messages failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while sending message.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

/**
 * DELETE /api/chat/threads/[id]/messages
 * Clears all messages in a thread while preserving the thread container.
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

    Logger.info("DELETE /api/chat/threads/[id]/messages requested", {
      userId: session.userId,
      chatId,
    });

    await chatService.clearThread(chatId, session.userId);

    return ResponseBuilder.success({ cleared: true }, "Chat thread messages cleared successfully.");
  } catch (error: unknown) {
    Logger.error("DELETE /api/chat/threads/[id]/messages failed", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.startsWith("Not Found Error")) {
      return ResponseBuilder.error(message, 404, "NOT_FOUND");
    }
    if (message.startsWith("Validation Error")) {
      return ResponseBuilder.error(message, 400, "VALIDATION_ERROR");
    }

    return ResponseBuilder.error(
      "An unexpected error occurred while clearing chat thread messages.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
