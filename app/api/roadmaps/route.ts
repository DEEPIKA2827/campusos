/**
 * @file app/api/roadmaps/route.ts
 * @description Next.js 16 Route Handler for Semester 1-8 Technical Skill Roadmaps.
 * @purpose Exposes HTTP GET endpoint returning branch & semester specific learning roadmaps.
 */

import { NextRequest } from "next/server";
import { ResponseBuilder } from "@/utils/api-response";
import { Logger } from "@/lib/logger";
import { RoadmapDTO } from "@/types/api.types";

/**
 * GET /api/roadmaps?branch=cse&semester=1
 * Retrieves semester skill velocity roadmaps.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch") || "cse";
    const semester = parseInt(searchParams.get("semester") || "1", 10);

    Logger.info("GET /api/roadmaps requested", { branch, semester });

    // Starter DTO response matching RoadmapDTO contract
    // TODO: Move to RoadmapService & RoadmapRepository once database table exists
    const roadmap: RoadmapDTO = {
      id: `roadmap-${branch}-sem-${semester}`,
      branch,
      semester,
      title: `Semester ${semester} SDE Velocity Track`,
      description: "Master foundational C programming, Linux CLI, Git, and solve 25 LeetCode Easy problems.",
      skills: ["C Programming", "Git & GitHub", "Data Structures Basics", "Linux Terminal"],
      projects: ["VTU SGPA & CIE Bunk Calculator Web App"],
    };

    return ResponseBuilder.success(roadmap, "Roadmap retrieved successfully");
  } catch (error) {
    Logger.error("GET /api/roadmaps failed", error);
    return ResponseBuilder.error("Internal Server Error", 500, "INTERNAL_ERROR");
  }
}
