/**
 * @file validations/attendance.validation.ts
 * @description Request body and parameter validation schemas for Attendance Tracking.
 * @domain Bounded Context: Student Attendance Tracking & Analytics
 */

import { AttendanceStatus } from "@/types/api.types";
import { ValidationResult } from "./user.validation";

export interface LogAttendanceInput {
  courseId: number;
  attendanceDate: string;
  status: AttendanceStatus;
}

export interface AttendanceDateRangeFilter {
  startDate: string;
  endDate: string;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES: AttendanceStatus[] = ["present", "absent", "late"];

export class AttendanceValidation {
  /**
   * Validates attendance log entry payload.
   */
  static validateLogAttendanceInput(data: Partial<LogAttendanceInput>): ValidationResult<LogAttendanceInput> {
    const errors: string[] = [];

    if (data.courseId === undefined || typeof data.courseId !== "number" || !Number.isInteger(data.courseId) || data.courseId <= 0) {
      errors.push("Course ID is required and must be a positive integer.");
    }

    if (!data.attendanceDate || typeof data.attendanceDate !== "string" || !ISO_DATE_REGEX.test(data.attendanceDate.trim())) {
      errors.push("Attendance date is required and must be a valid ISO date in YYYY-MM-DD format.");
    } else {
      const parsedDate = new Date(data.attendanceDate.trim());
      if (isNaN(parsedDate.getTime())) {
        errors.push("Attendance date is not a valid calendar date.");
      }
    }

    if (!data.status || typeof data.status !== "string" || !VALID_STATUSES.includes(data.status as AttendanceStatus)) {
      errors.push(`Status is required and must be one of: ${VALID_STATUSES.join(", ")}.`);
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        courseId: data.courseId!,
        attendanceDate: data.attendanceDate!.trim(),
        status: data.status as AttendanceStatus,
      },
    };
  }

  /**
   * Validates attendance date range filter.
   */
  static validateDateRangeFilter(data: Partial<AttendanceDateRangeFilter>): ValidationResult<AttendanceDateRangeFilter> {
    const errors: string[] = [];

    if (!data.startDate || typeof data.startDate !== "string" || !ISO_DATE_REGEX.test(data.startDate.trim())) {
      errors.push("Start date is required and must be in YYYY-MM-DD format.");
    }

    if (!data.endDate || typeof data.endDate !== "string" || !ISO_DATE_REGEX.test(data.endDate.trim())) {
      errors.push("End date is required and must be in YYYY-MM-DD format.");
    }

    if (data.startDate && data.endDate && ISO_DATE_REGEX.test(data.startDate.trim()) && ISO_DATE_REGEX.test(data.endDate.trim())) {
      if (data.startDate.trim() > data.endDate.trim()) {
        errors.push("Start date must be less than or equal to end date.");
      }
    }

    if (errors.length > 0) {
      return { valid: false, success: false, errors };
    }

    return {
      valid: true,
      success: true,
      data: {
        startDate: data.startDate!.trim(),
        endDate: data.endDate!.trim(),
      },
    };
  }

  /**
   * Validates attendance ID primitive.
   */
  static validateAttendanceId(attendanceId: unknown): ValidationResult<{ attendanceId: number }> {
    if (typeof attendanceId !== "number" || !Number.isInteger(attendanceId) || attendanceId <= 0) {
      return {
        valid: false,
        success: false,
        errors: ["Attendance ID must be a positive integer."],
      };
    }

    return {
      valid: true,
      success: true,
      data: { attendanceId },
    };
  }
}
