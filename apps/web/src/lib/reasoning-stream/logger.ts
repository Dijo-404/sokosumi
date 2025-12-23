/**
 * Logging utility for LLM reasoning stream auditing.
 * Provides structured logging for all reasoning events.
 */

import type { ReasoningEvent } from "./types";

interface LogContext {
  jobId: string;
  userId?: string;
  agentId?: string;
}

/**
 * Logs a reasoning event for auditing purposes.
 * Uses structured JSON format suitable for log aggregation systems.
 *
 * @param event - The reasoning event to log
 * @param context - Additional context (jobId, userId, agentId)
 */
export function logReasoningEvent(
  event: ReasoningEvent,
  context: LogContext,
): void {
  const logEntry = {
    level: event.type === "ERROR" ? "error" : "info",
    message: `[ReasoningStream] ${event.type}`,
    timestamp: event.timestamp,
    jobId: context.jobId,
    userId: context.userId,
    agentId: context.agentId,
    eventType: event.type,
    status: event.status,
    contentPreview: truncateContent(event.content, 100),
    isFinal: event.isFinal ?? false,
  };

  if (event.type === "ERROR") {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Logs stream lifecycle events (start, end, error)
 */
export function logStreamLifecycle(
  action: "START" | "END" | "ERROR",
  context: LogContext,
  error?: string,
): void {
  const logEntry = {
    level: action === "ERROR" ? "error" : "info",
    message: `[ReasoningStream] Stream ${action}`,
    timestamp: new Date().toISOString(),
    jobId: context.jobId,
    userId: context.userId,
    agentId: context.agentId,
    action,
    error,
  };

  if (action === "ERROR") {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Truncates content for logging to avoid bloating logs
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + "...";
}
