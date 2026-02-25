import chalk from "chalk";

// Role display config
const ROLE_CONFIG: Record<string, { label: string; color: (s: string) => string }> = {
  "project-manager": { label: "PROJECT-MANAGER", color: chalk.cyan },
  architect: { label: "ARCHITECT", color: chalk.blue },
  developer: { label: "DEVELOPER", color: chalk.green },
  "qa-engineer": { label: "QA-ENGINEER", color: chalk.yellow },
  system: { label: "SYSTEM", color: chalk.gray },
  subagent: { label: "SUBAGENT", color: chalk.magenta },
};

function getRole(isSubagent: boolean): string {
  return isSubagent ? "subagent" : "project-manager";
}

function roleTag(role: string): string {
  const cfg = ROLE_CONFIG[role] ?? { label: role.toUpperCase(), color: chalk.white };
  return cfg.color(`[${cfg.label}]`);
}

function summarizeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "Write":
      return `Writing ${input["file_path"] ?? ""}`;
    case "Edit":
      return `Editing ${input["file_path"] ?? ""}`;
    case "Read":
      return `Reading ${input["file_path"] ?? ""}`;
    case "Bash":
      return `$ ${String(input["command"] ?? "").slice(0, 80)}`;
    case "Glob":
      return `Glob: ${input["pattern"] ?? ""}`;
    case "Grep":
      return `Grep: "${input["pattern"] ?? ""}"`;
    case "Task":
      return `Delegating → ${String(input["subagent_type"] ?? "").toUpperCase()}`;
    default:
      return JSON.stringify(input).slice(0, 100);
  }
}

// Track which subagent_type we last saw being invoked, so we can label subagent messages
let lastDelegatedRole = "subagent";

export function renderMessage(message: unknown, isSubagent: boolean): void {
  const msg = message as Record<string, unknown>;
  const msgType = msg["type"] as string | undefined;

  if (msgType === "system") {
    const subtype = msg["subtype"] as string | undefined;
    if (subtype === "init") {
      const sessionId = msg["session_id"] as string | undefined;
      console.log(chalk.gray(`\n[SYSTEM] Session started: ${sessionId ?? "unknown"}`));
      console.log(chalk.gray("─".repeat(60)));
    }
    return;
  }

  if (msgType === "assistant") {
    const messageObj = msg["message"] as Record<string, unknown> | undefined;
    const content = (messageObj?.["content"] as unknown[]) ?? [];

    // Determine which role generated this based on delegation tracking
    const role = isSubagent ? lastDelegatedRole : "project-manager";
    const tag = roleTag(role);

    for (const block of content) {
      const b = block as Record<string, unknown>;
      const blockType = b["type"] as string | undefined;

      if (blockType === "text") {
        const text = (b["text"] as string | undefined)?.trim();
        if (text) {
          console.log(`\n${tag} ${text}`);
        }
      } else if (blockType === "tool_use") {
        const toolName = b["name"] as string;
        const toolInput = (b["input"] as Record<string, unknown>) ?? {};

        if (toolName === "Task") {
          const subagentType = (toolInput["subagent_type"] as string | undefined) ?? "unknown";
          const description = (toolInput["description"] as string | undefined) ?? "";
          lastDelegatedRole = subagentType.toLowerCase().replace(/_/g, "-");

          const delegateCfg = ROLE_CONFIG[lastDelegatedRole];
          const delegateLabel = delegateCfg
            ? delegateCfg.color(delegateCfg.label)
            : chalk.magenta(lastDelegatedRole.toUpperCase());

          console.log(
            `\n${tag} ${chalk.magenta("→ Delegating to")} ${delegateLabel}`
          );
          if (description) {
            console.log(chalk.gray(`  ${description}`));
          }
        } else {
          console.log(
            chalk.gray(`  ${roleTag(role)} [${toolName}] ${summarizeTool(toolName, toolInput)}`)
          );
        }
      }
    }
    return;
  }

  if (msgType === "result") {
    const subtype = msg["subtype"] as string | undefined;
    const durationMs = msg["duration_ms"] as number | undefined;
    const cost = msg["total_cost_usd"] as number | undefined;
    const result = (msg["result"] as string | undefined)?.trim();

    console.log("\n" + chalk.gray("─".repeat(60)));

    if (subtype === "success") {
      console.log(
        chalk.green("✓ DONE") +
          (durationMs !== undefined
            ? chalk.gray(` (${(durationMs / 1000).toFixed(1)}s)`)
            : "") +
          (cost !== undefined ? chalk.gray(` · $${cost.toFixed(4)}`) : "")
      );
      if (result) {
        console.log(chalk.white(`\n${result}`));
      }
    } else {
      const errors = msg["errors"] as string[] | undefined;
      console.log(chalk.red(`✗ FAILED: ${subtype}`));
      if (errors?.length) {
        for (const err of errors) {
          console.log(chalk.red(`  ${err}`));
        }
      }
    }

    console.log(chalk.gray("─".repeat(60)));
  }
}

export function printBanner(): void {
  console.log(chalk.cyan("\n╔══════════════════════════════════════════╗"));
  console.log(chalk.cyan("║") + chalk.white("       Claude Multi-Agent Dev Team        ") + chalk.cyan("║"));
  console.log(chalk.cyan("╚══════════════════════════════════════════╝"));
  console.log(chalk.gray("  Powered by @anthropic-ai/claude-agent-sdk\n"));
  console.log(chalk.gray("  Agents:"));
  console.log(chalk.cyan("    [PROJECT-MANAGER]") + chalk.gray(" — Plans & coordinates"));
  console.log(chalk.blue("    [ARCHITECT]      ") + chalk.gray(" — Designs structure"));
  console.log(chalk.green("    [DEVELOPER]      ") + chalk.gray(" — Implements code"));
  console.log(chalk.yellow("    [QA-ENGINEER]    ") + chalk.gray(" — Verifies quality"));
  console.log();
  console.log(chalk.gray("  Commands:"));
  console.log(chalk.white("    <task>") + chalk.gray("  — Submit a task to the team"));
  console.log(chalk.white("    /new  ") + chalk.gray("  — Start a fresh session"));
  console.log(chalk.white("    /quit ") + chalk.gray("  — Exit"));
  console.log(chalk.gray("─".repeat(46)));
}
