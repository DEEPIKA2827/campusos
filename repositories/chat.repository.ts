/**
 * @file repositories/chat.repository.ts
 * @description Data Access Layer for AI Mentor Chat Threads and Messages.
 * @domain Bounded Context: AI Mentor Conversational Intelligence
 * @tables chat_threads, chat_messages
 */

import { db, schema } from "@/lib/db";
import { eq, and, asc, desc } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  ChatThreadDTO,
  ChatMessageDTO,
  ChatSenderType,
} from "@/types/api.types";

export interface ThreadWithMessages {
  thread: ChatThreadDTO;
  messages: ChatMessageDTO[];
}

export class ChatRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  /**
   * Creates a new chat thread for a user.
   */
  async createThread(userId: number, title?: string | null): Promise<ChatThreadDTO> {
    const client = this.getDb();
    Logger.info("ChatRepository.createThread", { userId, title });

    const [record] = await client
      .insert(schema.chatThreads)
      .values({
        userId,
        title: title || "New AI Mentor Session",
      })
      .returning();

    return {
      chatId: record.chatId,
      userId: record.userId,
      title: record.title,
      createdAt: record.createdAt,
    };
  }

  /**
   * Lists all chat threads created by a user, ordered by most recent first.
   */
  async listUserThreads(userId: number): Promise<ChatThreadDTO[]> {
    const client = this.getDb();
    Logger.debug("ChatRepository.listUserThreads", { userId });

    const records = await client
      .select()
      .from(schema.chatThreads)
      .where(eq(schema.chatThreads.userId, userId))
      .orderBy(desc(schema.chatThreads.createdAt));

    return records.map((r) => ({
      chatId: r.chatId,
      userId: r.userId,
      title: r.title,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Retrieves a chat thread and all its ordered messages for a specific user.
   */
  async getThreadWithMessages(chatId: number, userId: number): Promise<ThreadWithMessages | null> {
    const client = this.getDb();
    Logger.debug("ChatRepository.getThreadWithMessages", { chatId, userId });

    const [threadRecord] = await client
      .select()
      .from(schema.chatThreads)
      .where(
        and(
          eq(schema.chatThreads.chatId, chatId),
          eq(schema.chatThreads.userId, userId)
        )
      );

    if (!threadRecord) return null;

    const messageRecords = await client
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.chatId, chatId))
      .orderBy(asc(schema.chatMessages.createdAt));

    return {
      thread: {
        chatId: threadRecord.chatId,
        userId: threadRecord.userId,
        title: threadRecord.title,
        createdAt: threadRecord.createdAt,
      },
      messages: messageRecords.map((m) => ({
        messageId: m.messageId,
        chatId: m.chatId,
        senderType: m.senderType as ChatSenderType,
        message: m.message,
        createdAt: m.createdAt,
      })),
    };
  }

  /**
   * Appends a new message (user prompt or AI assistant response) to an existing thread.
   */
  async appendMessage(
    chatId: number,
    senderType: ChatSenderType,
    message: string
  ): Promise<ChatMessageDTO> {
    const client = this.getDb();
    Logger.debug("ChatRepository.appendMessage", { chatId, senderType });

    const [record] = await client
      .insert(schema.chatMessages)
      .values({
        chatId,
        senderType,
        message,
      })
      .returning();

    return {
      messageId: record.messageId,
      chatId: record.chatId,
      senderType: record.senderType as ChatSenderType,
      message: record.message,
      createdAt: record.createdAt,
    };
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
    const client = this.getDb();
    Logger.info("ChatRepository.createThreadWithInitialMessages (atomic)", { userId });

    return await client.transaction(async (tx) => {
      const [thread] = await tx
        .insert(schema.chatThreads)
        .values({
          userId,
          title,
        })
        .returning();

      const [userMsg] = await tx
        .insert(schema.chatMessages)
        .values({
          chatId: thread.chatId,
          senderType: "user",
          message: userPrompt,
        })
        .returning();

      const [aiMsg] = await tx
        .insert(schema.chatMessages)
        .values({
          chatId: thread.chatId,
          senderType: "assistant",
          message: assistantResponse,
        })
        .returning();

      return {
        thread: {
          chatId: thread.chatId,
          userId: thread.userId,
          title: thread.title,
          createdAt: thread.createdAt,
        },
        messages: [
          {
            messageId: userMsg.messageId,
            chatId: userMsg.chatId,
            senderType: "user",
            message: userMsg.message,
            createdAt: userMsg.createdAt,
          },
          {
            messageId: aiMsg.messageId,
            chatId: aiMsg.chatId,
            senderType: "assistant",
            message: aiMsg.message,
            createdAt: aiMsg.createdAt,
          },
        ],
      };
    });
  }

  /**
   * Deletes a chat thread and all cascading messages.
   */
  async deleteThread(chatId: number, userId: number): Promise<boolean> {
    const client = this.getDb();
    Logger.info("ChatRepository.deleteThread", { chatId, userId });

    const result = await client
      .delete(schema.chatThreads)
      .where(
        and(
          eq(schema.chatThreads.chatId, chatId),
          eq(schema.chatThreads.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }
}

export const chatRepository = new ChatRepository();
