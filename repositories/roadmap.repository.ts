/**
 * @file repositories/roadmap.repository.ts
 * @description Data Access Layer for Career Roadmaps, Ordered Nodes, and Student Progress.
 * @domain Bounded Context: Career Roadmaps & Learning Progress
 * @tables roadmaps, roadmap_nodes, student_roadmap_progress
 */

import { db, schema } from "@/lib/db";
import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import {
  RoadmapDTO,
  RoadmapNodeDTO,
  StudentRoadmapProgressDTO,
  RoadmapWithProgressSummaryDTO,
  RoadmapProgressStatus,
} from "@/types/api.types";

export interface CreateRoadmapInput {
  title: string;
  description?: string | null;
  career?: string | null;
}

export interface CreateRoadmapNodeInput {
  roadmapId: number;
  title: string;
  description?: string | null;
  sequenceNo: number;
}

export interface RoadmapWithNodes {
  roadmap: RoadmapDTO;
  nodes: RoadmapNodeDTO[];
}

export interface StudentNodeProgressDetail {
  node: RoadmapNodeDTO;
  progress: StudentRoadmapProgressDTO | null;
}

export class RoadmapRepository {
  private getDb() {
    if (!db) {
      throw new Error(
        "Database operation failed: Database client is not initialized. Please ensure DATABASE_URL is configured."
      );
    }
    return db;
  }

  // ==========================================
  // Roadmaps
  // ==========================================

  async listRoadmaps(): Promise<RoadmapDTO[]> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.listRoadmaps");

    const records = await client.select().from(schema.roadmaps);

