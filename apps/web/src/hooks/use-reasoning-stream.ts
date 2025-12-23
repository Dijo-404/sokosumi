"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  JobStatus,
  ReasoningEvent,
  ReasoningLogEntry,
  ReasoningStreamState,
} from "@/lib/reasoning-stream";

interface UseReasoningStreamOptions {
  /** Job ID to stream reasoning for */
  jobId: string;
  /** Whether to start streaming immediately on mount */
  autoStart?: boolean;
  /** Base URL for the API (defaults to current origin) */
  apiBaseUrl?: string;
}

interface UseReasoningStreamReturn extends ReasoningStreamState {
  /** Start or restart the stream */
  start: () => void;
  /** Stop the stream */
  stop: () => void;
  /** Clear all logs and reset state */
  reset: () => void;
}

/**
 * Custom hook for managing SSE connection to the reasoning stream API.
 *
 * @example
 * ```tsx
 * const { logs, status, isStreaming, error, start, stop, reset } =
 *   useReasoningStream({ jobId: "job-123", autoStart: true });
 * ```
 */
export function useReasoningStream({
  jobId,
  autoStart = false,
  apiBaseUrl = "",
}: UseReasoningStreamOptions): UseReasoningStreamReturn {
  const [logs, setLogs] = useState<ReasoningLogEntry[]>([]);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const logIdCounterRef = useRef(0);

  const generateLogId = useCallback(() => {
    logIdCounterRef.current += 1;
    return `log-${Date.now()}-${logIdCounterRef.current}`;
  }, []);

  const addLog = useCallback(
    (
      type: ReasoningLogEntry["type"],
      content: string,
      timestamp?: string,
    ): void => {
      const entry: ReasoningLogEntry = {
        id: generateLogId(),
        type,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      };
      setLogs((prev) => [...prev, entry]);
    },
    [generateLogId],
  );

  const stop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setLogs([]);
    setStatus(null);
    setError(null);
  }, [stop]);

  const start = useCallback(() => {
    // Clean up any existing connection
    stop();
    setError(null);

    const url = `${apiBaseUrl}/api/stream-reasoning?jobId=${encodeURIComponent(jobId)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    setIsStreaming(true);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ReasoningEvent;

        // Update status if present
        if (data.status) {
          setStatus(data.status);
        }

        // Handle different event types
        switch (data.type) {
          case "STATUS":
            addLog("status", data.content, data.timestamp);
            break;
          case "THINKING":
            addLog("thinking", data.content, data.timestamp);
            break;
          case "OUTPUT":
            addLog("output", data.content, data.timestamp);
            break;
          case "ERROR":
            addLog("error", data.content, data.timestamp);
            setError(data.content);
            break;
          case "COMPLETE":
            // Stream complete
            break;
        }

        // Close connection on final event
        if (data.isFinal) {
          stop();
        }
      } catch (parseError) {
        console.error("Failed to parse SSE event:", parseError);
      }
    };

    eventSource.onerror = () => {
      // EventSource has limited error info, but we can detect connection issues
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection closed unexpectedly");
        stop();
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        // Reconnecting - this is normal SSE behavior
        setError("Reconnecting...");
      }
    };
  }, [jobId, apiBaseUrl, stop, addLog]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && jobId) {
      start();
    }
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    logs,
    status,
    isStreaming,
    error,
    start,
    stop,
    reset,
  };
}
