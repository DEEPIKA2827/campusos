/**
 * @file lib/db.ts
 * @description PostgreSQL / Supabase Database client using Drizzle ORM.
 * @purpose Initializes and exports singleton Drizzle instance bound to all 21 schemas.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { Logger } from "./logger";

// Database Connection String from environment
const connectionString = process.env.DATABASE_URL || "";

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: ReturnType<typeof drizzle<typeof schema>> | undefined;
  // eslint-disable-next-line no-var
  var __pgClient: postgres.Sql | undefined;
}

function createDatabaseClient() {
  if (!connectionString) {
    Logger.warn("DATABASE_URL environment variable is not defined. Initializing database client in standby mode.");
    return null;
  }

  try {
    const pgClient = global.__pgClient || postgres(connectionString, {
      max: process.env.DB_MAX_CONNECTIONS ? parseInt(process.env.DB_MAX_CONNECTIONS, 10) : 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    if (process.env.NODE_ENV !== "production") {
      global.__pgClient = pgClient;
    }

    const drizzleDb = global.__dbClient || drizzle(pgClient, { schema });

    if (process.env.NODE_ENV !== "production") {
      global.__dbClient = drizzleDb;
    }

    return drizzleDb;
  } catch (error) {
    Logger.error("Failed to initialize PostgreSQL connection pool", error);
    return null;
  }
}

export const db = createDatabaseClient();
export { schema };
