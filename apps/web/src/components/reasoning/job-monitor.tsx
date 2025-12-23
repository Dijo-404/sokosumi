"use client";

import {
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import Markdown from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { JobStatus, ReasoningLogEntry } from "@/lib/reasoning-stream";
import { cn } from "@/lib/utils";

interface JobMonitorProps {
  /** Array of log entries to display */
  logs: ReasoningLogEntry[];
  /** Current job status */
  status: JobStatus | null;
  /** Whether the stream is currently active */
  isStreaming: boolean;
  /** Error message if stream failed */
  error: string | null;
  /** Callback to start/restart the stream */
  onStart: () => void;
  /** Callback to stop the stream */
  onStop: () => void;
  /** Callback to reset the state */
  onReset: () => void;
  /** Optional className for the container */
  className?: string;
}

/**
 * Terminal-like UI component for displaying AI agent reasoning in real-time.
 * Differentiates between thinking tokens and final output with visual styling.
 */
export function JobMonitor({
  logs,
  status,
  isStreaming,
  error,
  onStart,
  onStop,
  onReset,
  className,
}: JobMonitorProps) {
  const t = useTranslations("Components.Jobs.ReasoningStream");
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div
      className={cn(
        "bg-card flex h-full min-h-[400px] flex-col rounded-xl border",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Brain className="text-primary size-5" />
          <span className="font-semibold">{t("title")}</span>
          {status && <StatusBadge status={status} />}
        </div>
        <div className="flex items-center gap-2">
          {!isStreaming && logs.length === 0 && (
            <Button variant="primary" size="sm" onClick={onStart}>
              <Play className="size-4" />
              {t("Actions.start")}
            </Button>
          )}
          {isStreaming && (
            <Button variant="outline" size="sm" onClick={onStop}>
              {t("Actions.stop")}
            </Button>
          )}
          {!isStreaming && logs.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={onReset}>
                {t("Actions.clear")}
              </Button>
              <Button variant="primary" size="sm" onClick={onStart}>
                <Play className="size-4" />
                {t("Actions.restart")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {logs.length === 0 && !isStreaming && !error && (
            <EmptyState onStart={onStart} />
          )}

          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}

          {isStreaming && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">{t("streaming")}</span>
            </div>
          )}

          {error && !isStreaming && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3">
              <XCircle className="size-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={scrollEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const t = useTranslations("Components.Jobs.ReasoningStream.Status");

  const config: Record<
    JobStatus,
    { variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    queued: { variant: "outline" },
    thinking: { variant: "secondary" },
    executing: { variant: "default" },
    completed: { variant: "default" },
    failed: { variant: "destructive" },
  };

  const { variant } = config[status];

  return (
    <Badge variant={variant} className="gap-1.5">
      {status === "thinking" && <Loader2 className="size-3 animate-spin" />}
      {status === "executing" && <Loader2 className="size-3 animate-spin" />}
      {status === "completed" && <CheckCircle className="size-3" />}
      {status === "failed" && <XCircle className="size-3" />}
      {status === "queued" && <Clock className="size-3" />}
      {t(status)}
    </Badge>
  );
}

function LogEntry({ log }: { log: ReasoningLogEntry }) {
  const t = useTranslations("Components.Jobs.ReasoningStream.LogType");

  const typeStyles: Record<ReasoningLogEntry["type"], string> = {
    thinking: "border-l-blue-500/50 bg-blue-500/5",
    output: "border-l-green-500/50 bg-green-500/5",
    status: "border-l-amber-500/50 bg-amber-500/5",
    error: "border-l-destructive/50 bg-destructive/5",
  };

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 p-3 transition-opacity",
        typeStyles[log.type],
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {t(log.type)}
        </span>
        <span className="text-muted-foreground text-xs">
          {log.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <div className="text-sm">
        <Markdown className="prose-sm">{log.content}</Markdown>
      </div>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  const t = useTranslations("Components.Jobs.ReasoningStream");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="bg-muted rounded-full p-4">
        <Brain className="text-muted-foreground size-8" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{t("emptyTitle")}</h3>
        <p className="text-muted-foreground text-sm">{t("emptyDescription")}</p>
      </div>
      <Button variant="primary" onClick={onStart}>
        <Play className="size-4" />
        {t("Actions.startStreaming")}
      </Button>
    </div>
  );
}
