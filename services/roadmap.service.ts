/**
 * @file services/roadmap.service.ts
 * @description Business Logic Layer (BLL) for Career Roadmaps, Ordered Nodes, and Student Progress.
 * @domain Bounded Context: Student Career Velocity & Skill Roadmaps
 * @purpose Implements roadmap progress rules, node relationship verification, and student completion tracking.
 */

import {
  roadmapRepository,
  RoadmapRepository,
  RoadmapWithNodes,
  StudentNodeProgressDetail,
} from "@/repositories/roadmap.repository";
import { userRepository, UserRepository } from "@/repositories/user.repository";
import {
  RoadmapValidation,
  CreateRoadmapInput,
  CreateRoadmapNodeInput,
  UpdateNodeProgressInput,
} from "@/validations/roadmap.validation";
import {
  RoadmapDTO,
  StudentRoadmapProgressDTO,
  RoadmapWithProgressSummaryDTO,
} from "@/types/api.types";
import { Logger } from "@/lib/logger";

export class RoadmapService {
  constructor(
    private roadmapRepo: RoadmapRepository = roadmapRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  /**
   * Lists all master roadmaps.
   */
  async listRoadmaps(): Promise<RoadmapDTO[]> {
    Logger.debug("RoadmapService.listRoadmaps invoked");
    return this.roadmapRepo.listRoadmaps();
  }

  /**
   * Retrieves a roadmap by primary key.
   */
  async getRoadmapById(roadmapId: number): Promise<RoadmapDTO> {
    Logger.debug("RoadmapService.getRoadmapById invoked", { roadmapId });

    if (!roadmapId || typeof roadmapId !== "number" || roadmapId <= 0) {
      throw new Error("Validation Error: Roadmap ID must be a positive integer.");
    }

    const roadmap = await this.roadmapRepo.getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error(`Not Found Error: Roadmap not found with ID: ${roadmapId}`);
    }

    return roadmap;
  }

  /**
   * Retrieves a roadmap and all its ordered nodes.
   */
  async getRoadmapWithNodes(roadmapId: number): Promise<RoadmapWithNodes> {
    Logger.debug("RoadmapService.getRoadmapWithNodes invoked", { roadmapId });

    if (!roadmapId || typeof roadmapId !== "number" || roadmapId <= 0) {
      throw new Error("Validation Error: Roadmap ID must be a positive integer.");
    }

    const result = await this.roadmapRepo.getRoadmapWithNodes(roadmapId);
    if (!result) {
      throw new Error(`Not Found Error: Roadmap not found with ID: ${roadmapId}`);
    }

    return result;
  }

