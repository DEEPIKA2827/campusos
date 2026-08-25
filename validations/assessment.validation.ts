/**
 * @file validations/assessment.validation.ts
 * @description Request body and parameter validation schemas for Assessments, Marks, PYQs, and Viva Questions.
 * @domain Bounded Context: Course Assessments, Evaluations & Study Material
 */

import { Difficulty } from "@/types/api.types";
import { ValidationResult } from "./user.validation";

export interface CreateCieAssessmentInput {
  courseId: number;
  assessmentName: string;
  assessmentDate?: string | null;
  maxMarks: number;
}

export interface RecordStudentMarkInput {
  cieId: number;
  marksObtained: number;
}

export interface CreatePyqInput {
  courseId: number;
  question: string;
  examYear?: number | null;
  marks?: number | null;
  difficulty?: Difficulty | null;
}

export interface CreateVivaQuestionInput {
  courseId: number;
  question: string;
  difficulty?: Difficulty | null;
}

export interface PyqFilterInput {
  difficulty?: Difficulty;
  year?: number;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export class AssessmentValidation {
  /**
   * Validates CIE assessment master definition payload.
   */
  static validateCreateCieAssessmentInput(
    data: Partial<CreateCieAssessmentInput>
  ): ValidationResult<CreateCieAssessmentInput> {
    const errors: string[] = [];

    if (data.courseId === undefined || typeof data.courseId !== "number" || !Number.isInteger(data.courseId) || data.courseId <= 0) {
      errors.push("Course ID is required and must be a positive integer.");
    }

    if (!data.assessmentName || typeof data.assessmentName !== "string" || data.assessmentName.trim().length === 0) {
      errors.push("Assessment name is required.");
    } else if (data.assessmentName.trim().length > 100) {
      errors.push("Assessment name must not exceed 100 characters.");
    }

    if (data.assessmentDate !== undefined && data.assessmentDate !== null) {
      if (typeof data.assessmentDate !== "string" || !ISO_DATE_REGEX.test(data.assessmentDate.trim())) {
        errors.push("Assessment date must be in YYYY-MM-DD format.");
      }
    }

    if (data.maxMarks === undefined || typeof data.maxMarks !== "number" || isNaN(data.maxMarks) || data.maxMarks <= 0 || data.maxMarks > 100) {
      errors.push("Max marks is required and must be a number between 0.01 and 100.00.");
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        courseId: data.courseId!,
        assessmentName: data.assessmentName!.trim(),
        assessmentDate: data.assessmentDate ? data.assessmentDate.trim() : null,
        maxMarks: Number(data.maxMarks!.toFixed(2)),
      },
    };
  }

  /**
   * Validates student CIE mark entry payload.
   */
  static validateRecordStudentMarkInput(
    data: Partial<RecordStudentMarkInput>
  ): ValidationResult<RecordStudentMarkInput> {
    const errors: string[] = [];

    if (data.cieId === undefined || typeof data.cieId !== "number" || !Number.isInteger(data.cieId) || data.cieId <= 0) {
      errors.push("CIE assessment ID is required and must be a positive integer.");
    }

    if (data.marksObtained === undefined || typeof data.marksObtained !== "number" || isNaN(data.marksObtained) || data.marksObtained < 0 || data.marksObtained > 100) {
      errors.push("Marks obtained is required and must be a non-negative number up to 100.00.");
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        cieId: data.cieId!,
        marksObtained: Number(data.marksObtained!.toFixed(2)),
      },
    };
  }

  /**
   * Validates previous-year question (PYQ) creation payload.
   */
  static validateCreatePyqInput(data: Partial<CreatePyqInput>): ValidationResult<CreatePyqInput> {
    const errors: string[] = [];

    if (data.courseId === undefined || typeof data.courseId !== "number" || !Number.isInteger(data.courseId) || data.courseId <= 0) {
      errors.push("Course ID is required and must be a positive integer.");
    }

    if (!data.question || typeof data.question !== "string" || data.question.trim().length === 0) {
      errors.push("Question is required.");
    } else if (data.question.trim().length > 2000) {
      errors.push("Question must not exceed 2000 characters.");
    }

    if (data.examYear !== undefined && data.examYear !== null) {
      if (typeof data.examYear !== "number" || !Number.isInteger(data.examYear) || data.examYear < 2000 || data.examYear > 2100) {
        errors.push("Exam year must be an integer between 2000 and 2100.");
      }
    }

    if (data.marks !== undefined && data.marks !== null) {
      if (typeof data.marks !== "number" || isNaN(data.marks) || data.marks <= 0 || data.marks > 100) {
        errors.push("Marks must be a positive number up to 100.00.");
      }
    }

    if (data.difficulty !== undefined && data.difficulty !== null) {
      if (typeof data.difficulty !== "string" || !VALID_DIFFICULTIES.includes(data.difficulty as Difficulty)) {
        errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}.`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        courseId: data.courseId!,
        question: data.question!.trim(),
        examYear: data.examYear || null,
        marks: data.marks ? Number(data.marks.toFixed(2)) : null,
        difficulty: (data.difficulty as Difficulty) || null,
      },
    };
  }

  /**
   * Validates viva question creation payload.
   */
  static validateCreateVivaQuestionInput(
    data: Partial<CreateVivaQuestionInput>
  ): ValidationResult<CreateVivaQuestionInput> {
    const errors: string[] = [];

    if (data.courseId === undefined || typeof data.courseId !== "number" || !Number.isInteger(data.courseId) || data.courseId <= 0) {
      errors.push("Course ID is required and must be a positive integer.");
    }

    if (!data.question || typeof data.question !== "string" || data.question.trim().length === 0) {
      errors.push("Question is required.");
    } else if (data.question.trim().length > 2000) {
      errors.push("Question must not exceed 2000 characters.");
    }

    if (data.difficulty !== undefined && data.difficulty !== null) {
      if (typeof data.difficulty !== "string" || !VALID_DIFFICULTIES.includes(data.difficulty as Difficulty)) {
        errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}.`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        courseId: data.courseId!,
        question: data.question!.trim(),
        difficulty: (data.difficulty as Difficulty) || null,
      },
    };
  }

  /**
   * Validates PYQ filter parameters.
   */
  static validatePyqFilter(data: Partial<PyqFilterInput>): ValidationResult<PyqFilterInput> {
    const errors: string[] = [];

    if (data.difficulty !== undefined && data.difficulty !== null) {
      if (typeof data.difficulty !== "string" || !VALID_DIFFICULTIES.includes(data.difficulty as Difficulty)) {
        errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}.`);
      }
    }

    if (data.year !== undefined && data.year !== null) {
      if (typeof data.year !== "number" || !Number.isInteger(data.year) || data.year < 2000 || data.year > 2100) {
        errors.push("Year must be an integer between 2000 and 2100.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        ...(data.difficulty !== undefined && { difficulty: data.difficulty as Difficulty }),
        ...(data.year !== undefined && { year: data.year }),
      },
    };
  }
}
