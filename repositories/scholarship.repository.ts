/**
 * @file repositories/scholarship.repository.ts
 * @description Data Access Layer for Scholarships and Student Bookmarks.
 * @domain Bounded Context: Student Financial Aid & Scholarships
 * @tables scholarships, student_scholarship_bookmarks
 */

import { db, schema } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  ScholarshipDTO,
  StudentScholarshipBookmarkDTO,
} from "@/types/api.types";

export interface CreateScholarshipInput {
  scholarshipName: string;
  description?: string | null;
  eligibility?: string | null;
  applicationUrl?: string | null;
  deadline?: string | null;
}

export interface BookmarkedScholarshipDetail {
  scholarship: ScholarshipDTO;
  bookmarkedAt: string;
}

export class ScholarshipRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  /**
   * Lists all available scholarships.
   */
  async listScholarships(): Promise<ScholarshipDTO[]> {
    const client = this.getDb();
    Logger.debug("ScholarshipRepository.listScholarships");

    const records = await client.select().from(schema.scholarships);

    return records.map((r) => ({
      scholarshipId: r.scholarshipId,
      scholarshipName: r.scholarshipName,
      description: r.description,
      eligibility: r.eligibility,
      applicationUrl: r.applicationUrl,
      deadline: r.deadline,
    }));
  }

  /**
   * Retrieves a single scholarship by primary key.
   */
  async getScholarshipById(scholarshipId: number): Promise<ScholarshipDTO | null> {
    const client = this.getDb();
    Logger.debug("ScholarshipRepository.getScholarshipById", { scholarshipId });

    const [record] = await client
      .select()
      .from(schema.scholarships)
      .where(eq(schema.scholarships.scholarshipId, scholarshipId));

    if (!record) return null;

    return {
      scholarshipId: record.scholarshipId,
      scholarshipName: record.scholarshipName,
      description: record.description,
      eligibility: record.eligibility,
      applicationUrl: record.applicationUrl,
      deadline: record.deadline,
    };
  }

  /**
   * Creates a new scholarship master record.
   */
  async createScholarship(input: CreateScholarshipInput): Promise<ScholarshipDTO> {
    const client = this.getDb();
    Logger.info("ScholarshipRepository.createScholarship", { name: input.scholarshipName });

    const [record] = await client
      .insert(schema.scholarships)
      .values({
        scholarshipName: input.scholarshipName,
        description: input.description || null,
        eligibility: input.eligibility || null,
        applicationUrl: input.applicationUrl || null,
        deadline: input.deadline || null,
      })
      .returning();

    return {
      scholarshipId: record.scholarshipId,
      scholarshipName: record.scholarshipName,
      description: record.description,
      eligibility: record.eligibility,
      applicationUrl: record.applicationUrl,
      deadline: record.deadline,
    };
  }

  /**
   * Bookmarks a scholarship for a student.
   */
  async bookmarkScholarship(
    userId: number,
    scholarshipId: number
  ): Promise<StudentScholarshipBookmarkDTO> {
    const client = this.getDb();
    Logger.info("ScholarshipRepository.bookmarkScholarship", { userId, scholarshipId });

    const [record] = await client
      .insert(schema.studentScholarshipBookmarks)
      .values({
        userId,
        scholarshipId,
      })
      .onConflictDoNothing()
      .returning();

    if (!record) {
      // Record already existed, fetch existing
      const [existing] = await client
        .select()
        .from(schema.studentScholarshipBookmarks)
        .where(
          and(
            eq(schema.studentScholarshipBookmarks.userId, userId),
            eq(schema.studentScholarshipBookmarks.scholarshipId, scholarshipId)
          )
        );

      return {
        userId: existing.userId,
        scholarshipId: existing.scholarshipId,
        bookmarkedAt: existing.bookmarkedAt,
      };
    }

    return {
      userId: record.userId,
      scholarshipId: record.scholarshipId,
      bookmarkedAt: record.bookmarkedAt,
    };
  }

  /**
   * Removes a scholarship bookmark for a student.
   */
  async removeBookmark(userId: number, scholarshipId: number): Promise<boolean> {
    const client = this.getDb();
    Logger.info("ScholarshipRepository.removeBookmark", { userId, scholarshipId });

    const result = await client
      .delete(schema.studentScholarshipBookmarks)
      .where(
        and(
          eq(schema.studentScholarshipBookmarks.userId, userId),
          eq(schema.studentScholarshipBookmarks.scholarshipId, scholarshipId)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Checks if a user has bookmarked a specific scholarship.
   */
  async isBookmarked(userId: number, scholarshipId: number): Promise<boolean> {
    const client = this.getDb();
    Logger.debug("ScholarshipRepository.isBookmarked", { userId, scholarshipId });

    const [record] = await client
      .select()
      .from(schema.studentScholarshipBookmarks)
      .where(
        and(
          eq(schema.studentScholarshipBookmarks.userId, userId),
          eq(schema.studentScholarshipBookmarks.scholarshipId, scholarshipId)
        )
      );

    return !!record;
  }

  /**
   * Retrieves all scholarships bookmarked by a student with full scholarship metadata.
   */
  async getUserBookmarkedScholarships(userId: number): Promise<BookmarkedScholarshipDetail[]> {
    const client = this.getDb();
    Logger.debug("ScholarshipRepository.getUserBookmarkedScholarships", { userId });

    const records = await client
      .select({
        scholarshipId: schema.scholarships.scholarshipId,
        scholarshipName: schema.scholarships.scholarshipName,
        description: schema.scholarships.description,
        eligibility: schema.scholarships.eligibility,
        applicationUrl: schema.scholarships.applicationUrl,
        deadline: schema.scholarships.deadline,
        bookmarkedAt: schema.studentScholarshipBookmarks.bookmarkedAt,
      })
      .from(schema.studentScholarshipBookmarks)
      .innerJoin(
        schema.scholarships,
        eq(schema.studentScholarshipBookmarks.scholarshipId, schema.scholarships.scholarshipId)
      )
      .where(eq(schema.studentScholarshipBookmarks.userId, userId))
      .orderBy(desc(schema.studentScholarshipBookmarks.bookmarkedAt));

    return records.map((r) => ({
      scholarship: {
        scholarshipId: r.scholarshipId,
        scholarshipName: r.scholarshipName,
        description: r.description,
        eligibility: r.eligibility,
        applicationUrl: r.applicationUrl,
        deadline: r.deadline,
      },
      bookmarkedAt: r.bookmarkedAt,
    }));
  }
}

export const scholarshipRepository = new ScholarshipRepository();
