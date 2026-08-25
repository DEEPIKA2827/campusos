/**
 * @file lib/auth.ts
 * @description Development Authentication and Session Token Management Utility.
 * @purpose Minimal cryptographic HMAC-SHA256 session token signer, verifier, and cookie manager.
 * @security Uses Node.js crypto primitives with constant-time signature comparison and strict payload validation.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { UserRole } from "@/types/api.types";
import { Logger } from "@/lib/logger";

export const AUTH_COOKIE_NAME = "auth_session";
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface AuthSession {
  userId: number;
  role: UserRole;
  iat: number;
  exp: number;
}

const VALID_ROLES: UserRole[] = ["student", "admin", "faculty"];

/**
 * Retrieves the cryptographic secret from the environment.
 * Fails explicitly if the secret is missing or empty.
 */
function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "Configuration Error: AUTH_SESSION_SECRET environment variable is missing or empty. Please set AUTH_SESSION_SECRET in your environment configuration."
    );
  }
  return secret.trim();
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Token structure: <base64url-payload>.<base64url-signature>
 */
export function createSessionToken(
  userId: number,
  role: UserRole,
  expiresInSeconds = AUTH_COOKIE_MAX_AGE
): string {
  if (!userId || typeof userId !== "number" || userId <= 0) {
    throw new Error("Authentication Error: userId must be a positive integer.");
  }
  if (!role || !VALID_ROLES.includes(role)) {
    throw new Error(`Authentication Error: Invalid user role: ${role}`);
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSession = {
    userId,
    role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const secret = getSessionSecret();
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Validates HMAC signature with constant-time comparison, checks expiration, and validates payload schema.
 * Rejects unsigned tokens, malformed strings, forged signatures, raw numbers, and expired tokens.
 */
export function verifySessionToken(token: string | null | undefined): AuthSession | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const trimmedToken = token.trim();
  const parts = trimmedToken.split(".");
  if (parts.length !== 2) {
    // Malformed token or raw value (e.g. "3")
    return null;
  }

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  try {
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    // Constant-time signature comparison to prevent timing attacks
    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    // Decode and validate payload JSON
    const decodedJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(decodedJson) as Partial<AuthSession>;

    if (
      !payload ||
      typeof payload.userId !== "number" ||
      payload.userId <= 0 ||
      typeof payload.role !== "string" ||
      !VALID_ROLES.includes(payload.role as UserRole) ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      Logger.debug("Session token has expired", { userId: payload.userId, exp: payload.exp, now });
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role as UserRole,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    Logger.debug("verifySessionToken failed", { error: String(error) });
    return null;
  }
}

/**
 * Extracts and verifies authenticated user identity from NextRequest.
 * Checks HTTP-only cookie first, then Authorization Bearer header.
 * Returns verified AuthSession or null if unauthenticated.
 */
export function getAuthenticatedUser(request: NextRequest): AuthSession | null {
  // 1. Check HTTP-only auth_session cookie
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) {
      return session;
    }
  }

  // 2. Check Authorization Bearer header (for API/integration testing)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    const session = verifySessionToken(bearerToken);
    if (session) {
      return session;
    }
  }

  return null;
}

/**
 * Attaches the auth_session HTTP-only cookie to an outgoing NextResponse.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

/**
 * Clears the auth_session HTTP-only cookie on an outgoing NextResponse.
 */
export function clearAuthCookie(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });
}
