/**
 * @file validations/chat.validation.ts
 * @description Request body and parameter validation schemas for AI Mentor Chat Sessions and Messages.
 * @domain Bounded Context: AI Mentor Conversational Intelligence
 */

import { ChatSenderType } from "@/types/api.types";
import { ValidationResult } from "./user.validation";

export interface CreateChatThreadInput {
  title?: string | null;
}

export interface UpdateChatThreadTitleInput {
  title: string;
}

export interface SendChatMessageInput {
  messageText: string;
  sender?: ChatSenderType;
}

const VALID_SENDERS: ChatSenderType[] = ["user", "assistant"];

export class ChatValidation {
  /**
   * Validates chat thread creation payload.
   */
  static validateCreateThreadInput(data: Partial<CreateChatThreadInput>): ValidationResult<CreateChatThreadInput> {
    const errors: string[] = [];

    if (data.title !== undefined && data.title !== null) {
      if (typeof data.title !== "string") {
        errors.push("Title must be a string.");
      } else if (data.title.trim().length > 255) {
        errors.push("Title must not exceed 255 characters.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        title: data.title ? data.title.trim() : null,
      },
    };
  }

  /**
   * Validates chat thread title update payload.
   */
  static validateUpdateThreadTitleInput(
    data: Partial<UpdateChatThreadTitleInput>
  ): ValidationResult<UpdateChatThreadTitleInput> {
    const errors: string[] = [];

    if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("Title is required.");
    } else if (data.title.trim().length > 255) {
      errors.push("Title must not exceed 255 characters.");
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        title: data.title!.trim(),
      },
    };
  }

  /**
   * Validates chat message transmission payload.
   */
  static validateSendMessageInput(data: Partial<SendChatMessageInput>): ValidationResult<SendChatMessageInput> {
    const errors: string[] = [];

    if (!data.messageText || typeof data.messageText !== "string" || data.messageText.trim().length === 0) {
      errors.push("Message text is required.");
    } else if (data.messageText.trim().length > 10000) {
      errors.push("Message text must not exceed 10,000 characters.");
    }

    if (data.sender !== undefined) {
      if (typeof data.sender !== "string" || !VALID_SENDERS.includes(data.sender as ChatSenderType)) {
        errors.push(`Sender must be one of: ${VALID_SENDERS.join(", ")}.`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        messageText: data.messageText!.trim(),
        sender: (data.sender as ChatSenderType) || "user",
      },
    };
  }
}
