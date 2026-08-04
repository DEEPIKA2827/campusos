/**
 * @file services/profile.service.ts
 * @description Business Logic Layer (BLL) for Student Profiles.
 * @purpose Implements business validation rules and orchestrates data flow between API routes and Repositories.
 */

import { profileRepository, ProfileRepository } from "@/repositories/profile.repository";
import { ProfileValidation, CreateProfileInput } from "@/validations/profile.validation";
import { StudentProfileDTO } from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class ProfileService {
  constructor(private repo: ProfileRepository = profileRepository) {}

  /**
   * Retrieves profile for an authenticated student.
   */
  async getStudentProfile(userId: string): Promise<StudentProfileDTO | null> {
    Logger.info("ProfileService.getStudentProfile invoked", { userId });
    return this.repo.findByUserId(userId);
  }

  /**
   * Orchestrates profile setup: validates input schema, checks duplicate registration, saves via repository.
   */
  async setupStudentProfile(userId: string, email: string, input: CreateProfileInput): Promise<StudentProfileDTO> {
    Logger.info("ProfileService.setupStudentProfile invoked", { userId });

    // Step 1: Validate input fields
    const validation = ProfileValidation.validateCreateInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: TODO - Check if profile already exists in DB
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new Error("Conflict Error: Student profile already exists.");
    }

    // Step 3: Persist via Data Access Layer
    return this.repo.createProfile(userId, email, input);
  }
}

export const profileService = new ProfileService();
