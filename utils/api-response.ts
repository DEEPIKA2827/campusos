/**
 * @file utils/api-response.ts
 * @description Standardized HTTP response builder utilities for Next.js Route Handlers.
 * @purpose Ensures every API endpoint returns uniform JSON responses with proper status codes.
 */

import { NextResponse } from "next/server";
import { ApiResponse, ApiErrorPayload, ApiMetaPayload } from "@/types/api.types";

export class ResponseBuilder {
  /**
   * Return a HTTP 200 OK or 201 Created Success Response
   */
  static success<T>(data: T, message = "Success", statusCode = 200, meta?: ApiMetaPayload): NextResponse<ApiResponse<T>> {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return NextResponse.json(payload, { status: statusCode });
  }

  /**
   * Return a Standardized Error Response (400, 401, 404, 500, etc.)
   */
  static error(message: string, statusCode = 400, errorCode = "BAD_REQUEST", details?: unknown): NextResponse<ApiResponse> {
    const errorPayload: ApiErrorPayload = {
      code: errorCode,
      details,
      timestamp: new Date().toISOString(),
    };

    const payload: ApiResponse = {
      success: false,
      message,
      error: errorPayload,
    };

    return NextResponse.json(payload, { status: statusCode });
  }
}
