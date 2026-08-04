/**
 * @file lib/logger.ts
 * @description Centralized logging abstraction layer.
 * @purpose Provides structured logging for API requests, errors, and system events.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextString = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextString}`;
  }

  static info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage("info", message, context));
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  static error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(this.formatMessage("error", message, { ...context, errorDetails: String(error) }));
  }

  static debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}
