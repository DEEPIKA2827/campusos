/**
 * @file services/assessment.service.ts
 * @description Business Logic Layer (BLL) for CIE Assessments, Student Marks, PYQs, and Viva Questions.
 * @domain Bounded Context: Course Assessments, Evaluations & Study Material
 * @purpose Implements semantic evaluation rules (e.g. max_marks bounds) and ownership enforcement.
 */

import {
  assessmentRepository,
  AssessmentRepository,
  StudentCieMarkDetail,
} from "@/repositories/assessment.repository";
import { academicRepository, AcademicRepository } from "@/repositories/academic.repository";
import { userRepository, UserRepository } from "@/repositories/user.repository";
import {
  AssessmentValidation,
  CreateCieAssessmentInput,
  RecordStudentMarkInput,
  CreatePyqInput,
  CreateVivaQuestionInput,
  PyqFilterInput,
} from "@/validations/assessment.validation";
import {
  CieAssessmentDTO,
  StudentCieMarkDTO,
  StudentCieMarkWithCourseDTO,
  PyqDTO,
  VivaQuestionDTO,
  Difficulty,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class AssessmentService {
  constructor(
    private assessmentRepo: AssessmentRepository = assessmentRepository,
    private academicRepo: AcademicRepository = academicRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  // ==========================================
  // CIE Assessments
  // ==========================================

  /**
   * Lists all CIE assessment definitions for a course.
   */
  async listCieAssessments(courseId: number): Promise<CieAssessmentDTO[]> {
    Logger.debug("AssessmentService.listCieAssessments invoked", { courseId });

    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    return this.assessmentRepo.listCieAssessments(courseId);
  }

  /**
   * Retrieves a single CIE assessment definition by ID.
   */
  async getCieAssessmentById(cieId: number): Promise<CieAssessmentDTO> {
    Logger.debug("AssessmentService.getCieAssessmentById invoked", { cieId });

    if (!cieId || typeof cieId !== "number" || cieId <= 0) {
      throw new Error("Validation Error: CIE Assessment ID must be a positive integer.");
    }

    const assessment = await this.assessmentRepo.getCieAssessmentById(cieId);
    if (!assessment) {
      throw new Error(`Not Found Error: CIE Assessment not found with ID: ${cieId}`);
    }

    return assessment;
  }

  /**
   * Creates a new CIE assessment definition under a valid course.
   */
  async createCieAssessment(input: Partial<CreateCieAssessmentInput>): Promise<CieAssessmentDTO> {
    Logger.info("AssessmentService.createCieAssessment invoked", { name: input.assessmentName });

    // Step 1: Syntactic Validation
    const validation = AssessmentValidation.validateCreateCieAssessmentInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Parent Course must exist
    const course = await this.academicRepo.getCourseById(validation.data.courseId);
    if (!course) {
      throw new Error(`Not Found Error: Course not found with ID: ${validation.data.courseId}`);
    }

    // Step 3: Persist via Data Access Layer
    return this.assessmentRepo.createCieAssessment(validation.data);
  }

  /**
   * Deletes a CIE assessment definition.
   */
  async deleteCieAssessment(cieId: number): Promise<boolean> {
    Logger.info("AssessmentService.deleteCieAssessment invoked", { cieId });

    if (!cieId || typeof cieId !== "number" || cieId <= 0) {
      throw new Error("Validation Error: CIE Assessment ID must be a positive integer.");
    }

    const deleted = await this.assessmentRepo.deleteCieAssessment(cieId);
    if (!deleted) {
      throw new Error(`Not Found Error: CIE Assessment not found with ID: ${cieId}`);
    }

    return true;
  }

  // ==========================================
  // Student CIE Marks
  // ==========================================

  /**
   * Records or updates student CIE marks with strict semantic validation (marks <= maxMarks).
   */
  async recordStudentMark(
    userId: number,
    input: Partial<RecordStudentMarkInput>
  ): Promise<StudentCieMarkDTO> {
    Logger.info("AssessmentService.recordStudentMark invoked", { userId, cieId: input.cieId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = AssessmentValidation.validateRecordStudentMarkInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — User must exist
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Not Found Error: User does not exist.");
    }

    // Step 3: Semantic Check — CIE Assessment must exist
    const assessment = await this.assessmentRepo.getCieAssessmentById(validation.data.cieId);
    if (!assessment) {
      throw new Error(`Not Found Error: CIE Assessment not found with ID: ${validation.data.cieId}`);
    }

    // Step 4: Semantic Rule — Marks obtained cannot exceed assessment maximum marks
    if (validation.data.marksObtained > assessment.maxMarks) {
      throw new Error(
        `Validation Error: Marks obtained (${validation.data.marksObtained}) cannot exceed assessment maximum marks (${assessment.maxMarks}).`
      );
    }

    // Step 5: Persist via Data Access Layer
    return this.assessmentRepo.recordStudentMark({
      userId,
      cieId: validation.data.cieId,
      marksObtained: validation.data.marksObtained,
    });
  }

  /**
   * Retrieves a student's mark for a specific CIE assessment.
   */
  async getStudentMark(userId: number, cieId: number): Promise<StudentCieMarkDTO | null> {
    Logger.debug("AssessmentService.getStudentMark invoked", { userId, cieId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!cieId || typeof cieId !== "number" || cieId <= 0) {
      throw new Error("Validation Error: CIE Assessment ID must be a positive integer.");
    }

    return this.assessmentRepo.getStudentMarkByAssessment(userId, cieId);
  }

  /**
   * Retrieves all marks and assessment details for a student in a specific course.
   */
  async getStudentCourseMarks(userId: number, courseId: number): Promise<StudentCieMarkDetail[]> {
    Logger.debug("AssessmentService.getStudentCourseMarks invoked", { userId, courseId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    return this.assessmentRepo.getStudentMarksForCourse(userId, courseId);
  }

  /**
   * Retrieves all marks across all enrolled courses for a student (dashboard view).
   */
  async getAllStudentMarks(userId: number): Promise<StudentCieMarkWithCourseDTO[]> {
    Logger.debug("AssessmentService.getAllStudentMarks invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    return this.assessmentRepo.getAllStudentMarksWithDetails(userId);
  }

  /**
   * Deletes a student mark entry ensuring ownership enforcement.
   */
  async deleteStudentMark(markId: number, userId: number): Promise<boolean> {
    Logger.info("AssessmentService.deleteStudentMark invoked", { markId, userId });

    if (!markId || typeof markId !== "number" || markId <= 0) {
      throw new Error("Validation Error: Mark ID must be a positive integer.");
    }
    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    const deleted = await this.assessmentRepo.deleteStudentMark(markId, userId);
    if (!deleted) {
      throw new Error(`Not Found Error: Mark not found with ID: ${markId} for this user.`);
    }

    return true;
  }

  // ==========================================
  // PYQs (Previous-Year Questions)
  // ==========================================

  /**
   * Lists previous-year questions for a course with optional filters.
   */
  async listPyqs(courseId: number, filter?: Partial<PyqFilterInput>): Promise<PyqDTO[]> {
    Logger.debug("AssessmentService.listPyqs invoked", { courseId, ...filter });

    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    let cleanFilter = undefined;
    if (filter && Object.keys(filter).length > 0) {
      const validation = AssessmentValidation.validatePyqFilter(filter);
      if (!validation.valid || !validation.data) {
        throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
      }
      cleanFilter = validation.data;
    }

    return this.assessmentRepo.listPyqs(courseId, cleanFilter);
  }

  /**
   * Creates a new PYQ entry for a course.
   */
  async createPyq(input: Partial<CreatePyqInput>): Promise<PyqDTO> {
    Logger.info("AssessmentService.createPyq invoked", { courseId: input.courseId });

    // Step 1: Syntactic Validation
    const validation = AssessmentValidation.validateCreatePyqInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Parent Course must exist
    const course = await this.academicRepo.getCourseById(validation.data.courseId);
    if (!course) {
      throw new Error(`Not Found Error: Course not found with ID: ${validation.data.courseId}`);
    }

    // Step 3: Persist via Data Access Layer
    return this.assessmentRepo.createPyq(validation.data);
  }

  // ==========================================
  // Viva Questions
  // ==========================================

  /**
   * Lists viva questions for a course with optional difficulty filter.
   */
  async listVivaQuestions(courseId: number, difficulty?: Difficulty): Promise<VivaQuestionDTO[]> {
    Logger.debug("AssessmentService.listVivaQuestions invoked", { courseId, difficulty });

    if (!courseId || typeof courseId !== "number" || courseId <= 0) {
      throw new Error("Validation Error: Course ID must be a positive integer.");
    }

    if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
      throw new Error("Validation Error: Difficulty must be one of: easy, medium, hard.");
    }

    return this.assessmentRepo.listVivaQuestions(courseId, difficulty);
  }

  /**
   * Creates a new viva question for a course.
   */
  async createVivaQuestion(input: Partial<CreateVivaQuestionInput>): Promise<VivaQuestionDTO> {
    Logger.info("AssessmentService.createVivaQuestion invoked", { courseId: input.courseId });

    // Step 1: Syntactic Validation
    const validation = AssessmentValidation.validateCreateVivaQuestionInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Parent Course must exist
    const course = await this.academicRepo.getCourseById(validation.data.courseId);
    if (!course) {
      throw new Error(`Not Found Error: Course not found with ID: ${validation.data.courseId}`);
    }

    // Step 3: Persist via Data Access Layer
    return this.assessmentRepo.createVivaQuestion(validation.data);
  }
}

export const assessmentService = new AssessmentService();
