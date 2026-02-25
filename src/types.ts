// Re-export the SDK's AgentDefinition so the rest of the codebase imports from one place
export type { AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

export interface OrchestratorOptions {
  task: string;
  resumeSessionId?: string;
  maxTurns?: number;
}
