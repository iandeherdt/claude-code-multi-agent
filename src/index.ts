import "dotenv/config";
import * as readline from "readline";
import { runDevTeam } from "./orchestrator.js";
import { printBanner } from "./streaming/renderer.js";
import { ensureSharedMemory, resetSharedMemory } from "./memory/shared-memory.js";

async function main(): Promise<void> {
  if (!process.env["ANTHROPIC_API_KEY"]) {
    console.error(
      "Error: ANTHROPIC_API_KEY environment variable is not set.\n" +
        "Copy .env.example to .env and add your API key."
    );
    process.exit(1);
  }

  ensureSharedMemory();

  // Single-shot mode: task passed as CLI arguments
  const cliTask = process.argv.slice(2).join(" ").trim();
  if (cliTask) {
    console.log(`\nRunning task: "${cliTask}"\n`);
    const { result } = await runDevTeam({ task: cliTask });
    if (result) {
      console.log(`\n${result}`);
    }
    process.exit(0);
  }

  // Interactive REPL mode
  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  // Track current session for context continuity across multiple tasks
  let currentSessionId: string | undefined;

  function prompt(): void {
    rl.question("\nTask> ", async (input) => {
      const trimmed = input.trim();

      if (!trimmed || trimmed === "/quit" || trimmed === "/exit") {
        console.log("\nGoodbye!");
        rl.close();
        process.exit(0);
        return;
      }

      if (trimmed === "/new") {
        currentSessionId = undefined;
        resetSharedMemory();
        console.log("\nSession cleared. Starting fresh.\n");
        prompt();
        return;
      }

      if (trimmed === "/status") {
        const { readSharedMemory } = await import("./memory/shared-memory.js");
        console.log("\n" + readSharedMemory());
        prompt();
        return;
      }

      if (trimmed === "/help") {
        console.log("\nAvailable commands:");
        console.log("  <task>   — Submit a task to the dev team");
        console.log("  /new     — Clear session and shared memory, start fresh");
        console.log("  /status  — Print current SHARED_MEMORY.md contents");
        console.log("  /help    — Show this help");
        console.log("  /quit    — Exit");
        prompt();
        return;
      }

      try {
        const { result, sessionId } = await runDevTeam({
          task: trimmed,
          resumeSessionId: currentSessionId,
        });

        // Persist session for next turn so PM retains conversation context
        if (sessionId) {
          currentSessionId = sessionId;
        }

        if (result) {
          console.log(`\n${result}`);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(`\nError: ${err.message}`);
          if (process.env["DEBUG"]) {
            console.error(err.stack);
          }
        } else {
          console.error("\nUnknown error occurred.");
        }
      }

      prompt();
    });
  }

  rl.on("close", () => {
    console.log("\nGoodbye!");
    process.exit(0);
  });

  prompt();
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
