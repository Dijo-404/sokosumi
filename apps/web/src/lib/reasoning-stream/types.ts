/**
 * Types for the Reasoning Stream feature.
 * Used for SSE-based real-time AI agent reasoning visualization.
 */

/**
 * Event types emitted by the reasoning stream
 */
export type ReasoningEventType =
  | "STATUS"
  | "THINKING"
  | "OUTPUT"
  | "ERROR"
  | "COMPLETE";

/**
 * Job execution states
 */
export type JobStatus =
  | "queued"
  | "thinking"
  | "executing"
  | "completed"
  | "failed";

/**
 * A single reasoning event from the SSE stream
 */
export interface ReasoningEvent {
  /** Type of the event */
  type: ReasoningEventType;
  /** Content of the event (reasoning token, status message, error, etc.) */
  content: string;
  /** ISO timestamp of when the event occurred */
  timestamp: string;
  /** Current job status (included on STATUS events) */
  status?: JobStatus;
  /** Whether this is the final event in the stream */
  isFinal?: boolean;
}

/**
 * State shape for the useReasoningStream hook
 */
export interface ReasoningStreamState {
  /** Array of log entries (accumulated reasoning content) */
  logs: ReasoningLogEntry[];
  /** Current job status */
  status: JobStatus | null;
  /** Whether the stream is currently active */
  isStreaming: boolean;
  /** Error message if stream failed */
  error: string | null;
}

/**
 * A single log entry in the reasoning display
 */
export interface ReasoningLogEntry {
  /** Unique identifier for the entry */
  id: string;
  /** Type of entry for visual differentiation */
  type: "thinking" | "output" | "status" | "error";
  /** Content (may contain markdown) */
  content: string;
  /** Timestamp for display */
  timestamp: Date;
}
