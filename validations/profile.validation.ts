/**
 * @file validations/profile.validation.ts
 * @description Request body and query parameter validation schemas for student profiles.
 * @purpose Sanitizes and validates incoming profile data before hitting the Service Layer.
 */

export interface CreateProfileInput {
  fullName: string;
  collegeName: string;
  collegeType: "vtu_affiliated" | "autonomous";
  branch: string;
  semester: number;
  targetSgpa: number;
  primaryGoal: string;
}

export class ProfileValidation {
  /**
   * Validates profile setup request body primitives.
   * TODO: Replace with Zod / Valibot schema parser when Zod library is added.
   */
  static validateCreateInput(data: Partial<CreateProfileInput>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push("Full name must be at least 2 characters long.");
    }

    if (!data.collegeName || data.collegeName.trim().length === 0) {
      errors.push("College name is required.");
    }

    if (!data.collegeType || !["vtu_affiliated", "autonomous"].includes(data.collegeType)) {
      errors.push("College type must be 'vtu_affiliated' or 'autonomous'.");
    }

    if (typeof data.semester !== "number" || data.semester < 1 || data.semester > 8) {
      errors.push("Semester must be a valid integer between 1 and 8.");
    }

    if (typeof data.targetSgpa !== "number" || data.targetSgpa < 0 || data.targetSgpa > 10) {
      errors.push("Target SGPA must be a number between 0 and 10.");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
