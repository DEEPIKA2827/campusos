/**
 * @file services/attendance.service.ts
 * @description Business Logic Layer (BLL) for Student Attendance Tracking and 75% Bunk Defense Analytics.
 * @domain Bounded Context: Student Attendance Tracking & Analytics
 * @purpose Implements business validation rules, ownership enforcement, and derived bunk calculations.
 */

import { attendanceRepository, AttendanceRepository } from "@/repositories/attendance.repository";
import { academicRepository, AcademicRepository } from "@/repositories/academic.repository";
import { userRepository, UserRepository } from "@/repositories/user.repository";
import {
  AttendanceValidation,
  LogAttendanceInput,
  AttendanceDateRangeFilter,
} from "@/validations/attendance.validation";
import {
  AttendanceLogDTO,
  AttendanceSummaryDTO,
  AttendanceSummaryWithCourseDTO,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

/**
 * Derived 75% VTU Attendance Bunk Defense Calculation Metric DTO.
 */
export interface AttendanceAnalysisDTO {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  safeBunksAvailable: number;
  classesNeededFor75: number;
  riskLevel: "safe" | "warning" | "critical";
}

export class AttendanceService {
  constructor(
    private attendanceRepo: AttendanceRepository = attendanceRepository,
    private academicRepo: AcademicRepository = academicRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  /**
   * Calculates the 75% Attendance Bunk Defense metrics.
   * Formula:
   * - If attendance >= 75%: safeBunks = floor((attendedClasses - 0.75 * totalClasses) / 0.75)
   * - If attendance < 75%: classesNeeded = ceil(3 * totalClasses - 4 * attendedClasses)
   */
  calculateBunkDefense(totalClasses: number, attendedClasses: number): AttendanceAnalysisDTO {
    if (totalClasses < 0 || attendedClasses < 0 || attendedClasses > totalClasses) {
      throw new Error("Validation Error: Invalid class counts for attendance analysis.");
    }

    if (totalClasses === 0) {
      return {
        totalClasses: 0,
        attendedClasses: 0,
        attendancePercentage: 0,
        safeBunksAvailable: 0,
        classesNeededFor75: 0,
        riskLevel: "critical",
      };
    }

    const percentage = parseFloat(((attendedClasses / totalClasses) * 100).toFixed(2));

    let safeBunks = 0;
    let classesNeeded = 0;
    let riskLevel: "safe" | "warning" | "critical" = "safe";

    if (percentage >= 75) {
      // Classes student can miss while maintaining >= 75%:
      // (attendedClasses) / (totalClasses + bunks) >= 0.75 => bunks <= (attendedClasses / 0.75) - totalClasses
      safeBunks = Math.max(0, Math.floor(attendedClasses / 0.75 - totalClasses));
      riskLevel = percentage >= 85 ? "safe" : "warning";
    } else {
      // Consecutive classes student must attend to reach >= 75%:
      // (attendedClasses + x) / (totalClasses + x) >= 0.75 => x >= 3 * totalClasses - 4 * attendedClasses
      classesNeeded = Math.max(0, Math.ceil(3 * totalClasses - 4 * attendedClasses));
      riskLevel = "critical";
    }

    return {
      totalClasses,
      attendedClasses,
      attendancePercentage: percentage,
      safeBunksAvailable: safeBunks,
      classesNeededFor75: classesNeeded,
      riskLevel,
    };
  }

  /**
   * Logs an attendance event and automatically updates the course attendance summary in an atomic transaction.
   */
  async logAttendance(
    userId: number,
    input: Partial<LogAttendanceInput>
  ): Promise<{ log: AttendanceLogDTO; summary: AttendanceSummaryDTO; analysis: AttendanceAnalysisDTO }> {
    Logger.info("AttendanceService.logAttendance invoked", { userId, courseId: input.courseId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = AttendanceValidation.validateLogAttendanceInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Ensure user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Not Found Error: User does not exist.");
    }

    // Step 3: Semantic Check — Ensure course exists
    const course = await this.academicRepo.getCourseById(validation.data.courseId);
    if (!course) {
      throw new Error(`Not Found Error: Course not found with ID: ${validation.data.courseId}`);
    }

    // Step 4: Atomic Data Persistence
    const result = await this.attendanceRepo.logAttendanceWithSummaryUpdate({
      userId,
      courseId: validation.data.courseId,
      attendanceDate: validation.data.attendanceDate,
      status: validation.data.status,
    });

    // Step 5: Derive Real-Time Bunk Defense Analysis
    const analysis = this.calculateBunkDefense(
      result.summary.totalClasses,
      result.summary.attendedClasses
    );

    return {
      log: result.log,
      summary: result.summary,
      analysis,
    };
  }

  /**
   * Retrieves recent attendance logs for a student in a specific course.
   */
  async getAttendanceHistory(
    userId: number,
    courseId: number,
    limit = 50
  ): Promise<AttendanceLogDTO[]> {
    Logger.debug("AttendanceService.getAttendanceHistory invoked", { userId, courseId, limit });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    return this.attendanceRepo.getLogsByStudentCourse(userId, courseId, limit);
  }

  /**
   * Retrieves attendance logs for a student within a specific ISO date range.
   */
  async getAttendanceHistoryByDateRange(
    userId: number,
    courseId: number,
    filter: Partial<AttendanceDateRangeFilter>
  ): Promise<AttendanceLogDTO[]> {
    Logger.debug("AttendanceService.getAttendanceHistoryByDateRange invoked", { userId, courseId, ...filter });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    const validation = AttendanceValidation.validateDateRangeFilter(filter);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    return this.attendanceRepo.getLogsByDateRange(
      userId,
      courseId,
      validation.data.startDate,
      validation.data.endDate
    );
  }

  /**
   * Retrieves attendance summary for a specific course with Bunk Defense calculation.
   */
  async getCourseSummary(
    userId: number,
    courseId: number
  ): Promise<{ summary: AttendanceSummaryDTO; analysis: AttendanceAnalysisDTO } | null> {
    Logger.debug("AttendanceService.getCourseSummary invoked", { userId, courseId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    const summary = await this.attendanceRepo.getSummary(userId, courseId);
    if (!summary) return null;

    const analysis = this.calculateBunkDefense(summary.totalClasses, summary.attendedClasses);

    return {
      summary,
      analysis,
    };
  }

  /**
   * Retrieves all course attendance summaries joined with course details for the student dashboard.
   */
  async getStudentDashboard(userId: number): Promise<AttendanceSummaryWithCourseDTO[]> {
    Logger.debug("AttendanceService.getStudentDashboard invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    return this.attendanceRepo.getSummariesWithCourseDetails(userId);
  }

  /**
   * Atomically deletes an attendance log and synchronizes the computed course summary.
   */
  async deleteAttendanceLog(
    attendanceId: number,
    userId: number,
    courseId: number
  ): Promise<{ success: boolean; summary: AttendanceSummaryDTO; analysis: AttendanceAnalysisDTO }> {
    Logger.info("AttendanceService.deleteAttendanceLog invoked", { attendanceId, userId, courseId });

    if (!attendanceId || typeof attendanceId !== "number" || attendanceId <= 0) {
      throw new Error("Validation Error: Attendance ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    const result = await this.attendanceRepo.deleteLogWithSummaryUpdate(attendanceId, userId, courseId);

    const analysis = this.calculateBunkDefense(
      result.summary.totalClasses,
      result.summary.attendedClasses
    );

    return {
      success: result.success,
      summary: result.summary,
      analysis,
    };
  }
}

export const attendanceService = new AttendanceService();
