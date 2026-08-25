/**
 * @file services/chat.service.ts
 * @description Business Logic Layer (BLL) for AI Mentor Conversational Intelligence.
 * @domain Bounded Context: AI Mentor Conversational Intelligence
 * @purpose Implements thread ownership enforcement, conversational message bounds, and AI chat orchestration.
 */

import {
  chatRepository,
  ChatRepository,
  ThreadWithMessages,
} from "@/repositories/chat.repository";
import { userRepository, UserRepository } from "@/repositories/user.repository";
import {
  ChatValidation,
  CreateChatThreadInput,
  UpdateChatThreadTitleInput,
  SendChatMessageInput,
} from "@/validations/chat.validation";
import {
  ChatThreadDTO,
  ChatMessageDTO,
  ChatThreadPreviewDTO,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class ChatService {
  constructor(
    private chatRepo: ChatRepository = chatRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  /**
   * Creates a new AI mentor conversational thread for the authenticated student.
   */
  async createThread(
    userId: number,
    input?: Partial<CreateChatThreadInput>
  ): Promise<ChatThreadDTO> {
    Logger.info("ChatService.createThread invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    let title = "New AI Mentor Session";
    if (input && Object.keys(input).length > 0) {
      const validation = ChatValidation.validateCreateThreadInput(input);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      if (validation.data.title) {
        title = validation.data.title;
      }
    }

    // Step 2: Semantic Check — Ensure user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Not Found Error: User does not exist.");
    }

    // Step 3: Persist via Data Access Layer
    return this.chatRepo.createThread(userId, title);
  }

  /**
   * Retrieves all chat threads created by the authenticated user.
   */
  async getUserThreads(userId: number): Promise<ChatThreadDTO[]> {
    Logger.debug("ChatService.getUserThreads invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    return this.chatRepo.listUserThreads(userId);
  }

  /**
   * Retrieves user threads with preview snippets and message counts for the sidebar.
   */
  async getUserThreadsWithPreview(userId: number): Promise<ChatThreadPreviewDTO[]> {
    Logger.debug("ChatService.getUserThreadsWithPreview invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    return this.chatRepo.listUserThreadsWithPreview(userId);
  }

  /**
   * Retrieves a chat thread by ID, strictly enforcing user ownership.
   */
  async getThread(chatId: number, userId: number): Promise<ChatThreadDTO> {
    Logger.debug("ChatService.getThread invoked", { chatId, userId });

    if (!chatId || typeof chatId !== "number" || chatId <= 0) {
      throw new Error("Validation Error: Chat ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    const thread = await this.chatRepo.getThreadById(chatId, userId);
    if (!thread) {
      throw new Error("Not Found Error: Chat thread not found or unauthorized.");
    }

    return thread;
  }

  /**
   * Retrieves a chat thread and all its ordered messages for an authenticated user.
   */
  async getThreadWithMessages(chatId: number, userId: number): Promise<ThreadWithMessages> {
    Logger.debug("ChatService.getThreadWithMessages invoked", { chatId, userId });

    if (!chatId || typeof chatId !== "number" || chatId <= 0) {
      throw new Error("Validation Error: Chat ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    const result = await this.chatRepo.getThreadWithMessages(chatId, userId);
    if (!result) {
      throw new Error("Not Found Error: Chat thread not found or unauthorized.");
    }

    return result;
  }

  /**
   * Updates the title of an AI mentor thread with ownership verification.
   */
  async updateThreadTitle(
    chatId: number,
    userId: number,
    input: Partial<UpdateChatThreadTitleInput>
  ): Promise<ChatThreadDTO> {
    Logger.info("ChatService.updateThreadTitle invoked", { chatId, userId });

    if (!chatId || typeof chatId !== "number" || chatId <= 0) {
      throw new Error("Validation Error: Chat ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = ChatValidation.validateUpdateThreadTitleInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check & Update via Data Access Layer
    const updated = await this.chatRepo.updateThreadTitle(chatId, userId, validation.data.title);
    if (!updated) {
      throw new Error("Not Found Error: Chat thread not found or unauthorized.");
    }

    return updated;
  }

  /**
   * Sends/appends a message to a chat thread after verifying thread ownership.
   */
  async sendMessage(
    chatId: number,
    userId: number,
    input: Partial<SendChatMessageInput>
  ): Promise<ChatMessageDTO> {
    Logger.info("ChatService.sendMessage invoked", { chatId, userId });

    if (!chatId || typeof chatId !== "number" || chatId <= 0) {
      throw new Error("Validation Error: Chat ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = ChatValidation.validateSendMessageInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Verify thread exists and belongs to the authenticated user
    const thread = await this.chatRepo.getThreadById(chatId, userId);
    if (!thread) {
      throw new Error("Not Found Error: Chat thread not found or unauthorized.");
    }

    // Step 3: Persist Message via Data Access Layer
    return this.chatRepo.appendMessage(
      chatId,
      validation.data.sender || "user",
      validation.data.messageText
    );
  }

  /**
   * Atomically creates a new thread and saves the initial user question and AI response.
   */
  async createThreadWithInitialMessages(
    userId: number,
    title: string,
    userPrompt: string,
    assistantResponse: string
  ): Promise<ThreadWithMessages> {
    Logger.info("ChatService.createThreadWithInitialMessages invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    if (!userPrompt || userPrompt.trim().length === 0) {
      throw new Error("Validation Error: User prompt is required.");
    }
    if (!assistantResponse || assistantResponse.trim().length === 0) {
      throw new Error("Validation Error: Assistant response is required.");
    }

    const cleanTitle = title?.trim() || "New AI Mentor Session";

    return this.chatRepo.createThreadWithInitialMessages(
      userId,
      cleanTitle,
      userPrompt.trim(),
      assistantResponse.trim()
    );
  }

  /**
   * Clears all messages in a thread while keeping the thread container.
   */
  async clearThread(chatId: number, userId: number): Promise<boolean> {
    Logger.info("ChatService.clearThread invoked", { chatId, userId });

    if (!chatId || typeof chatId !== "number" || chatId <= 0) {
      throw new Error("Validation Error: Chat ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    const cleared = await this.chatRepo.clearThreadMessages(chatId, userId);
    if (!cleared) {
      throw new Error("Not Found Error: Chat thread not found or unauthorized.");
    }

    return true;
  }

  /**
   * Deletes a chat thread and all its messages, scoped by user ownership.
   */
  async deleteThread(chatId: number, userId: number): Promise<boolean> {
    Logger.info("ChatService.deleteThread invoked", { chatId, userId });

    if (!chatId || typeof chatId !== "number" || chatId <= 0) {
      throw new Error("Validation Error: Chat ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    const deleted = await this.chatRepo.deleteThread(chatId, userId);
    if (!deleted) {
      throw new Error("Not Found Error: Chat thread not found or unauthorized.");
    }

    return true;
  }
}

export const chatService = new ChatService();
