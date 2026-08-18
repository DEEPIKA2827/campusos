/**
 * @file repositories/attendance.repository.ts
 * @description Data Access Layer for Attendance Logs and Attendance Summaries.
 * @domain Bounded Context: Student Attendance Tracking & Analytics
 * @tables attendance_logs, attendance_summaries
 */

import { db, schema } from "@/lib/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  AttendanceLogDTO,
  AttendanceSummaryDTO,
  AttendanceStatus,
} from "@/types/api.types";

export interface LogAttendanceInput {
  userId: number;
  courseId: number;
  attendanceDate: string;
  status: AttendanceStatus;
}

export class AttendanceRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  /**
   * Records a single attendance event log.
   */
  async logAttendance(input: LogAttendanceInput): Promise<AttendanceLogDTO> {
    const client = this.getDb();
    Logger.debug("AttendanceRepository.logAttendance", {
      userId: input.userId,
      courseId: input.courseId,
      attendanceDate: input.attendanceDate,
      status: input.status,
    });

    const [record] = await client
      .insert(schema.attendanceLogs)
      .values({
        userId: input.userId,
        courseId: input.courseId,
        attendanceDate: input.attendanceDate,
        status: input.status,
      })
      .returning();

    return {
      attendanceId: record.attendanceId,
      userId: record.userId,
      courseId: record.courseId,
      attendanceDate: record.attendanceDate,
      status: record.status as AttendanceStatus,
    };
  }

  /**
   * Fetches recent attendance logs for a student in a specific course.
   */
  async getLogsByStudentCourse(
    userId: number,
    courseId: number,
    limit = 50
  ): Promise<AttendanceLogDTO[]> {
    const client = this.getDb();
    Logger.debug("AttendanceRepository.getLogsByStudentCourse", { userId, courseId, limit });

    const records = await client
      .select()
      .from(schema.attendanceLogs)
      .where(
        and(
          eq(schema.attendanceLogs.userId, userId),
          eq(schema.attendanceLogs.courseId, courseId)
        )
      )
      .orderBy(desc(schema.attendanceLogs.attendanceDate))
      .limit(limit);

    return records.map((r) => ({
      attendanceId: r.attendanceId,
      userId: r.userId,
      courseId: r.courseId,
      attendanceDate: r.attendanceDate,
      status: r.status as AttendanceStatus,
    }));
  }

  /**
   * Fetches the attendance summary for a student in a specific course.
   */
  async getSummary(userId: number, courseId: number): Promise<AttendanceSummaryDTO | null> {
    const client = this.getDb();
    Logger.debug("AttendanceRepository.getSummary", { userId, courseId });

    const [record] = await client
      .select()
      .from(schema.attendanceSummaries)
      .where(
        and(
          eq(schema.attendanceSummaries.userId, userId),
          eq(schema.attendanceSummaries.courseId, courseId)
        )
      );

    if (!record) return null;

    return {
      summaryId: record.summaryId,
      userId: record.userId,
      courseId: record.courseId,
      totalClasses: record.totalClasses,
      attendedClasses: record.attendedClasses,
      attendancePercentage: parseFloat(record.attendancePercentage),
    };
  }

  /**
   * Fetches all attendance summaries across all courses for a student.
   */
  async getAllSummariesForStudent(userId: number): Promise<AttendanceSummaryDTO[]> {
    const client = this.getDb();
    Logger.debug("AttendanceRepository.getAllSummariesForStudent", { userId });

    const records = await client
      .select()
      .from(schema.attendanceSummaries)
      .where(eq(schema.attendanceSummaries.userId, userId));

    return records.map((r) => ({
      summaryId: r.summaryId,
      userId: r.userId,
      courseId: r.courseId,
      totalClasses: r.totalClasses,
      attendedClasses: r.attendedClasses,
      attendancePercentage: parseFloat(r.attendancePercentage),
    }));
  }

  /**
   * Recomputes attendance summary directly from logs and updates/inserts into attendance_summaries.
   */
  async recalculateAndUpsertSummary(userId: number, courseId: number): Promise<AttendanceSummaryDTO> {
    const client = this.getDb();
    Logger.info("AttendanceRepository.recalculateAndUpsertSummary", { userId, courseId });

    // Aggregate counts from attendance_logs
    const [counts] = await client
      .select({
        totalClasses: sql<number>`count(*)::int`,
        attendedClasses: sql<number>`count(*) filter (where ${schema.attendanceLogs.status} in ('present', 'late'))::int`,
      })
      .from(schema.attendanceLogs)
      .where(
        and(
          eq(schema.attendanceLogs.userId, userId),
          eq(schema.attendanceLogs.courseId, courseId)
        )
      );

    const total = counts?.totalClasses || 0;
    const attended = counts?.attendedClasses || 0;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(2) : "0.00";

    const [existing] = await client
      .select()
      .from(schema.attendanceSummaries)
      .where(
        and(
          eq(schema.attendanceSummaries.userId, userId),
          eq(schema.attendanceSummaries.courseId, courseId)
        )
      );

    let summaryRecord;
    if (existing) {
      const [updated] = await client
        .update(schema.attendanceSummaries)
        .set({
          totalClasses: total,
          attendedClasses: attended,
          attendancePercentage: percentage,
        })
        .where(eq(schema.attendanceSummaries.summaryId, existing.summaryId))
        .returning();
      summaryRecord = updated;
    } else {
      const [inserted] = await client
        .insert(schema.attendanceSummaries)
        .values({
          userId,
          courseId,
          totalClasses: total,
          attendedClasses: attended,
          attendancePercentage: percentage,
        })
        .returning();
      summaryRecord = inserted;
    }

    return {
      summaryId: summaryRecord.summaryId,
      userId: summaryRecord.userId,
      courseId: summaryRecord.courseId,
      totalClasses: summaryRecord.totalClasses,
      attendedClasses: summaryRecord.attendedClasses,
      attendancePercentage: parseFloat(summaryRecord.attendancePercentage),
    };
  }

  /**
   * Atomically records an attendance log and synchronizes the computed summary within a single transaction.
   */
  async logAttendanceWithSummaryUpdate(
    input: LogAttendanceInput
  ): Promise<{ log: AttendanceLogDTO; summary: AttendanceSummaryDTO }> {
    const client = this.getDb();
    Logger.info("AttendanceRepository.logAttendanceWithSummaryUpdate (atomic)", {
      userId: input.userId,
      courseId: input.courseId,
      attendanceDate: input.attendanceDate,
      status: input.status,
    });

    return await client.transaction(async (tx) => {
      // 1. Insert Log
      const [logRecord] = await tx
        .insert(schema.attendanceLogs)
        .values({
          userId: input.userId,
          courseId: input.courseId,
          attendanceDate: input.attendanceDate,
          status: input.status,
        })
        .returning();

      // 2. Aggregate logs in tx
      const [counts] = await tx
        .select({
          totalClasses: sql<number>`count(*)::int`,
          attendedClasses: sql<number>`count(*) filter (where ${schema.attendanceLogs.status} in ('present', 'late'))::int`,
        })
        .from(schema.attendanceLogs)
        .where(
          and(
            eq(schema.attendanceLogs.userId, input.userId),
            eq(schema.attendanceLogs.courseId, input.courseId)
          )
        );

      const total = counts?.totalClasses || 0;
      const attended = counts?.attendedClasses || 0;
      const percentage = total > 0 ? ((attended / total) * 100).toFixed(2) : "0.00";

      // 3. Upsert summary in tx
      const [existing] = await tx
        .select()
        .from(schema.attendanceSummaries)
        .where(
          and(
            eq(schema.attendanceSummaries.userId, input.userId),
            eq(schema.attendanceSummaries.courseId, input.courseId)
          )
        );

      let summaryRecord;
      if (existing) {
        const [updated] = await tx
          .update(schema.attendanceSummaries)
          .set({
            totalClasses: total,
            attendedClasses: attended,
            attendancePercentage: percentage,
          })
          .where(eq(schema.attendanceSummaries.summaryId, existing.summaryId))
          .returning();
        summaryRecord = updated;
      } else {
        const [inserted] = await tx
          .insert(schema.attendanceSummaries)
          .values({
            userId: input.userId,
            courseId: input.courseId,
            totalClasses: total,
            attendedClasses: attended,
            attendancePercentage: percentage,
          })
          .returning();
        summaryRecord = inserted;
      }

      return {
        log: {
          attendanceId: logRecord.attendanceId,
          userId: logRecord.userId,
          courseId: logRecord.courseId,
          attendanceDate: logRecord.attendanceDate,
          status: logRecord.status as AttendanceStatus,
        },
        summary: {
          summaryId: summaryRecord.summaryId,
          userId: summaryRecord.userId,
          courseId: summaryRecord.courseId,
          totalClasses: summaryRecord.totalClasses,
          attendedClasses: summaryRecord.attendedClasses,
          attendancePercentage: parseFloat(summaryRecord.attendancePercentage),
        },
      };
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
