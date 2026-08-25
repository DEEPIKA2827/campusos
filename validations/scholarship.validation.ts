/**
 * @file validations/scholarship.validation.ts
 * @description Request body and parameter validation schemas for Scholarships and Student Bookmarks.
 * @domain Bounded Context: Student Financial Aid & Scholarships
 */

import { ValidationResult } from "./user.validation";

export interface CreateScholarshipInput {
  scholarshipName: string;
  description?: string | null;
  eligibility?: string | null;
  applicationUrl?: string | null;
  deadline?: string | null;
}

export interface ScholarshipFilterInput {
  search?: string;
  activeOnly?: boolean;
}

export interface BookmarkScholarshipInput {
  scholarshipId: number;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const URL_REGEX = /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+[/#?]?.*$/;

export class ScholarshipValidation {
  /**
   * Validates scholarship creation payload.
   */
  static validateCreateScholarshipInput(
    data: Partial<CreateScholarshipInput>
  ): ValidationResult<CreateScholarshipInput> {
    const errors: string[] = [];

    if (!data.scholarshipName || typeof data.scholarshipName !== "string" || data.scholarshipName.trim().length === 0) {
      errors.push("Scholarship name is required.");
    } else if (data.scholarshipName.trim().length > 255) {
      errors.push("Scholarship name must not exceed 255 characters.");
    }

    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== "string") {
        errors.push("Description must be a string.");
      } else if (data.description.trim().length > 5000) {
        errors.push("Description must not exceed 5000 characters.");
      }
    }

    if (data.eligibility !== undefined && data.eligibility !== null) {
      if (typeof data.eligibility !== "string") {
        errors.push("Eligibility must be a string.");
      } else if (data.eligibility.trim().length > 2000) {
        errors.push("Eligibility must not exceed 2000 characters.");
      }
    }

    if (data.applicationUrl !== undefined && data.applicationUrl !== null) {
      if (typeof data.applicationUrl !== "string") {
        errors.push("Application URL must be a string.");
      } else if (data.applicationUrl.trim().length > 1000) {
        errors.push("Application URL must not exceed 1000 characters.");
      } else if (!URL_REGEX.test(data.applicationUrl.trim())) {
        errors.push("Application URL must be a valid web URL.");
      }
    }

    if (data.deadline !== undefined && data.deadline !== null) {
      if (typeof data.deadline !== "string" || !ISO_DATE_REGEX.test(data.deadline.trim())) {
        errors.push("Deadline must be in YYYY-MM-DD format.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        scholarshipName: data.scholarshipName!.trim(),
        description: data.description ? data.description.trim() : null,
        eligibility: data.eligibility ? data.eligibility.trim() : null,
        applicationUrl: data.applicationUrl ? data.applicationUrl.trim() : null,
        deadline: data.deadline ? data.deadline.trim() : null,
      },
    };
  }

  /**
   * Validates scholarship search and active deadline filter.
   */
  static validateScholarshipFilter(
    data: Partial<ScholarshipFilterInput>
  ): ValidationResult<ScholarshipFilterInput> {
    const errors: string[] = [];

    if (data.search !== undefined) {
      if (typeof data.search !== "string") {
        errors.push("Search query must be a string.");
      } else if (data.search.trim().length > 100) {
        errors.push("Search query must not exceed 100 characters.");
      }
    }

    if (data.activeOnly !== undefined && typeof data.activeOnly !== "boolean") {
      errors.push("activeOnly must be a boolean.");
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        ...(data.search !== undefined && { search: data.search.trim() }),
        ...(data.activeOnly !== undefined && { activeOnly: data.activeOnly }),
      },
    };
  }

  /**
   * Validates bookmark scholarship request payload.
   */
  static validateBookmarkInput(data: Partial<BookmarkScholarshipInput>): ValidationResult<BookmarkScholarshipInput> {
    const errors: string[] = [];

    if (data.scholarshipId === undefined || typeof data.scholarshipId !== "number" || !Number.isInteger(data.scholarshipId) || data.scholarshipId <= 0) {
      errors.push("Scholarship ID is required and must be a positive integer.");
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        scholarshipId: data.scholarshipId!,
      },
    };
  }
}
