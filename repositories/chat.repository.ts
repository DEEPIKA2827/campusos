/**
 * @file repositories/chat.repository.ts
 * @description Data Access Layer for AI Mentor Chat Threads and Messages.
 * @domain Bounded Context: AI Mentor Conversational Intelligence
 * @tables chat_threads, chat_messages
 */

import { db, schema } from "@/lib/db";
import { eq, and, asc, desc, inArray, sql } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  ChatThreadDTO,
  ChatMessageDTO,
  ChatThreadPreviewDTO,
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
   * Retrieves a chat thread by ID, strictly scoped to the owning user.
   */
  async getThreadById(chatId: number, userId: number): Promise<ChatThreadDTO | null> {
    const client = this.getDb();
    Logger.debug("ChatRepository.getThreadById", { chatId, userId });

    const [record] = await client
      .select()
      .from(schema.chatThreads)
      .where(
        and(
          eq(schema.chatThreads.chatId, chatId),
          eq(schema.chatThreads.userId, userId)
        )
      );

    if (!record) return null;

    return {
      chatId: record.chatId,
      userId: record.userId,
      title: record.title,
      createdAt: record.createdAt,
    };
  }

  /**
   * Updates the title of a chat thread, strictly scoped to the owning user.
   */
  async updateThreadTitle(
    chatId: number,
    userId: number,
    title: string
  ): Promise<ChatThreadDTO | null> {
    const client = this.getDb();
    Logger.info("ChatRepository.updateThreadTitle", { chatId, userId, title });

    const [record] = await client
      .update(schema.chatThreads)
      .set({ title: title.trim() })
      .where(
        and(
          eq(schema.chatThreads.chatId, chatId),
          eq(schema.chatThreads.userId, userId)
        )
      )
      .returning();

    if (!record) return null;

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
   * Lists all chat threads for a user with latest message snippet and message count (No N+1 queries).
   */
  async listUserThreadsWithPreview(userId: number): Promise<ChatThreadPreviewDTO[]> {
    const client = this.getDb();
    Logger.debug("ChatRepository.listUserThreadsWithPreview", { userId });

    const threads = await this.listUserThreads(userId);
    if (threads.length === 0) return [];

    const chatIds = threads.map((t) => t.chatId);

    // 1. Fetch message counts per thread
    const counts = await client
      .select({
        chatId: schema.chatMessages.chatId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.chatMessages)
      .where(inArray(schema.chatMessages.chatId, chatIds))
      .groupBy(schema.chatMessages.chatId);

    const countMap = new Map<number, number>();
    counts.forEach((c) => countMap.set(c.chatId, c.count));

    // 2. Fetch latest message per thread using DISTINCT ON (PostgreSQL)
    const latestMessages = await client
      .selectDistinctOn([schema.chatMessages.chatId], {
        chatId: schema.chatMessages.chatId,
        message: schema.chatMessages.message,
        senderType: schema.chatMessages.senderType,
        createdAt: schema.chatMessages.createdAt,
      })
      .from(schema.chatMessages)
      .where(inArray(schema.chatMessages.chatId, chatIds))
      .orderBy(schema.chatMessages.chatId, desc(schema.chatMessages.createdAt));

    const latestMap = new Map<number, (typeof latestMessages)[0]>();
    latestMessages.forEach((m) => latestMap.set(m.chatId, m));

    return threads.map((t) => {
      const latest = latestMap.get(t.chatId);
      return {
        chatId: t.chatId,
        userId: t.userId,
        title: t.title,
        createdAt: t.createdAt,
        lastMessage: latest ? latest.message : null,
        lastSenderType: latest ? (latest.senderType as ChatSenderType) : null,
        lastMessageAt: latest ? latest.createdAt : null,
        messageCount: countMap.get(t.chatId) || 0,
      };
    });
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
   * Fetches paginated messages for a thread after strictly verifying user ownership.
   */
  async getMessagesByThread(
    chatId: number,
    userId: number,
    limit = 50,
    offset = 0
  ): Promise<ChatMessageDTO[]> {
    const client = this.getDb();
    Logger.debug("ChatRepository.getMessagesByThread", { chatId, userId, limit, offset });

    // 1. Verify thread ownership
    const thread = await this.getThreadById(chatId, userId);
    if (!thread) return [];

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);

    // 2. Fetch paginated messages in ascending chronological order
    const records = await client
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.chatId, chatId))
      .orderBy(asc(schema.chatMessages.createdAt))
      .limit(safeLimit)
      .offset(safeOffset);

    return records.map((m) => ({
      messageId: m.messageId,
      chatId: m.chatId,
      senderType: m.senderType as ChatSenderType,
      message: m.message,
      createdAt: m.createdAt,
    }));
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
   * Deletes all messages in a thread while preserving the thread container, scoped by user.
   */
  async clearThreadMessages(chatId: number, userId: number): Promise<boolean> {
    const client = this.getDb();
    Logger.info("ChatRepository.clearThreadMessages", { chatId, userId });

    // 1. Verify thread ownership
    const thread = await this.getThreadById(chatId, userId);
    if (!thread) return false;

    // 2. Delete all messages for this verified thread
    await client
      .delete(schema.chatMessages)
      .where(eq(schema.chatMessages.chatId, chatId));

    return true;
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
