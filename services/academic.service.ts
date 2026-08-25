/**
 * @file services/academic.service.ts
 * @description Business Logic Layer (BLL) for Colleges, Academic Schemes, and Courses.
 * @domain Bounded Context: Academic Curriculum & Institution Directory
 * @purpose Implements business rules, hierarchy validations, and orchestration for curriculum data.
 */

import { academicRepository, AcademicRepository, CourseWithHierarchy, CollegeWithSchemes } from "@/repositories/academic.repository";
import {
  AcademicValidation,
  CreateCollegeInput,
  CreateSchemeInput,
  CreateCourseInput,
  CourseFilterInput,
} from "@/validations/academic.validation";
import {
  CollegeDTO,
  AcademicSchemeDTO,
  CourseDTO,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class AcademicService {
  constructor(private academicRepo: AcademicRepository = academicRepository) {}

  // ==========================================
  // Colleges
  // ==========================================

  /**
   * Lists all institutions / colleges.
   */
  async listColleges(): Promise<CollegeDTO[]> {
    Logger.debug("AcademicService.listColleges invoked");
    return this.academicRepo.listColleges();
  }

  /**
   * Retrieves a single college by ID with domain not-found handling.
   */
  async getCollegeById(collegeId: number): Promise<CollegeDTO> {
    Logger.debug("AcademicService.getCollegeById invoked", { collegeId });

    if (!collegeId || typeof collegeId !== "number" || collegeId <= 0) {
      throw new Error("Validation Error: College ID must be a positive integer.");
    }

    const college = await this.academicRepo.getCollegeById(collegeId);
    if (!college) {
      throw new Error(`Not Found Error: College not found with ID: ${collegeId}`);
    }

    return college;
  }

  /**
   * Retrieves a college along with its registered academic schemes.
   */
  async getCollegeWithSchemes(collegeId: number): Promise<CollegeWithSchemes> {
    Logger.debug("AcademicService.getCollegeWithSchemes invoked", { collegeId });

    if (!collegeId || typeof collegeId !== "number" || collegeId <= 0) {
      throw new Error("Validation Error: College ID must be a positive integer.");
    }

    const result = await this.academicRepo.getCollegeWithSchemes(collegeId);
    if (!result) {
      throw new Error(`Not Found Error: College not found with ID: ${collegeId}`);
    }

    return result;
  }

  /**
   * Creates a new institution / college.
   */
  async createCollege(input: Partial<CreateCollegeInput>): Promise<CollegeDTO> {
    Logger.info("AcademicService.createCollege invoked", { name: input.collegeName });

    // Step 1: Syntactic Validation
    const validation = AcademicValidation.validateCreateCollegeInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Persist via Data Access Layer
    return this.academicRepo.createCollege(validation.data);
  }

  // ==========================================
  // Academic Schemes
  // ==========================================

  /**
   * Lists academic schemes, optionally filtered by parent college ID.
   */
  async listSchemes(collegeId?: number): Promise<AcademicSchemeDTO[]> {
    Logger.debug("AcademicService.listSchemes invoked", { collegeId });

    if (collegeId !== undefined) {
      if (typeof collegeId !== "number" || collegeId <= 0) {
        throw new Error("Validation Error: College ID must be a positive integer.");
      }
      return this.academicRepo.listSchemesByCollege(collegeId);
    }

    return this.academicRepo.listAllSchemes();
  }

  /**
   * Retrieves an academic scheme by primary key.
   */
  async getSchemeById(schemeId: number): Promise<AcademicSchemeDTO> {
    Logger.debug("AcademicService.getSchemeById invoked", { schemeId });

    if (!schemeId || typeof schemeId !== "number" || schemeId <= 0) {
      throw new Error("Validation Error: Scheme ID must be a positive integer.");
    }

    const scheme = await this.academicRepo.getSchemeById(schemeId);
    if (!scheme) {
      throw new Error(`Not Found Error: Academic scheme not found with ID: ${schemeId}`);
    }

    return scheme;
  }

  /**
   * Creates an academic scheme bound to an existing college.
   */
  async createScheme(input: Partial<CreateSchemeInput>): Promise<AcademicSchemeDTO> {
    Logger.info("AcademicService.createScheme invoked", { name: input.schemeName });

    // Step 1: Syntactic Validation
    const validation = AcademicValidation.validateCreateSchemeInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Parent College must exist
    const college = await this.academicRepo.getCollegeById(validation.data.collegeId);
    if (!college) {
      throw new Error(`Not Found Error: College not found with ID: ${validation.data.collegeId}`);
    }

    // Step 3: Persist via Data Access Layer
    return this.academicRepo.createScheme(validation.data);
  }

  // ==========================================
  // Courses
  // ==========================================

  /**
   * Lists courses with optional scheme filter and search query.
   */
  async listCourses(filter?: Partial<CourseFilterInput>): Promise<CourseDTO[]> {
    Logger.debug("AcademicService.listCourses invoked", filter);

    if (filter && Object.keys(filter).length > 0) {
      const validation = AcademicValidation.validateCourseFilter(filter);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      return this.academicRepo.listCourses(validation.data);
    }

    return this.academicRepo.listCourses();
  }

  /**
   * Retrieves a course by primary key.
   */
  async getCourseById(courseId: number): Promise<CourseDTO> {
    Logger.debug("AcademicService.getCourseById invoked", { courseId });

    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    const course = await this.academicRepo.getCourseById(courseId);
    if (!course) {
      throw new Error(`Not Found Error: Course not found with ID: ${courseId}`);
    }

    return course;
  }

  /**
   * Retrieves a course by its unique uppercase course code (e.g. "21CS32").
   */
  async getCourseByCode(courseCode: string): Promise<CourseDTO> {
    Logger.debug("AcademicService.getCourseByCode invoked", { courseCode });

    if (!courseCode || typeof courseCode !== "string" || courseCode.trim().length === 0) {
      throw new Error("Validation Error: Course code is required.");
    }

    const course = await this.academicRepo.getCourseByCode(courseCode);
    if (!course) {
      throw new Error(`Not Found Error: Course not found with code: ${courseCode}`);
    }

    return course;
  }

  /**
   * Retrieves the full 3-tier academic hierarchy (Course -> Scheme -> College) in a single joined query.
   */
  async getCourseWithHierarchy(courseId: number): Promise<CourseWithHierarchy> {
    Logger.debug("AcademicService.getCourseWithHierarchy invoked", { courseId });

    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    const result = await this.academicRepo.getCourseWithHierarchy(courseId);
    if (!result) {
      throw new Error(`Not Found Error: Course not found with ID: ${courseId}`);
    }

    return result;
  }

  /**
   * Creates a course under a valid academic scheme.
   */
  async createCourse(input: Partial<CreateCourseInput>): Promise<CourseDTO> {
    Logger.info("AcademicService.createCourse invoked", { code: input.courseCode });

    // Step 1: Syntactic Validation
    const validation = AcademicValidation.validateCreateCourseInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Parent Academic Scheme must exist
    const scheme = await this.academicRepo.getSchemeById(validation.data.schemeId);
    if (!scheme) {
      throw new Error(`Not Found Error: Academic scheme not found with ID: ${validation.data.schemeId}`);
    }

    // Step 3: Semantic Check — Unique Course Code collision check if code provided
    if (validation.data.courseCode) {
      const existingCourse = await this.academicRepo.getCourseByCode(validation.data.courseCode);
      if (existingCourse) {
        throw new Error(`Conflict Error: Course with code '${validation.data.courseCode}' already exists.`);
      }
    }

    // Step 4: Persist via Data Access Layer
    return this.academicRepo.createCourse(validation.data);
  }
}

export const academicService = new AcademicService();
