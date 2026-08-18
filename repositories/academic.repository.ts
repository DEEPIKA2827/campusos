/**
 * @file repositories/academic.repository.ts
 * @description Data Access Layer for Colleges, Academic Schemes, and Courses.
 * @domain Bounded Context: Academic Curriculum & Institution Directory
 * @tables colleges, academic_schemes, courses
 */

import { db, schema } from "@/lib/db";
import { eq, ilike, and } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  CollegeDTO,
  AcademicSchemeDTO,
  CourseDTO,
} from "@/types/api.types";

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

export interface CourseWithHierarchy {
  course: CourseDTO;
  scheme: AcademicSchemeDTO;
  college: CollegeDTO;
}

export interface CollegeWithSchemes {
  college: CollegeDTO;
  schemes: AcademicSchemeDTO[];
}

export class AcademicRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  // ==========================================
  // Colleges Operations
  // ==========================================

  async listColleges(): Promise<CollegeDTO[]> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.listColleges");

    const records = await client.select().from(schema.colleges);

    return records.map((r) => ({
      collegeId: r.collegeId,
      collegeName: r.collegeName,
      location: r.location,
      createdAt: r.createdAt,
    }));
  }

  async getCollegeById(collegeId: number): Promise<CollegeDTO | null> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.getCollegeById", { collegeId });

    const [record] = await client
      .select()
      .from(schema.colleges)
      .where(eq(schema.colleges.collegeId, collegeId));

    if (!record) return null;

    return {
      collegeId: record.collegeId,
      collegeName: record.collegeName,
      location: record.location,
      createdAt: record.createdAt,
    };
  }

  async getCollegeWithSchemes(collegeId: number): Promise<CollegeWithSchemes | null> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.getCollegeWithSchemes", { collegeId });

    const college = await this.getCollegeById(collegeId);
    if (!college) return null;

    const schemes = await this.listSchemesByCollege(collegeId);

    return {
      college,
      schemes,
    };
  }

  async createCollege(input: CreateCollegeInput): Promise<CollegeDTO> {
    const client = this.getDb();
    Logger.info("AcademicRepository.createCollege", { name: input.collegeName });

    const [record] = await client
      .insert(schema.colleges)
      .values({
        collegeName: input.collegeName,
        location: input.location || null,
      })
      .returning();

    return {
      collegeId: record.collegeId,
      collegeName: record.collegeName,
      location: record.location,
      createdAt: record.createdAt,
    };
  }

  // ==========================================
  // Academic Schemes Operations
  // ==========================================

  async listAllSchemes(): Promise<AcademicSchemeDTO[]> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.listAllSchemes");

    const records = await client.select().from(schema.academicSchemes);

    return records.map((r) => ({
      schemeId: r.schemeId,
      collegeId: r.collegeId,
      schemeName: r.schemeName,
      academicYear: r.academicYear,
    }));
  }

  async getSchemeById(schemeId: number): Promise<AcademicSchemeDTO | null> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.getSchemeById", { schemeId });

    const [record] = await client
      .select()
      .from(schema.academicSchemes)
      .where(eq(schema.academicSchemes.schemeId, schemeId));

    if (!record) return null;

    return {
      schemeId: record.schemeId,
      collegeId: record.collegeId,
      schemeName: record.schemeName,
      academicYear: record.academicYear,
    };
  }

  async listSchemesByCollege(collegeId: number): Promise<AcademicSchemeDTO[]> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.listSchemesByCollege", { collegeId });

    const records = await client
      .select()
      .from(schema.academicSchemes)
      .where(eq(schema.academicSchemes.collegeId, collegeId));

    return records.map((r) => ({
      schemeId: r.schemeId,
      collegeId: r.collegeId,
      schemeName: r.schemeName,
      academicYear: r.academicYear,
    }));
  }

  async createScheme(input: CreateSchemeInput): Promise<AcademicSchemeDTO> {
    const client = this.getDb();
    Logger.info("AcademicRepository.createScheme", { name: input.schemeName });

    const [record] = await client
      .insert(schema.academicSchemes)
      .values({
        collegeId: input.collegeId,
        schemeName: input.schemeName,
        academicYear: input.academicYear || null,
      })
      .returning();

    return {
      schemeId: record.schemeId,
      collegeId: record.collegeId,
      schemeName: record.schemeName,
      academicYear: record.academicYear,
    };
  }

  // ==========================================
  // Courses Operations
  // ==========================================

  async listCourses(filter?: { schemeId?: number; search?: string }): Promise<CourseDTO[]> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.listCourses", filter);

    const conditions = [];
    if (filter?.schemeId) {
      conditions.push(eq(schema.courses.schemeId, filter.schemeId));
    }
    if (filter?.search) {
      conditions.push(ilike(schema.courses.courseName, `%${filter.search}%`));
    }

    const query = client.select().from(schema.courses);
    const records = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

    return records.map((r) => ({
      courseId: r.courseId,
      schemeId: r.schemeId,
      courseName: r.courseName,
      courseCode: r.courseCode,
    }));
  }

  async getCourseById(courseId: number): Promise<CourseDTO | null> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.getCourseById", { courseId });

    const [record] = await client
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.courseId, courseId));

    if (!record) return null;

    return {
      courseId: record.courseId,
      schemeId: record.schemeId,
      courseName: record.courseName,
      courseCode: record.courseCode,
    };
  }

  async getCourseByCode(courseCode: string): Promise<CourseDTO | null> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.getCourseByCode", { courseCode });

    const [record] = await client
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.courseCode, courseCode.toUpperCase().trim()));

    if (!record) return null;

    return {
      courseId: record.courseId,
      schemeId: record.schemeId,
      courseName: record.courseName,
      courseCode: record.courseCode,
    };
  }

  async createCourse(input: CreateCourseInput): Promise<CourseDTO> {
    const client = this.getDb();
    Logger.info("AcademicRepository.createCourse", { code: input.courseCode });

    const [record] = await client
      .insert(schema.courses)
      .values({
        schemeId: input.schemeId,
        courseName: input.courseName,
        courseCode: input.courseCode ? input.courseCode.toUpperCase().trim() : null,
      })
      .returning();

    return {
      courseId: record.courseId,
      schemeId: record.schemeId,
      courseName: record.courseName,
      courseCode: record.courseCode,
    };
  }

  /**
   * Retrieves complete 3-tier academic hierarchy (Course -> Scheme -> College) in a single joined query.
   */
  async getCourseWithHierarchy(courseId: number): Promise<CourseWithHierarchy | null> {
    const client = this.getDb();
    Logger.debug("AcademicRepository.getCourseWithHierarchy", { courseId });

    const [record] = await client
      .select({
        courseId: schema.courses.courseId,
        schemeId: schema.courses.schemeId,
        courseName: schema.courses.courseName,
        courseCode: schema.courses.courseCode,
        schemeName: schema.academicSchemes.schemeName,
        academicYear: schema.academicSchemes.academicYear,
        collegeId: schema.colleges.collegeId,
        collegeName: schema.colleges.collegeName,
        location: schema.colleges.location,
        collegeCreatedAt: schema.colleges.createdAt,
      })
      .from(schema.courses)
      .innerJoin(schema.academicSchemes, eq(schema.courses.schemeId, schema.academicSchemes.schemeId))
      .innerJoin(schema.colleges, eq(schema.academicSchemes.collegeId, schema.colleges.collegeId))
      .where(eq(schema.courses.courseId, courseId));

    if (!record) return null;

    return {
      course: {
        courseId: record.courseId,
        schemeId: record.schemeId,
        courseName: record.courseName,
        courseCode: record.courseCode,
      },
      scheme: {
        schemeId: record.schemeId,
        collegeId: record.collegeId,
        schemeName: record.schemeName,
        academicYear: record.academicYear,
      },
      college: {
        collegeId: record.collegeId,
        collegeName: record.collegeName,
        location: record.location,
        createdAt: record.collegeCreatedAt,
      },
    };
  }
}

export const academicRepository = new AcademicRepository();
