/**
 * @file validations/academic.validation.ts
 * @description Request body and parameter validation schemas for Colleges, Academic Schemes, and Courses.
 * @domain Bounded Context: Academic Curriculum & Institution Directory
 */

import { ValidationResult } from "./user.validation";

export interface CreateCollegeInput {
  collegeName: string;
  location?: string | null;
}

export interface CreateSchemeInput {
  collegeId: number;
  schemeName: string;
  academicYear?: string | null;
}

export interface CreateCourseInput {
  schemeId: number;
  courseName: string;
  courseCode?: string | null;
}

export interface CourseFilterInput {
  schemeId?: number;
  search?: string;
}

export class AcademicValidation {
  /**
   * Validates college creation payload.
   */
  static validateCreateCollegeInput(data: Partial<CreateCollegeInput>): ValidationResult<CreateCollegeInput> {
    const errors: string[] = [];

    if (!data.collegeName || typeof data.collegeName !== "string" || data.collegeName.trim().length === 0) {
      errors.push("College name is required.");
    } else if (data.collegeName.trim().length > 255) {
      errors.push("College name must not exceed 255 characters.");
    }

    if (data.location !== undefined && data.location !== null) {
      if (typeof data.location !== "string") {
        errors.push("Location must be a string.");
      } else if (data.location.trim().length > 255) {
        errors.push("Location must not exceed 255 characters.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        collegeName: data.collegeName!.trim(),
        location: data.location ? data.location.trim() : null,
      },
    };
  }

  /**
   * Validates academic scheme creation payload.
   */
  static validateCreateSchemeInput(data: Partial<CreateSchemeInput>): ValidationResult<CreateSchemeInput> {
    const errors: string[] = [];

    if (data.collegeId === undefined || typeof data.collegeId !== "number" || !Number.isInteger(data.collegeId) || data.collegeId <= 0) {
      errors.push("College ID is required and must be a positive integer.");
    }

    if (!data.schemeName || typeof data.schemeName !== "string" || data.schemeName.trim().length === 0) {
      errors.push("Scheme name is required.");
    } else if (data.schemeName.trim().length > 100) {
      errors.push("Scheme name must not exceed 100 characters.");
    }

    if (data.academicYear !== undefined && data.academicYear !== null) {
      if (typeof data.academicYear !== "string") {
        errors.push("Academic year must be a string.");
      } else if (data.academicYear.trim().length > 20) {
        errors.push("Academic year must not exceed 20 characters.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        collegeId: data.collegeId!,
        schemeName: data.schemeName!.trim(),
        academicYear: data.academicYear ? data.academicYear.trim() : null,
      },
    };
  }

  /**
   * Validates course creation payload.
   */
  static validateCreateCourseInput(data: Partial<CreateCourseInput>): ValidationResult<CreateCourseInput> {
    const errors: string[] = [];

    if (data.schemeId === undefined || typeof data.schemeId !== "number" || !Number.isInteger(data.schemeId) || data.schemeId <= 0) {
      errors.push("Scheme ID is required and must be a positive integer.");
    }

    if (!data.courseName || typeof data.courseName !== "string" || data.courseName.trim().length === 0) {
      errors.push("Course name is required.");
    } else if (data.courseName.trim().length > 255) {
      errors.push("Course name must not exceed 255 characters.");
    }

    if (data.courseCode !== undefined && data.courseCode !== null) {
      if (typeof data.courseCode !== "string") {
        errors.push("Course code must be a string.");
      } else if (data.courseCode.trim().length > 50) {
        errors.push("Course code must not exceed 50 characters.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        schemeId: data.schemeId!,
        courseName: data.courseName!.trim(),
        courseCode: data.courseCode ? data.courseCode.trim().toUpperCase() : null,
      },
    };
  }

  /**
   * Validates course filter parameters.
   */
  static validateCourseFilter(data: Partial<CourseFilterInput>): ValidationResult<CourseFilterInput> {
    const errors: string[] = [];

    if (data.schemeId !== undefined) {
      if (typeof data.schemeId !== "number" || !Number.isInteger(data.schemeId) || data.schemeId <= 0) {
        errors.push("Scheme ID must be a positive integer.");
      }
    }

    if (data.search !== undefined) {
      if (typeof data.search !== "string") {
        errors.push("Search term must be a string.");
      } else if (data.search.trim().length > 100) {
        errors.push("Search term must not exceed 100 characters.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        ...(data.schemeId !== undefined && { schemeId: data.schemeId }),
        ...(data.search !== undefined && { search: data.search.trim() }),
      },
    };
  }
}
