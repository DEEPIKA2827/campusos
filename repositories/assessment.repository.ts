/**
 * @file repositories/assessment.repository.ts
 * @description Data Access Layer for CIE Assessments, Student Marks, PYQs, and Viva Questions.
 * @domain Bounded Context: Course Assessments, Evaluations & Study Material
 * @tables cie_assessments, student_cie_marks, pyqs, viva_questions
 */

import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  CieAssessmentDTO,
  StudentCieMarkDTO,
  PyqDTO,
  VivaQuestionDTO,
  Difficulty,
} from "@/types/api.types";

export interface CreateCieAssessmentInput {
  courseId: number;
  assessmentName: string;
  assessmentDate?: string | null;
  maxMarks: number;
}

export interface RecordStudentMarkInput {
  userId: number;
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

export interface StudentCieMarkDetail {
  mark: StudentCieMarkDTO;
  assessment: CieAssessmentDTO;
}

export class AssessmentRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  // ==========================================
  // CIE Assessments
  // ==========================================

  async listCieAssessments(courseId: number): Promise<CieAssessmentDTO[]> {
    const client = this.getDb();
    Logger.debug("AssessmentRepository.listCieAssessments", { courseId });

    const records = await client
      .select()
      .from(schema.cieAssessments)
      .where(eq(schema.cieAssessments.courseId, courseId));

    return records.map((r) => ({
      cieId: r.cieId,
      courseId: r.courseId,
      assessmentName: r.assessmentName,
      assessmentDate: r.assessmentDate,
      maxMarks: parseFloat(r.maxMarks),
    }));
  }

  async createCieAssessment(input: CreateCieAssessmentInput): Promise<CieAssessmentDTO> {
    const client = this.getDb();
    Logger.info("AssessmentRepository.createCieAssessment", { name: input.assessmentName });

    const [record] = await client
      .insert(schema.cieAssessments)
      .values({
        courseId: input.courseId,
        assessmentName: input.assessmentName,
        assessmentDate: input.assessmentDate || null,
        maxMarks: input.maxMarks.toFixed(2),
      })
      .returning();

    return {
      cieId: record.cieId,
      courseId: record.courseId,
      assessmentName: record.assessmentName,
      assessmentDate: record.assessmentDate,
      maxMarks: parseFloat(record.maxMarks),
    };
  }

  // ==========================================
  // Student CIE Marks
  // ==========================================

  async recordStudentMark(input: RecordStudentMarkInput): Promise<StudentCieMarkDTO> {
    const client = this.getDb();
    Logger.info("AssessmentRepository.recordStudentMark", { userId: input.userId, cieId: input.cieId });

    const [record] = await client
      .insert(schema.studentCieMarks)
      .values({
        userId: input.userId,
        cieId: input.cieId,
        marksObtained: input.marksObtained.toFixed(2),
      })
      .onConflictDoUpdate({
        target: [schema.studentCieMarks.userId, schema.studentCieMarks.cieId],
        set: {
          marksObtained: input.marksObtained.toFixed(2),
        },
      })
      .returning();

    return {
      markId: record.markId,
      userId: record.userId,
      cieId: record.cieId,
      marksObtained: parseFloat(record.marksObtained),
    };
  }

  async getStudentMarksForCourse(userId: number, courseId: number): Promise<StudentCieMarkDetail[]> {
    const client = this.getDb();
    Logger.debug("AssessmentRepository.getStudentMarksForCourse", { userId, courseId });

    const records = await client
      .select({
        markId: schema.studentCieMarks.markId,
        userId: schema.studentCieMarks.userId,
        cieId: schema.studentCieMarks.cieId,
        marksObtained: schema.studentCieMarks.marksObtained,
        assessmentName: schema.cieAssessments.assessmentName,
        assessmentDate: schema.cieAssessments.assessmentDate,
        maxMarks: schema.cieAssessments.maxMarks,
      })
      .from(schema.studentCieMarks)
      .innerJoin(
        schema.cieAssessments,
        eq(schema.studentCieMarks.cieId, schema.cieAssessments.cieId)
      )
      .where(
        and(
          eq(schema.studentCieMarks.userId, userId),
          eq(schema.cieAssessments.courseId, courseId)
        )
      );

    return records.map((r) => ({
      mark: {
        markId: r.markId,
        userId: r.userId,
        cieId: r.cieId,
        marksObtained: parseFloat(r.marksObtained),
      },
      assessment: {
        cieId: r.cieId,
        courseId,
        assessmentName: r.assessmentName,
        assessmentDate: r.assessmentDate,
        maxMarks: parseFloat(r.maxMarks),
      },
    }));
  }

