/**
 * @file validations/user.validation.ts
 * @description Request body and parameter validation schemas for User Identity, Profiles, and Settings.
 * @domain Bounded Context: User Management & Identity
 */

import { UserRole } from "@/types/api.types";

export interface ValidationResult<T = unknown> {
  valid: boolean;
  success: boolean;
  errors?: string[];
  data?: T;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface CreateProfileInput {
  firstName: string;
  lastName?: string | null;
  collegeId: number;
  courseId: number;
  semester?: number | null;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string | null;
  collegeId?: number | null;
  courseId?: number | null;
  semester?: number | null;
}

export interface CreateSettingsInput {
  notificationEnabled?: boolean;
  theme?: string;
  language?: string;
}

export interface UpdateSettingsInput {
  notificationEnabled?: boolean;
  theme?: string;
  language?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES: UserRole[] = ["student", "faculty", "admin"];
const VALID_THEMES = ["light", "dark", "system"];

export class UserValidation {
  /**
   * Validates user registration payload.
   */
  static validateRegisterInput(data: Partial<CreateUserInput>): ValidationResult<CreateUserInput> {
    const errors: string[] = [];

    if (!data.email || typeof data.email !== "string" || data.email.trim().length === 0) {
      errors.push("Email is required.");
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.push("Invalid email format.");
    } else if (data.email.trim().length > 255) {
      errors.push("Email must not exceed 255 characters.");
    }

    if (!data.password || typeof data.password !== "string") {
      errors.push("Password is required.");
    } else if (data.password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    } else if (data.password.length > 255) {
      errors.push("Password must not exceed 255 characters.");
    }

    if (data.role !== undefined) {
      if (typeof data.role !== "string" || !VALID_ROLES.includes(data.role as UserRole)) {
        errors.push(`Role must be one of: ${VALID_ROLES.join(", ")}.`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        email: data.email!.trim().toLowerCase(),
        password: data.password!,
        role: data.role as UserRole | undefined,
      },
    };
  }

  /**
   * Validates user login payload.
   */
  static validateLoginInput(data: Partial<LoginUserInput>): ValidationResult<LoginUserInput> {
    const errors: string[] = [];

    if (!data.email || typeof data.email !== "string" || data.email.trim().length === 0) {
      errors.push("Email is required.");
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.push("Invalid email format.");
    }

    if (!data.password || typeof data.password !== "string" || data.password.length === 0) {
      errors.push("Password is required.");
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        email: data.email!.trim().toLowerCase(),
        password: data.password!,
      },
    };
  }

  /**
   * Validates student profile setup payload.
   */
  static validateCreateProfileInput(data: Partial<CreateProfileInput>): ValidationResult<CreateProfileInput> {
    const errors: string[] = [];

    if (!data.firstName || typeof data.firstName !== "string" || data.firstName.trim().length === 0) {
      errors.push("First name is required.");
    } else if (data.firstName.trim().length > 100) {
      errors.push("First name must not exceed 100 characters.");
    }

    if (data.lastName !== undefined && data.lastName !== null) {
      if (typeof data.lastName !== "string") {
        errors.push("Last name must be a string.");
      } else if (data.lastName.trim().length > 100) {
        errors.push("Last name must not exceed 100 characters.");
      }
    }

    if (data.collegeId === undefined || typeof data.collegeId !== "number" || !Number.isInteger(data.collegeId) || data.collegeId <= 0) {
      errors.push("College ID is required and must be a positive integer.");
    }

    if (data.courseId === undefined || typeof data.courseId !== "number" || !Number.isInteger(data.courseId) || data.courseId <= 0) {
      errors.push("Course ID is required and must be a positive integer.");
    }

    if (data.semester !== undefined && data.semester !== null) {
      if (typeof data.semester !== "number" || !Number.isInteger(data.semester) || data.semester < 1 || data.semester > 8) {
        errors.push("Semester must be a valid integer between 1 and 8.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        firstName: data.firstName!.trim(),
        lastName: data.lastName ? data.lastName.trim() : null,
        collegeId: data.collegeId!,
        courseId: data.courseId!,
        semester: data.semester || null,
      },
    };
  }

  /**
   * Validates student profile update payload (all fields optional).
   */
  static validateUpdateProfileInput(data: Partial<UpdateProfileInput>): ValidationResult<UpdateProfileInput> {
    const errors: string[] = [];

    if (data.firstName !== undefined) {
      if (typeof data.firstName !== "string" || data.firstName.trim().length === 0) {
        errors.push("First name cannot be empty.");
      } else if (data.firstName.trim().length > 100) {
        errors.push("First name must not exceed 100 characters.");
      }
    }

    if (data.lastName !== undefined && data.lastName !== null) {
      if (typeof data.lastName !== "string") {
        errors.push("Last name must be a string.");
      } else if (data.lastName.trim().length > 100) {
        errors.push("Last name must not exceed 100 characters.");
      }
    }

    if (data.collegeId !== undefined && data.collegeId !== null) {
      if (typeof data.collegeId !== "number" || !Number.isInteger(data.collegeId) || data.collegeId <= 0) {
        errors.push("College ID must be a positive integer.");
      }
    }

    if (data.courseId !== undefined && data.courseId !== null) {
      if (typeof data.courseId !== "number" || !Number.isInteger(data.courseId) || data.courseId <= 0) {
        errors.push("Course ID must be a positive integer.");
      }
    }

    if (data.semester !== undefined && data.semester !== null) {
      if (typeof data.semester !== "number" || !Number.isInteger(data.semester) || data.semester < 1 || data.semester > 8) {
        errors.push("Semester must be a valid integer between 1 and 8.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName.trim() }),
        ...(data.lastName !== undefined && { lastName: data.lastName ? data.lastName.trim() : null }),
        ...(data.collegeId !== undefined && { collegeId: data.collegeId }),
        ...(data.courseId !== undefined && { courseId: data.courseId }),
        ...(data.semester !== undefined && { semester: data.semester }),
      },
    };
  }

  /**
   * Validates student settings payload.
   */
  static validateSettingsInput(data: Partial<UpdateSettingsInput>): ValidationResult<UpdateSettingsInput> {
    const errors: string[] = [];

    if (data.notificationEnabled !== undefined && typeof data.notificationEnabled !== "boolean") {
      errors.push("Notification enabled must be a boolean.");
    }

    if (data.theme !== undefined) {
      if (typeof data.theme !== "string" || !VALID_THEMES.includes(data.theme)) {
        errors.push(`Theme must be one of: ${VALID_THEMES.join(", ")}.`);
      }
    }

    if (data.language !== undefined) {
      if (typeof data.language !== "string" || data.language.trim().length === 0 || data.language.trim().length > 10) {
        errors.push("Language must be a valid string between 1 and 10 characters.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        ...(data.notificationEnabled !== undefined && { notificationEnabled: data.notificationEnabled }),
        ...(data.theme !== undefined && { theme: data.theme.trim() }),
        ...(data.language !== undefined && { language: data.language.trim() }),
      },
    };
  }
}
