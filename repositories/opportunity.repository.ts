/**
 * @file repositories/opportunity.repository.ts
 * @description Data Access Layer for Opportunities and Student Application Tracking.
 * @domain Bounded Context: Internships, Jobs, Hackathons & Application Tracking
 * @tables opportunities, student_opportunities
 */

import { db, schema } from "@/lib/db";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  OpportunityDTO,
  StudentOpportunityDTO,
  OpportunityStatus,
} from "@/types/api.types";

export interface CreateOpportunityInput {
  title: string;
  company?: string | null;
  description?: string | null;
  applicationUrl?: string | null;
  deadline?: string | null;
}

export interface TrackedOpportunityDetail {
  opportunity: OpportunityDTO;
  status: OpportunityStatus;
  savedAt: string;
}

export class OpportunityRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  // ==========================================
  // Opportunities
  // ==========================================

  async listOpportunities(filter?: { search?: string }): Promise<OpportunityDTO[]> {
    const client = this.getDb();
    Logger.debug("OpportunityRepository.listOpportunities", filter);

    let query = client.select().from(schema.opportunities);
    if (filter?.search) {
      const term = `%${filter.search}%`;
      query = client
        .select()
        .from(schema.opportunities)
        .where(
          or(
            ilike(schema.opportunities.title, term),
            ilike(schema.opportunities.company, term)
          )
        ) as typeof query;
    }

    const records = await query;

    return records.map((r) => ({
      opportunityId: r.opportunityId,
      title: r.title,
      company: r.company,
      description: r.description,
      applicationUrl: r.applicationUrl,
      deadline: r.deadline,
    }));
  }

  async getOpportunityById(opportunityId: number): Promise<OpportunityDTO | null> {
    const client = this.getDb();
    Logger.debug("OpportunityRepository.getOpportunityById", { opportunityId });

    const [record] = await client
      .select()
      .from(schema.opportunities)
      .where(eq(schema.opportunities.opportunityId, opportunityId));

    if (!record) return null;

    return {
      opportunityId: record.opportunityId,
      title: record.title,
      company: record.company,
      description: record.description,
      applicationUrl: record.applicationUrl,
      deadline: record.deadline,
    };
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<OpportunityDTO> {
    const client = this.getDb();
    Logger.info("OpportunityRepository.createOpportunity", { title: input.title });

    const [record] = await client
      .insert(schema.opportunities)
      .values({
        title: input.title,
        company: input.company || null,
        description: input.description || null,
        applicationUrl: input.applicationUrl || null,
        deadline: input.deadline || null,
      })
      .returning();

    return {
      opportunityId: record.opportunityId,
      title: record.title,
      company: record.company,
      description: record.description,
      applicationUrl: record.applicationUrl,
      deadline: record.deadline,
    };
  }

  // ==========================================
  // Student Opportunities Tracking
  // ==========================================

  /**
   * Tracks or updates application status for a student (saved, applied, shortlisted, rejected).
   */
  async trackOpportunity(
    userId: number,
    opportunityId: number,
    status: OpportunityStatus
  ): Promise<StudentOpportunityDTO> {
    const client = this.getDb();
    Logger.info("OpportunityRepository.trackOpportunity", { userId, opportunityId, status });

    const [record] = await client
      .insert(schema.studentOpportunities)
      .values({
        userId,
        opportunityId,
        status,
      })
      .onConflictDoUpdate({
        target: [schema.studentOpportunities.userId, schema.studentOpportunities.opportunityId],
        set: {
          status,
          savedAt: new Date().toISOString(),
        },
      })
      .returning();

    return {
      userId: record.userId,
      opportunityId: record.opportunityId,
      status: record.status as OpportunityStatus,
      savedAt: record.savedAt,
    };
  }

  /**
   * Retrieves all opportunities tracked by a user with full opportunity details.
   */
  async getUserTrackedOpportunities(
    userId: number,
    statusFilter?: OpportunityStatus
  ): Promise<TrackedOpportunityDetail[]> {
    const client = this.getDb();
    Logger.debug("OpportunityRepository.getUserTrackedOpportunities", { userId, statusFilter });

    const conditions = [eq(schema.studentOpportunities.userId, userId)];
    if (statusFilter) {
      conditions.push(eq(schema.studentOpportunities.status, statusFilter));
    }

    const records = await client
      .select({
        opportunityId: schema.opportunities.opportunityId,
        title: schema.opportunities.title,
        company: schema.opportunities.company,
        description: schema.opportunities.description,
        applicationUrl: schema.opportunities.applicationUrl,
        deadline: schema.opportunities.deadline,
        status: schema.studentOpportunities.status,
        savedAt: schema.studentOpportunities.savedAt,
      })
      .from(schema.studentOpportunities)
      .innerJoin(
        schema.opportunities,
        eq(schema.studentOpportunities.opportunityId, schema.opportunities.opportunityId)
      )
      .where(and(...conditions))
      .orderBy(desc(schema.studentOpportunities.savedAt));

    return records.map((r) => ({
      opportunity: {
        opportunityId: r.opportunityId,
        title: r.title,
        company: r.company,
        description: r.description,
        applicationUrl: r.applicationUrl,
        deadline: r.deadline,
      },
      status: r.status as OpportunityStatus,
      savedAt: r.savedAt,
    }));
  }

  /**
   * Retrieves tracking status for a specific student and opportunity.
   */
  async getStudentOpportunityStatus(
    userId: number,
    opportunityId: number
  ): Promise<StudentOpportunityDTO | null> {
    const client = this.getDb();
    Logger.debug("OpportunityRepository.getStudentOpportunityStatus", { userId, opportunityId });

    const [record] = await client
      .select()
      .from(schema.studentOpportunities)
      .where(
        and(
          eq(schema.studentOpportunities.userId, userId),
          eq(schema.studentOpportunities.opportunityId, opportunityId)
        )
      );

    if (!record) return null;

    return {
      userId: record.userId,
      opportunityId: record.opportunityId,
      status: record.status as OpportunityStatus,
      savedAt: record.savedAt,
    };
  }
}

export const opportunityRepository = new OpportunityRepository();