  // ==========================================
  // PYQs (Previous-Year Questions)
  // ==========================================

  async listPyqs(
    courseId: number,
    filter?: { difficulty?: Difficulty; year?: number }
  ): Promise<PyqDTO[]> {
    const client = this.getDb();
    Logger.debug("AssessmentRepository.listPyqs", { courseId, filter });

    const conditions = [eq(schema.pyqs.courseId, courseId)];
    if (filter?.difficulty) {
      conditions.push(eq(schema.pyqs.difficulty, filter.difficulty));
    }
    if (filter?.year) {
      conditions.push(eq(schema.pyqs.examYear, filter.year));
    }

    const records = await client
      .select()
      .from(schema.pyqs)
      .where(and(...conditions));

    return records.map((r) => ({
      pyqId: r.pyqId,
      courseId: r.courseId,
      question: r.question,
      examYear: r.examYear,
      marks: r.marks ? parseFloat(r.marks) : null,
      difficulty: (r.difficulty as Difficulty) || "medium",
    }));
  }

  async createPyq(input: CreatePyqInput): Promise<PyqDTO> {
    const client = this.getDb();
    Logger.info("AssessmentRepository.createPyq", { courseId: input.courseId });

    const [record] = await client
      .insert(schema.pyqs)
      .values({
        courseId: input.courseId,
        question: input.question,
        examYear: input.examYear || null,
        marks: input.marks ? input.marks.toFixed(2) : null,
        difficulty: input.difficulty || null,
      })
      .returning();

    return {
      pyqId: record.pyqId,
      courseId: record.courseId,
      question: record.question,
      examYear: record.examYear,
      marks: record.marks ? parseFloat(record.marks) : null,
      difficulty: (record.difficulty as Difficulty) || "medium",
    };
  }

  // ==========================================
  // Viva Questions
  // ==========================================

  async listVivaQuestions(courseId: number, difficulty?: Difficulty): Promise<VivaQuestionDTO[]> {
    const client = this.getDb();
    Logger.debug("AssessmentRepository.listVivaQuestions", { courseId, difficulty });

    const conditions = [eq(schema.vivaQuestions.courseId, courseId)];
    if (difficulty) {
      conditions.push(eq(schema.vivaQuestions.difficulty, difficulty));
    }

    const records = await client
      .select()
      .from(schema.vivaQuestions)
      .where(and(...conditions));

    return records.map((r) => ({
      vivaId: r.vivaId,
      courseId: r.courseId,
      question: r.question,
      difficulty: (r.difficulty as Difficulty) || "medium",
    }));
  }

  async createVivaQuestion(input: CreateVivaQuestionInput): Promise<VivaQuestionDTO> {
    const client = this.getDb();
    Logger.info("AssessmentRepository.createVivaQuestion", { courseId: input.courseId });

    const [record] = await client
      .insert(schema.vivaQuestions)
      .values({
        courseId: input.courseId,
        question: input.question,
        difficulty: input.difficulty || null,
      })
      .returning();

    return {
      vivaId: record.vivaId,
      courseId: record.courseId,
      question: record.question,
      difficulty: (record.difficulty as Difficulty) || "medium",
    };
  }
}

export const assessmentRepository = new AssessmentRepository();
