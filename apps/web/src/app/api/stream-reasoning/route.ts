import { NextRequest } from "next/server";

import {
  type JobStatus,
  logReasoningEvent,
  logStreamLifecycle,
  type ReasoningEvent,
} from "@/lib/reasoning-stream";

/**
 * SSE endpoint for streaming AI agent reasoning in real-time.
 *
 * Query Parameters:
 * - jobId: Required. The ID of the job to stream reasoning for.
 *
 * Returns a Server-Sent Events stream with ReasoningEvent payloads.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response(JSON.stringify({ error: "jobId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const logContext = { jobId };
  logStreamLifecycle("START", logContext);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: ReasoningEvent) => {
        logReasoningEvent(event, logContext);
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // ============================================
        // SIMULATED AGENTIC SERVICE
        // Replace this section with your actual API integration
        // ============================================

        await simulateAgenticService(sendEvent, jobId);

        logStreamLifecycle("END", logContext);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logStreamLifecycle("ERROR", logContext, errorMessage);

        sendEvent({
          type: "ERROR",
          content: `Stream error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
          isFinal: true,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * Simulated agentic service that generates reasoning events.
 * Replace this with your actual upstream API integration.
 */
async function simulateAgenticService(
  sendEvent: (event: ReasoningEvent) => void,
  jobId: string,
): Promise<void> {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Status: Queued
  sendEvent({
    type: "STATUS",
    content: `Job ${jobId} is queued for processing`,
    timestamp: new Date().toISOString(),
    status: "queued" as JobStatus,
  });
  await delay(500);

  // Status: Thinking
  sendEvent({
    type: "STATUS",
    content: "Agent is analyzing the request...",
    timestamp: new Date().toISOString(),
    status: "thinking" as JobStatus,
  });
  await delay(300);

  // Thinking tokens - simulating internal monologue
  const thinkingSequence = [
    "Let me analyze this request carefully...",
    "First, I need to understand the **context** of what the user is asking.",
    "Breaking down the problem into smaller components:",
    "1. Identify the main objective",
    "2. Gather relevant information",
    "3. Formulate a solution approach",
    "Considering multiple approaches to solve this...",
    "The optimal solution seems to be using a **structured methodology**.",
  ];

  for (const thought of thinkingSequence) {
    sendEvent({
      type: "THINKING",
      content: thought,
      timestamp: new Date().toISOString(),
    });
    await delay(150 + Math.random() * 200);
  }

  // Status: Executing
  sendEvent({
    type: "STATUS",
    content: "Executing the solution...",
    timestamp: new Date().toISOString(),
    status: "executing" as JobStatus,
  });
  await delay(400);

  // More thinking during execution
  const executionThoughts = [
    "Implementing the solution step by step...",
    "Processing data and validating inputs...",
    "Running the core algorithm...",
    "Verifying the results...",
  ];

  for (const thought of executionThoughts) {
    sendEvent({
      type: "THINKING",
      content: thought,
      timestamp: new Date().toISOString(),
    });
    await delay(200 + Math.random() * 150);
  }

  // Final output
  const outputContent = `
## Task Completed Successfully

The job has been processed with the following results:

- **Status**: Completed
- **Job ID**: \`${jobId}\`
- **Processing Time**: ${(Math.random() * 2 + 1).toFixed(2)}s

### Summary
The agent successfully analyzed the request and executed the required operations.
All validation checks passed and the output has been verified.

> This is a simulated response. In production, this would contain the actual agent output.
`;

  sendEvent({
    type: "OUTPUT",
    content: outputContent.trim(),
    timestamp: new Date().toISOString(),
  });

  // Status: Completed
  sendEvent({
    type: "STATUS",
    content: "Job completed successfully",
    timestamp: new Date().toISOString(),
    status: "completed" as JobStatus,
  });

  // Complete event
  sendEvent({
    type: "COMPLETE",
    content: "Stream ended",
    timestamp: new Date().toISOString(),
    isFinal: true,
  });
}
