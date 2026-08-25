/**
 * @file services/opportunity.service.ts
 * @description Business Logic Layer (BLL) for Opportunities and Student Application Tracking.
 * @domain Bounded Context: Internships, Jobs, Hackathons & Application Tracking
 * @purpose Implements application tracking validation, ownership scoping, and catalog discovery.
 */

import {
  opportunityRepository,
  OpportunityRepository,
  TrackedOpportunityDetail,
} from "@/repositories/opportunity.repository";
import { userRepository, UserRepository } from "@/repositories/user.repository";
import {
  OpportunityValidation,
  CreateOpportunityInput,
  OpportunityFilterInput,
  TrackOpportunityInput,
} from "@/validations/opportunity.validation";
import {
  OpportunityDTO,
  OpportunityWithTrackingDTO,
  StudentOpportunityDTO,
  OpportunityStatus,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class OpportunityService {
  constructor(
    private opportunityRepo: OpportunityRepository = opportunityRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  /**
   * Lists all master opportunities with optional search and active deadline filters.
   */
  async listOpportunities(filter?: Partial<OpportunityFilterInput>): Promise<OpportunityDTO[]> {
    Logger.debug("OpportunityService.listOpportunities invoked", filter);

    let cleanFilter = undefined;
    if (filter && Object.keys(filter).length > 0) {
      const validation = OpportunityValidation.validateOpportunityFilter(filter);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      cleanFilter = validation.data;
    }

    return this.opportunityRepo.listOpportunities(cleanFilter);
  }

  /**
   * Lists all opportunities with the authenticated student's tracking status (single-query feed).
   */
  async listOpportunitiesForStudent(
    userId: number,
    filter?: Partial<OpportunityFilterInput>
  ): Promise<OpportunityWithTrackingDTO[]> {
    Logger.debug("OpportunityService.listOpportunitiesForStudent invoked", { userId, ...filter });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    let cleanFilter = undefined;
    if (filter && Object.keys(filter).length > 0) {
      const validation = OpportunityValidation.validateOpportunityFilter(filter);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      cleanFilter = validation.data;
    }

    return this.opportunityRepo.listOpportunitiesWithTrackingStatus(userId, cleanFilter);
  }

  /**
   * Retrieves a single opportunity by primary key.
   */
  async getOpportunityById(opportunityId: number): Promise<OpportunityDTO> {
    Logger.debug("OpportunityService.getOpportunityById invoked", { opportunityId });

    if (!opportunityId || typeof opportunityId !== "number" || opportunityId <= 0) {
      throw new Error("Validation Error: Opportunity ID must be a positive integer.");
    }

    const opportunity = await this.opportunityRepo.getOpportunityById(opportunityId);
    if (!opportunity) {
      throw new Error(`Not Found Error: Opportunity not found with ID: ${opportunityId}`);
    }

    return opportunity;
  }

  /**
   * Creates a new master opportunity record.
   */
  async createOpportunity(input: Partial<CreateOpportunityInput>): Promise<OpportunityDTO> {
    Logger.info("OpportunityService.createOpportunity invoked", { title: input.title });

    // Step 1: Syntactic Validation
    const validation = OpportunityValidation.validateCreateOpportunityInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Persist via Data Access Layer
    return this.opportunityRepo.createOpportunity(validation.data);
  }

  /**
   * Deletes an opportunity (cascading tracking records via DB ON DELETE CASCADE).
   */
  async deleteOpportunity(opportunityId: number): Promise<boolean> {
    Logger.info("OpportunityService.deleteOpportunity invoked", { opportunityId });

    if (!opportunityId || typeof opportunityId !== "number" || opportunityId <= 0) {
      throw new Error("Validation Error: Opportunity ID must be a positive integer.");
    }

    const deleted = await this.opportunityRepo.deleteOpportunity(opportunityId);
    if (!deleted) {
      throw new Error(`Not Found Error: Opportunity not found with ID: ${opportunityId}`);
    }

    return true;
  }

  /**
   * Tracks an opportunity status ('saved' | 'applied' | 'shortlisted' | 'rejected') for a student.
   */
  async trackOpportunity(
    userId: number,
    input: Partial<TrackOpportunityInput>
  ): Promise<StudentOpportunityDTO> {
    Logger.info("OpportunityService.trackOpportunity invoked", { userId, opportunityId: input.opportunityId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = OpportunityValidation.validateTrackOpportunityInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Ensure user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Not Found Error: User does not exist.");
    }

    // Step 3: Semantic Check — Ensure opportunity exists
    const opportunity = await this.opportunityRepo.getOpportunityById(validation.data.opportunityId);
    if (!opportunity) {
      throw new Error(`Not Found Error: Opportunity not found with ID: ${validation.data.opportunityId}`);
    }

    // Step 4: Persist via Data Access Layer
    return this.opportunityRepo.trackOpportunity(
      userId,
      validation.data.opportunityId,
      validation.data.status
    );
  }

  /**
   * Retrieves the current student's tracking status for a specific opportunity.
   */
  async getStudentTrackingStatus(
    userId: number,
    opportunityId: number
  ): Promise<StudentOpportunityDTO | null> {
    Logger.debug("OpportunityService.getStudentTrackingStatus invoked", { userId, opportunityId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!opportunityId || typeof opportunityId !== "number" || opportunityId <= 0) {
      throw new Error("Validation Error: Opportunity ID must be a positive integer.");
    }

    return this.opportunityRepo.getStudentOpportunityStatus(userId, opportunityId);
  }

  /**
   * Retrieves all opportunities tracked by a student, optionally filtered by status.
   */
  async getUserTrackedOpportunities(
    userId: number,
    status?: OpportunityStatus
  ): Promise<TrackedOpportunityDetail[]> {
    Logger.debug("OpportunityService.getUserTrackedOpportunities invoked", { userId, status });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    if (status && !["saved", "applied", "shortlisted", "rejected"].includes(status)) {
      throw new Error("Validation Error: Status must be one of: saved, applied, shortlisted, rejected.");
    }

    return this.opportunityRepo.getUserTrackedOpportunities(userId, status);
  }

  /**
   * Untracks an opportunity for the authenticated student.
   */
  async untrackOpportunity(userId: number, opportunityId: number): Promise<boolean> {
    Logger.info("OpportunityService.untrackOpportunity invoked", { userId, opportunityId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!opportunityId || typeof opportunityId !== "number" || opportunityId <= 0) {
      throw new Error("Validation Error: Opportunity ID must be a positive integer.");
    }

    const untracked = await this.opportunityRepo.untrackOpportunity(userId, opportunityId);
    if (!untracked) {
      throw new Error(`Not Found Error: Opportunity tracking record not found for ID: ${opportunityId}`);
    }

    return true;
  }
}

export const opportunityService = new OpportunityService();
