import { query } from "@anthropic-ai/claude-agent-sdk";
import { agentDefinitions } from "./agents/definitions.js";
import { PM_PROMPT } from "./agents/prompts.js";
import { renderMessage } from "./streaming/renderer.js";
import {
  ensureSharedMemory,
  updateSessionId,
  getWorkspaceDir,
} from "./memory/shared-memory.js";
import type { OrchestratorOptions } from "./types.js";

export interface RunResult {
  result: string;
  sessionId: string | null;
}

export async function runDevTeam(opts: OrchestratorOptions): Promise<RunResult> {
  const {
    task,
    resumeSessionId,
    maxTurns = parseInt(process.env["MAX_TURNS"] ?? "60", 10),
  } = opts;

  const workspaceDir = getWorkspaceDir();
  ensureSharedMemory();

  const prompt = resumeSessionId
    ? `Continue working on the project. New instruction from the user:\n\n${task}`
    : buildInitialPrompt(task, workspaceDir);

  let capturedSessionId: string | undefined;
  let finalResult = "";

  const runQuery = query({
    prompt,
    options: {
      // Use Claude Code preset so PM has all the built-in tool behaviors,
      // then append PM-specific instructions
      systemPrompt: {
        type: "preset",
        preset: "claude_code",
        append: PM_PROMPT,
      },
      // PM needs Task to spawn subagents, plus file tools for SHARED_MEMORY
      allowedTools: ["Read", "Write", "Task", "Glob", "Grep"],
      // Subagent definitions — the PM invokes these via the Task tool
      agents: agentDefinitions,
      // Working directory so relative paths in Bash commands resolve correctly
      cwd: workspaceDir,
      // Auto-accept file edits so agents don't block on permission prompts inside Docker
      permissionMode: "acceptEdits",
      // Prevent runaway costs; each task should complete well within this limit
      maxTurns,
      // Resume previous session for context continuity if provided
      ...(resumeSessionId ? { resume: resumeSessionId } : {}),
    },
  });

  for await (const message of runQuery) {
    const msg = message as Record<string, unknown>;
    const msgType = msg["type"] as string | undefined;
    const isSubagent = Boolean(msg["parent_tool_use_id"]);

    // Capture session ID from the init message for potential resumption
    if (msgType === "system" && msg["subtype"] === "init" && !capturedSessionId) {
      capturedSessionId = msg["session_id"] as string | undefined;
      if (capturedSessionId) {
        updateSessionId(capturedSessionId);
      }
    }

    // Stream all messages to the terminal in real-time
    renderMessage(message, isSubagent);

    // Capture the final result text
    if (msgType === "result" && msg["subtype"] === "success") {
      finalResult = (msg["result"] as string | undefined) ?? "";
    }
  }

  return { result: finalResult, sessionId: capturedSessionId ?? null };
}

function buildInitialPrompt(task: string, workspaceDir: string): string {
  return `
You are the Project Manager for a software development team.
The team's shared workspace is at: ${workspaceDir}
The shared context file is at: ${workspaceDir}/SHARED_MEMORY.md

## User's Task
${task}

## Instructions
Follow your workflow:
1. Read SHARED_MEMORY.md to understand current project state
2. Write a project plan to SHARED_MEMORY.md
3. Delegate architecture design to the "architect" agent
4. Delegate implementation to the "developer" agent (include architect's key decisions in your prompt)
5. Delegate quality assurance to the "qa-engineer" agent (list implemented files in your prompt)
6. Write a final summary to SHARED_MEMORY.md and report back what was accomplished

Remember: each subagent receives only the prompt you provide — they cannot see this conversation.
Make your delegation prompts self-contained with all necessary context.
  `.trim();
}
