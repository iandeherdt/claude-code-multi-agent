import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const WORKSPACE_DIR = process.env.WORKSPACE_DIR ?? "/workspace";
const SHARED_MEMORY_PATH = join(WORKSPACE_DIR, "SHARED_MEMORY.md");

function buildInitialTemplate(): string {
  return `# Shared Memory — Claude Dev Team

> This file is the shared context for all agents on the team.
> Each agent reads it at the start of their task and writes their outputs back.
> Last initialized: ${new Date().toISOString()}

## Current Plan
(not yet created)

## Architecture
(not yet designed)

## Implementation
(not yet started)

## QA Results
(not yet run)

## Last Completed Task
(none)

## Session Info
Session ID: (none)
Last Updated: ${new Date().toISOString()}
`;
}

export function ensureSharedMemory(): void {
  const dir = dirname(SHARED_MEMORY_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(SHARED_MEMORY_PATH)) {
    writeFileSync(SHARED_MEMORY_PATH, buildInitialTemplate(), "utf-8");
  }
}

export function readSharedMemory(): string {
  ensureSharedMemory();
  return readFileSync(SHARED_MEMORY_PATH, "utf-8");
}

export function resetSharedMemory(): void {
  writeFileSync(SHARED_MEMORY_PATH, buildInitialTemplate(), "utf-8");
}

export function updateSessionId(sessionId: string): void {
  ensureSharedMemory();
  let content = readFileSync(SHARED_MEMORY_PATH, "utf-8");
  content = content
    .replace(/Session ID: .*/, `Session ID: ${sessionId}`)
    .replace(/Last Updated: .*/, `Last Updated: ${new Date().toISOString()}`);
  writeFileSync(SHARED_MEMORY_PATH, content, "utf-8");
}

export function getWorkspaceDir(): string {
  return WORKSPACE_DIR;
}

export function getSharedMemoryPath(): string {
  return SHARED_MEMORY_PATH;
}