  /**
   * Lists all roadmaps paired with student completion percentages and progress metrics.
   */
  async listStudentRoadmaps(userId: number): Promise<RoadmapWithProgressSummaryDTO[]> {
    Logger.debug("RoadmapService.listStudentRoadmaps invoked", { userId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }

    return this.roadmapRepo.listUserRoadmapsWithProgress(userId);
  }

  /**
   * Retrieves all nodes in a roadmap alongside the student's individual node progress.
   */
  async getStudentRoadmapProgress(
    userId: number,
    roadmapId: number
  ): Promise<StudentNodeProgressDetail[]> {
    Logger.debug("RoadmapService.getStudentRoadmapProgress invoked", { userId, roadmapId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!roadmapId || typeof roadmapId !== "number" || roadmapId <= 0) {
      throw new Error("Validation Error: Roadmap ID must be a positive integer.");
    }

    // Verify roadmap exists
    const roadmap = await this.roadmapRepo.getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error(`Not Found Error: Roadmap not found with ID: ${roadmapId}`);
    }

    return this.roadmapRepo.getStudentProgressForRoadmap(userId, roadmapId);
  }

  /**
   * Atomically creates a roadmap with its sequenced nodes.
   */
  async createRoadmapWithNodes(
    roadmapInput: Partial<CreateRoadmapInput>,
    nodesInput: Partial<CreateRoadmapNodeInput>[] = []
  ): Promise<RoadmapWithNodes> {
    Logger.info("RoadmapService.createRoadmapWithNodes invoked", { title: roadmapInput.title });

    // Step 1: Syntactic Validation for Roadmap
    const roadmapValidation = RoadmapValidation.validateCreateRoadmapInput(roadmapInput);
    if (!roadmapValidation.valid || !roadmapValidation.data) {
      throw new Error(`Validation Error: ${roadmapValidation.errors?.join(", ")}`);
    }

    // Step 2: Syntactic Validation for Nodes
    const validatedNodes: Omit<CreateRoadmapNodeInput, "roadmapId">[] = [];
    for (let i = 0; i < nodesInput.length; i++) {
      const n = nodesInput[i];
      const nodeValidation = RoadmapValidation.validateCreateNodeInput({
        ...n,
        roadmapId: 1, // temporary placeholder for validation pass
      });
      if (!nodeValidation.valid || !nodeValidation.data) {
        throw new Error(`Validation Error on node #${i + 1}: ${nodeValidation.errors?.join(", ")}`);
      }
      validatedNodes.push({
        title: nodeValidation.data.title,
        description: nodeValidation.data.description,
        sequenceNo: nodeValidation.data.sequenceNo,
      });
    }

    // Step 3: Atomic Persistence via Data Access Layer
    return this.roadmapRepo.createRoadmapWithNodes(roadmapValidation.data, validatedNodes);
  }

  /**
   * Updates student progress on a specific roadmap node after strictly validating node ownership to the roadmap.
   */
  async updateNodeProgress(
    userId: number,
    roadmapId: number,
    input: Partial<UpdateNodeProgressInput>
  ): Promise<StudentRoadmapProgressDTO> {
    Logger.info("RoadmapService.updateNodeProgress invoked", { userId, roadmapId, nodeId: input.nodeId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!roadmapId || typeof roadmapId !== "number" || roadmapId <= 0) {
      throw new Error("Validation Error: Roadmap ID must be a positive integer.");
    }

    // Step 1: Syntactic Validation
    const validation = RoadmapValidation.validateUpdateNodeProgressInput(input);
    if (!validation.valid || !validation.data) {
      throw new Error(`Validation Error: ${validation.errors?.join(", ")}`);
    }

    // Step 2: Semantic Check — Ensure user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Not Found Error: User does not exist.");
    }

    // Step 3: Semantic Check — Ensure roadmap exists
    const roadmap = await this.roadmapRepo.getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error(`Not Found Error: Roadmap not found with ID: ${roadmapId}`);
    }

    // Step 4: Semantic Check — Ensure node exists and belongs to the specified roadmap
    const node = await this.roadmapRepo.getNodeById(validation.data.nodeId);
    if (!node) {
      throw new Error(`Not Found Error: Roadmap node not found with ID: ${validation.data.nodeId}`);
    }
    if (node.roadmapId !== roadmapId) {
      throw new Error(
        `Validation Error: Node (ID: ${validation.data.nodeId}) does not belong to Roadmap (ID: ${roadmapId}).`
      );
    }

    // Step 5: Persist via Data Access Layer
    return this.roadmapRepo.updateNodeProgress(
      userId,
      roadmapId,
      validation.data.nodeId,
      validation.data.status
    );
  }

  /**
   * Clears / resets all node progress for a student on a roadmap.
   */
  async resetStudentProgress(userId: number, roadmapId: number): Promise<boolean> {
    Logger.info("RoadmapService.resetStudentProgress invoked", { userId, roadmapId });

    if (!userId || typeof userId !== "number" || userId <= 0) {
      throw new Error("Validation Error: User ID must be a positive integer.");
    }
    if (!roadmapId || typeof roadmapId !== "number" || roadmapId <= 0) {
      throw new Error("Validation Error: Roadmap ID must be a positive integer.");
    }

    return this.roadmapRepo.resetStudentRoadmapProgress(userId, roadmapId);
  }

  /**
   * Deletes a roadmap and its cascading nodes.
   */
  async deleteRoadmap(roadmapId: number): Promise<boolean> {
    Logger.info("RoadmapService.deleteRoadmap invoked", { roadmapId });

    if (!roadmapId || typeof roadmapId !== "number" || roadmapId <= 0) {
      throw new Error("Validation Error: Roadmap ID must be a positive integer.");
    }

    const deleted = await this.roadmapRepo.deleteRoadmap(roadmapId);
    if (!deleted) {
      throw new Error(`Not Found Error: Roadmap not found with ID: ${roadmapId}`);
    }

    return true;
  }
}

export const roadmapService = new RoadmapService();
