/**
 * @file services/scholarship.service.ts
 * @description Business Logic Layer (BLL) for Scholarships and Student Bookmarks.
 * @domain Bounded Context: Student Financial Aid & Scholarships
 * @purpose Implements business validation rules, student bookmark ownership, and discovery orchestration.
 */

import {
  scholarshipRepository,
  ScholarshipRepository,
  BookmarkedScholarshipDetail,
} from "@/repositories/scholarship.repository";
import { userRepository, UserRepository } from "@/repositories/user.repository";
import {
  ScholarshipValidation,
  CreateScholarshipInput,
  ScholarshipFilterInput,
  BookmarkScholarshipInput,
} from "@/validations/scholarship.validation";
import {
  ScholarshipDTO,
  ScholarshipWithBookmarkDTO,
  StudentScholarshipBookmarkDTO,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class ScholarshipService {
  constructor(
    private scholarshipRepo: ScholarshipRepository = scholarshipRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  /**
   * Lists all scholarships with optional search and active deadline filters.
   */
  async listScholarships(filter?: Partial<ScholarshipFilterInput>): Promise<ScholarshipDTO[]> {
    Logger.debug("ScholarshipService.listScholarships invoked", filter);

    let cleanFilter = undefined;
    if (filter && Object.keys(filter).length > 0) {
      const validation = ScholarshipValidation.validateScholarshipFilter(filter);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      cleanFilter = validation.data;
    }

    return this.scholarshipRepo.listScholarships(cleanFilter);
  }

  /**
   * Lists all scholarships with student-specific bookmark status (single-query feed).
   */
  async listScholarshipsForStudent(
    userId: number,
    filter?: Partial<ScholarshipFilterInput>
  ): Promise<ScholarshipWithBookmarkDTO[]> {
    Logger.debug("ScholarshipService.listScholarshipsForStudent invoked", { userId, ...filter });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    let cleanFilter = undefined;
    if (filter && Object.keys(filter).length > 0) {
      const validation = ScholarshipValidation.validateScholarshipFilter(filter);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      cleanFilter = validation.data;
    }

    return this.scholarshipRepo.listScholarshipsWithBookmarkStatus(userId, cleanFilter);
  }

  /**
   * Retrieves a single scholarship by primary key.
   */
  async getScholarshipById(scholarshipId: number): Promise<ScholarshipDTO> {
    Logger.debug("ScholarshipService.getScholarshipById invoked", { scholarshipId });

    if (!scholarshipId || typeof scholarshipId !== "number" || scholarshipId <= 0) {
      throw new Error("Validation Error: Scholarship ID must be a positive integer.");
    }

    const scholarship = await this.scholarshipRepo.getScholarshipById(scholarshipId);
    if (!scholarship) {
      throw new Error(`Not Found Error: Scholarship not found with ID: ${scholarshipId}`);
    }

    return scholarship;
  }

  /**
   * Creates a new scholarship master record.
   */
  async createScholarship(input: Partial<CreateScholarshipInput>): Promise<ScholarshipDTO> {
    Logger.info("ScholarshipService.createScholarship invoked", { name: input.scholarshipName });

    // Step 1: Syntactic Validation
    const validation = ScholarshipValidation.validateCreateScholarshipInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Persist via Data Access Layer
    return this.scholarshipRepo.createScholarship(validation.data);
  }

  /**
   * Deletes a scholarship record (cascading bookmarks via DB ON DELETE CASCADE).
   */
  async deleteScholarship(scholarshipId: number): Promise<boolean> {
    Logger.info("ScholarshipService.deleteScholarship invoked", { scholarshipId });

    if (!scholarshipId || typeof scholarshipId !== "number" || scholarshipId <= 0) {
      throw new Error("Validation Error: Scholarship ID must be a positive integer.");
    }

    const deleted = await this.scholarshipRepo.deleteScholarship(scholarshipId);
    if (!deleted) {
      throw new Error(`Not Found Error: Scholarship not found with ID: ${scholarshipId}`);
    }

    return true;
  }

  /**
   * Bookmarks a scholarship for the authenticated student.
   */
  async bookmarkScholarship(
    userId: number,
    input: Partial<BookmarkScholarshipInput>
  ): Promise<StudentScholarshipBookmarkDTO> {
    Logger.info("ScholarshipService.bookmarkScholarship invoked", { userId, scholarshipId: input.scholarshipId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = ScholarshipValidation.validateBookmarkInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Ensure user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Not Found Error: User does not exist.");
    }

    // Step 3: Semantic Check — Ensure scholarship exists
    const scholarship = await this.scholarshipRepo.getScholarshipById(validation.data.scholarshipId);
    if (!scholarship) {
      throw new Error(`Not Found Error: Scholarship not found with ID: ${validation.data.scholarshipId}`);
    }

    // Step 4: Persist via Data Access Layer
    return this.scholarshipRepo.bookmarkScholarship(userId, validation.data.scholarshipId);
  }

  /**
   * Removes a student bookmark for a scholarship.
   */
  async removeBookmark(userId: number, scholarshipId: number): Promise<boolean> {
    Logger.info("ScholarshipService.removeBookmark invoked", { userId, scholarshipId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!scholarshipId || typeof scholarshipId !== "number" || scholarshipId <= 0) {
      throw new Error("Validation Error: Scholarship ID must be a positive integer.");
    }

    const removed = await this.scholarshipRepo.removeBookmark(userId, scholarshipId);
    if (!removed) {
      throw new Error(`Not Found Error: Bookmark not found for scholarship ID: ${scholarshipId}`);
    }

    return true;
  }

  /**
   * Retrieves all scholarships bookmarked by an authenticated student.
   */
  async getUserBookmarks(userId: number): Promise<BookmarkedScholarshipDetail[]> {
    Logger.debug("ScholarshipService.getUserBookmarks invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    return this.scholarshipRepo.getUserBookmarkedScholarships(userId);
  }
}

export const scholarshipService = new ScholarshipService();
