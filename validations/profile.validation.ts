/**
 * @file validations/profile.validation.ts
 * @description Request body and query parameter validation schemas for student profiles.
 * @purpose Sanitizes and validates incoming profile data before hitting the Service Layer.
 */

export interface CreateProfileInput {
  firstName: string;
  lastName?: string;
  collegeId: number;
  courseId: number;
  semester?: number;
}

export interface CreateSettingsInput {
  notificationEnabled?: boolean;
  theme?: string;
  language?: string;
}

export class ProfileValidation {
  /**
   * Validates profile setup request body primitives.
   * TODO: Replace with Zod / Valibot schema parser when Zod library is added.
   */
  static validateCreateInput(data: Partial<CreateProfileInput>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push("First name is required.");
    }

    if (data.collegeId === undefined || typeof data.collegeId !== "number") {
      errors.push("College ID is required and must be a number.");
    }

    if (data.courseId === undefined || typeof data.courseId !== "number") {
      errors.push("Course ID is required and must be a number.");
    }

    if (data.semester !== undefined) {
      if (typeof data.semester !== "number" || data.semester < 1 || data.semester > 8) {
        errors.push("Semester must be a valid integer between 1 and 8.");
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateSettingsInput(data: Partial<CreateSettingsInput>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    if (data.notificationEnabled !== undefined && typeof data.notificationEnabled !== "boolean") {
      errors.push("Notification enabled must be a boolean.");
    }

    if (data.theme !== undefined && typeof data.theme !== "string") {
      errors.push("Theme must be a string.");
    }

    if (data.language !== undefined && typeof data.language !== "string") {
      errors.push("Language must be a string.");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
