"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";

import { JobMonitor } from "@/components/reasoning";
import { Button } from "@/components/ui/button";
import { useReasoningStream } from "@/hooks/use-reasoning-stream";

interface ReasoningPageParams {
  id: string;
}

/**
 * Demo page showing integration of the Reasoning Stream feature.
 * Displays real-time AI agent reasoning using SSE.
 */
export default function ReasoningPage({
  params,
}: {
  params: Promise<ReasoningPageParams>;
}) {
  const { id } = use(params);
  const t = useTranslations("Components.Jobs.ReasoningStream");

  const { logs, status, isStreaming, error, start, stop, reset } =
    useReasoningStream({
      jobId: id,
      autoStart: false,
    });

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/jobs/${id}`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("jobId")} <code className="text-sm">{id}</code>
          </p>
        </div>
      </div>

      {/* Reasoning Monitor */}
      <JobMonitor
        logs={logs}
        status={status}
        isStreaming={isStreaming}
        error={error}
        onStart={start}
        onStop={stop}
        onReset={reset}
        className="min-h-[600px]"
      />

      {/* Usage Info */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">{t("about")}</h3>
        <p className="text-muted-foreground text-sm">{t("aboutDescription")}</p>
      </div>
    </div>
  );
}
