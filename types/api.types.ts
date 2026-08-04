/**
 * @file types/api.types.ts
 * @description Core API DTOs, request/response wrapper interfaces, and backend generic types.
 * @purpose Enforces consistent contract shapes across all HTTP API responses.
 */

/**
 * Standardized API Response Wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiErrorPayload;
  meta?: ApiMetaPayload;
}

/**
 * Standardized Error Payload
 */
export interface ApiErrorPayload {
  code: string;
  details?: unknown;
  timestamp: string;
}

/**
 * Standardized Pagination Metadata Payload
 */
export interface ApiMetaPayload {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Student Profile Domain DTO
 */
export interface StudentProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  collegeName: string;
  collegeType: "vtu_affiliated" | "autonomous";
  branch: string;
  semester: number;
  targetSgpa: number;
  primaryGoal: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Academic Roadmap DTO
 */
export interface RoadmapDTO {
  id: string;
  branch: string;
  semester: number;
  title: string;
  description: string;
  skills: string[];
  projects: string[];
}
