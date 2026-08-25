/**
 * @file validations/profile.validation.ts
 * @description Backwards-compatible facade re-exporting from user.validation.ts.
 * @purpose Preserves existing imports while unifying user, profile, and settings validations.
 */

import {
  UserValidation,
  CreateProfileInput,
  CreateSettingsInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  ValidationResult,
} from "./user.validation";

export type {
  CreateProfileInput,
  CreateSettingsInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  ValidationResult,
};

export class ProfileValidation {
  /**
   * Validates profile setup request body primitives.
   */
  static validateCreateInput(data: Partial<CreateProfileInput>): ValidationResult<CreateProfileInput> {
    return UserValidation.validateCreateProfileInput(data);
  }

  /**
   * Validates profile settings primitives.
   */
  static validateSettingsInput(data: Partial<CreateSettingsInput>): ValidationResult<CreateSettingsInput> {
    return UserValidation.validateSettingsInput(data);
  }
}
