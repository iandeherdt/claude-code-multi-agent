import type { AgentDefinition } from "../types.js";
import { ARCHITECT_PROMPT, DEVELOPER_PROMPT, QA_PROMPT } from "./prompts.js";

// The PM runs as the top-level query() system prompt (not a subagent).
// These three definitions are for the subagents the PM delegates to via the Task tool.
export const agentDefinitions: Record<string, AgentDefinition> = {
  architect: {
    description:
      "Software Architect for Next.js/shadcn/Tailwind projects. Use when you need to design " +
      "component structure, file layout, or make technical architecture decisions. " +
      "Produces ARCHITECTURE.md with full design spec.",
    prompt: ARCHITECT_PROMPT,
    tools: ["Read", "Write", "Glob", "Grep"],
    model: "sonnet",
  },

  developer: {
    description:
      "Full-stack Developer who implements Next.js code with TypeScript, shadcn/ui, and Tailwind CSS. " +
      "Use after the architect has produced ARCHITECTURE.md. " +
      "Initializes the Next.js project if needed, installs shadcn components, writes all source files, " +
      "and runs the build to verify compilation.",
    prompt: DEVELOPER_PROMPT,
    tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    model: "sonnet",
  },

  "qa-engineer": {
    description:
      "QA Engineer who runs builds, reviews code quality, accessibility, and responsiveness. " +
      "Use after the developer has implemented all files. " +
      "Produces QA_REPORT.md and updates SHARED_MEMORY.md with pass/fail status.",
    prompt: QA_PROMPT,
    tools: ["Read", "Bash", "Glob", "Grep", "Write"],
    model: "sonnet",
  },
};