    return records.map((r) => ({
      roadmapId: r.roadmapId,
      title: r.title,
      description: r.description,
      career: r.career,
    }));
  }

  async getRoadmapById(roadmapId: number): Promise<RoadmapDTO | null> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.getRoadmapById", { roadmapId });

    const [record] = await client
      .select()
      .from(schema.roadmaps)
      .where(eq(schema.roadmaps.roadmapId, roadmapId));

    if (!record) return null;

    return {
      roadmapId: record.roadmapId,
      title: record.title,
      description: record.description,
      career: record.career,
    };
  }

  /**
   * Lists all roadmaps paired with aggregated student completion metrics (0 N+1 queries).
   */
  async listUserRoadmapsWithProgress(userId: number): Promise<RoadmapWithProgressSummaryDTO[]> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.listUserRoadmapsWithProgress", { userId });

    const allRoadmaps = await this.listRoadmaps();
    if (allRoadmaps.length === 0) return [];

    const roadmapIds = allRoadmaps.map((r) => r.roadmapId);

    // 1. Batch query total nodes per roadmap
    const nodeCounts = await client
      .select({
        roadmapId: schema.roadmapNodes.roadmapId,
        total: sql<number>`count(*)::int`,
      })
      .from(schema.roadmapNodes)
      .where(inArray(schema.roadmapNodes.roadmapId, roadmapIds))
      .groupBy(schema.roadmapNodes.roadmapId);

    const nodeCountMap = new Map<number, number>();
    nodeCounts.forEach((nc) => nodeCountMap.set(nc.roadmapId, nc.total));

    // 2. Batch query user's progress counts per roadmap (completed / in_progress)
    const progressCounts = await client
      .select({
        roadmapId: schema.studentRoadmapProgress.roadmapId,
        status: schema.studentRoadmapProgress.status,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.studentRoadmapProgress)
      .where(
        and(
          eq(schema.studentRoadmapProgress.userId, userId),
          inArray(schema.studentRoadmapProgress.roadmapId, roadmapIds)
        )
      )
      .groupBy(schema.studentRoadmapProgress.roadmapId, schema.studentRoadmapProgress.status);

    const completedMap = new Map<number, number>();
    const inProgressMap = new Map<number, number>();

    progressCounts.forEach((pc) => {
      if (pc.status === "completed") {
        completedMap.set(pc.roadmapId, pc.count);
      } else if (pc.status === "in_progress") {
        inProgressMap.set(pc.roadmapId, pc.count);
      }
    });

    return allRoadmaps.map((r) => {
      const totalNodes = nodeCountMap.get(r.roadmapId) || 0;
      const completedNodes = completedMap.get(r.roadmapId) || 0;
      const inProgressNodes = inProgressMap.get(r.roadmapId) || 0;
      const completionPercentage =
        totalNodes > 0 ? parseFloat(((completedNodes / totalNodes) * 100).toFixed(2)) : 0;

      return {
        roadmapId: r.roadmapId,
        title: r.title,
        description: r.description,
        career: r.career,
        totalNodes,
        completedNodes,
        inProgressNodes,
        completionPercentage,
      };
    });
  }

  async deleteRoadmap(roadmapId: number): Promise<boolean> {
    const client = this.getDb();
    Logger.info("RoadmapRepository.deleteRoadmap", { roadmapId });

    const [deleted] = await client
      .delete(schema.roadmaps)
      .where(eq(schema.roadmaps.roadmapId, roadmapId))
      .returning();

    return !!deleted;
  }

  // ==========================================
  // Roadmap Nodes
  // ==========================================

  async getNodeById(nodeId: number): Promise<RoadmapNodeDTO | null> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.getNodeById", { nodeId });

    const [record] = await client
      .select()
      .from(schema.roadmapNodes)
      .where(eq(schema.roadmapNodes.nodeId, nodeId));

    if (!record) return null;

    return {
      nodeId: record.nodeId,
      roadmapId: record.roadmapId,
      title: record.title,
      description: record.description,
      sequenceNo: record.sequenceNo,
    };
  }

  async listNodesByRoadmap(roadmapId: number): Promise<RoadmapNodeDTO[]> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.listNodesByRoadmap", { roadmapId });

    const records = await client
      .select()
      .from(schema.roadmapNodes)
      .where(eq(schema.roadmapNodes.roadmapId, roadmapId))
      .orderBy(asc(schema.roadmapNodes.sequenceNo));

    return records.map((n) => ({
      nodeId: n.nodeId,
      roadmapId: n.roadmapId,
      title: n.title,
      description: n.description,
      sequenceNo: n.sequenceNo,
    }));
  }

  async getRoadmapWithNodes(roadmapId: number): Promise<RoadmapWithNodes | null> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.getRoadmapWithNodes", { roadmapId });

    const roadmap = await this.getRoadmapById(roadmapId);
    if (!roadmap) return null;

    const nodes = await this.listNodesByRoadmap(roadmapId);

    return {
      roadmap,
      nodes,
    };
  }

  /**
   * Atomically creates a roadmap along with its sequenced nodes in a transaction.
   */
  async createRoadmapWithNodes(
    roadmapInput: CreateRoadmapInput,
    nodesInput: Omit<CreateRoadmapNodeInput, "roadmapId">[]
  ): Promise<RoadmapWithNodes> {
    const client = this.getDb();
    Logger.info("RoadmapRepository.createRoadmapWithNodes (atomic)", { title: roadmapInput.title });

    return await client.transaction(async (tx) => {
      const [roadmapRecord] = await tx
        .insert(schema.roadmaps)
        .values({
          title: roadmapInput.title,
          description: roadmapInput.description || null,
          career: roadmapInput.career || null,
        })
        .returning();

      let nodeRecords: typeof schema.roadmapNodes.$inferSelect[] = [];
      if (nodesInput.length > 0) {
        nodeRecords = await tx
          .insert(schema.roadmapNodes)
          .values(
            nodesInput.map((n) => ({
              roadmapId: roadmapRecord.roadmapId,
              title: n.title,
              description: n.description || null,
              sequenceNo: n.sequenceNo,
            }))
          )
          .returning();
      }

      return {
        roadmap: {
          roadmapId: roadmapRecord.roadmapId,
          title: roadmapRecord.title,
          description: roadmapRecord.description,
          career: roadmapRecord.career,
        },
        nodes: nodeRecords.map((n) => ({
          nodeId: n.nodeId,
          roadmapId: n.roadmapId,
          title: n.title,
          description: n.description,
          sequenceNo: n.sequenceNo,
        })),
      };
    });
  }

  // ==========================================
  // Student Roadmap Progress
  // ==========================================

  async getStudentProgressForRoadmap(
    userId: number,
    roadmapId: number
  ): Promise<StudentNodeProgressDetail[]> {
    const client = this.getDb();
    Logger.debug("RoadmapRepository.getStudentProgressForRoadmap", { userId, roadmapId });

    const nodes = await client
      .select()
      .from(schema.roadmapNodes)
      .where(eq(schema.roadmapNodes.roadmapId, roadmapId))
      .orderBy(asc(schema.roadmapNodes.sequenceNo));

    const progressRecords = await client
      .select()
      .from(schema.studentRoadmapProgress)
      .where(
        and(
          eq(schema.studentRoadmapProgress.userId, userId),
          eq(schema.studentRoadmapProgress.roadmapId, roadmapId)
        )
      );

    const progressMap = new Map<number, typeof schema.studentRoadmapProgress.$inferSelect>();
    progressRecords.forEach((p) => progressMap.set(p.nodeId, p));

    return nodes.map((node) => {
      const p = progressMap.get(node.nodeId);
      return {
        node: {
          nodeId: node.nodeId,
          roadmapId: node.roadmapId,
          title: node.title,
          description: node.description,
          sequenceNo: node.sequenceNo,
        },
        progress: p
          ? {
              progressId: p.progressId,
              userId: p.userId,
              roadmapId: p.roadmapId,
              nodeId: p.nodeId,
              status: p.status as RoadmapProgressStatus,
              completedAt: p.completedAt,
            }
          : null,
      };
    });
  }

  /**
   * Updates or inserts a student's progress for a specific roadmap node.
   */
  async updateNodeProgress(
    userId: number,
    roadmapId: number,
    nodeId: number,
    status: RoadmapProgressStatus
  ): Promise<StudentRoadmapProgressDTO> {
    const client = this.getDb();
    Logger.info("RoadmapRepository.updateNodeProgress", { userId, roadmapId, nodeId, status });

    const [existing] = await client
      .select()
      .from(schema.studentRoadmapProgress)
      .where(
        and(
          eq(schema.studentRoadmapProgress.userId, userId),
          eq(schema.studentRoadmapProgress.nodeId, nodeId)
        )
      );

    const completedAt = status === "completed" ? new Date().toISOString() : null;

    let record;
    if (existing) {
      const [updated] = await client
        .update(schema.studentRoadmapProgress)
        .set({
          status,
          completedAt,
        })
        .where(eq(schema.studentRoadmapProgress.progressId, existing.progressId))
        .returning();
      record = updated;
    } else {
      const [inserted] = await client
        .insert(schema.studentRoadmapProgress)
        .values({
          userId,
          roadmapId,
          nodeId,
          status,
          completedAt,
        })
        .returning();
      record = inserted;
    }

    return {
      progressId: record.progressId,
      userId: record.userId,
      roadmapId: record.roadmapId,
      nodeId: record.nodeId,
      status: record.status as RoadmapProgressStatus,
      completedAt: record.completedAt,
    };
  }

  /**
   * Resets/clears all node progress records for a user on a specific roadmap.
   */
  async resetStudentRoadmapProgress(userId: number, roadmapId: number): Promise<boolean> {
    const client = this.getDb();
    Logger.info("RoadmapRepository.resetStudentRoadmapProgress", { userId, roadmapId });

    const deleted = await client
      .delete(schema.studentRoadmapProgress)
      .where(
        and(
          eq(schema.studentRoadmapProgress.userId, userId),
          eq(schema.studentRoadmapProgress.roadmapId, roadmapId)
        )
      )
      .returning();

    return deleted.length > 0;
  }
}

export const roadmapRepository = new RoadmapRepository();
