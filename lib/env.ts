/**
 * @file lib/env.ts
 * @description Environment variable accessor and validation singleton.
 * @purpose Safely retrieves environment configuration and guarantees required secrets exist.
 */

export interface EnvironmentVariables {
  NODE_ENV: string;
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  NEXT_PUBLIC_APP_URL: string;
  GEMINI_API_KEY?: string;
}

class EnvManager {
  private static instance: EnvManager;

  private constructor() {}

  public static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }
    return EnvManager.instance;
  }

  /**
   * Safely retrieves an environment variable or returns default.
   */
  public get(key: keyof EnvironmentVariables, defaultValue = ""): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Validates required database and service keys at application boot time.
   * TODO: Connect database connection string check once Prisma/Supabase setup begins.
   */
  public validateEnv(): boolean {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && !process.env.DATABASE_URL) {
      console.warn("[Env Warning] DATABASE_URL is missing in production environment.");
      return false;
    }
    return true;
  }
}

export const env = EnvManager.getInstance();
