import { access, readFile } from "node:fs/promises";

import {
  ADOPT_NOW_CLAUDE_FILES,
  ADOPT_NOW_CLAUDE_SKILLS,
  ADOPT_NOW_CODEX_FILES,
  ADOPT_NOW_CODEX_SKILLS,
  ADOPT_NOW_MCP,
  ADOPT_NOW_PROJECT_FILES,
  REJECT_ITEMS,
  STAGE_NEXT_MCP,
  WATCH_ITEMS,
  type BaselineSkillTarget,
} from "../config/agent-baseline.ts";
import { readJsonFile } from "../lib/file-system.ts";
import { getLocalTimeZone } from "../lib/time.ts";

type AuditStatus = "ok" | "missing" | "partial";

interface AuditCheck {
  label: string;
  status: AuditStatus;
  detail?: string;
}

export interface BaselineAuditResult {
  generatedAt: string;
  machineTimeZone: string;
  summary: {
    adoptNowChecks: number;
    ok: number;
    missing: number;
    partial: number;
  };
  codexFiles: AuditCheck[];
  claudeFiles: AuditCheck[];
  projectFiles: AuditCheck[];
  codexSkills: AuditCheck[];
  claudeSkills: AuditCheck[];
  mcp: AuditCheck[];
  staged: AuditCheck[];
  watch: string[];
  reject: string[];
  currentDrift: AuditCheck[];
}

interface ClaudeSettingsShape {
  permissions?: {
    deny?: string[];
  };
}

interface ProjectMcpShape {
  mcpServers?: Record<string, {
    command?: string;
    args?: string[];
    type?: string;
    url?: string;
    headers?: Record<string, string>;
  }>;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(path: string): Promise<string | undefined> {
  if (!(await fileExists(path))) {
    return undefined;
  }

  return readFile(path, "utf8");
}

function buildPathChecks(paths: readonly string[]): Promise<AuditCheck[]> {
  return Promise.all(paths.map(async (path) => ({
    label: path,
    status: (await fileExists(path)) ? "ok" : "missing",
  })));
}

function buildSkillChecks(skills: readonly BaselineSkillTarget[]): Promise<AuditCheck[]> {
  return Promise.all(skills.map(async (skill) => ({
    label: skill.name,
    status: (await fileExists(skill.path)) ? "ok" : "missing",
    detail: skill.path,
  })));
}

function checkClaudeSecretDenyRules(settings: ClaudeSettingsShape | undefined): AuditCheck {
  const denies = settings?.permissions?.deny ?? [];
  const required = [
    "Read(./.env)",
    "Read(./.env.*)",
    "Read(./secrets/**)",
    "Read(C:/Users/MI/.ssh/**)",
    "Read(C:/Users/MI/.aws/**)",
  ];
  const missing = required.filter((rule) => !denies.includes(rule));

  if (missing.length === 0) {
    return {
      label: "Claude deny rules for secrets",
      status: "ok",
    };
  }

  return {
    label: "Claude deny rules for secrets",
    status: denies.length > 0 ? "partial" : "missing",
    detail: `missing: ${missing.join(", ")}`,
  };
}

function checkCodexMcpConfig(configText: string | undefined, serverId: string, label: string): AuditCheck {
  if (!configText) {
    return {
      label,
      status: "missing",
      detail: "C:/Users/MI/.codex/config.toml not found",
    };
  }

  const normalizedId = serverId.replace(/-/gu, "_");
  const section = `[mcp_servers.${normalizedId}]`;
  const hasSection = configText.includes(section);

  if (!hasSection) {
    return {
      label,
      status: "missing",
      detail: "Codex user config",
    };
  }

  if (serverId === "github") {
    const hasTokenBinding = configText.includes('bearer_token_env_var = "GITHUB_PERSONAL_ACCESS_TOKEN"');
    const hasReadonly = configText.includes('"X-MCP-Readonly" = "true"');

    if (hasTokenBinding && hasReadonly) {
      return {
        label,
        status: "ok",
        detail: "Codex user config",
      };
    }

    return {
      label,
      status: "partial",
      detail: "GitHub MCP exists but is missing read-only or token binding",
    };
  }

  return {
    label,
    status: "ok",
    detail: "Codex user config",
  };
}

function checkCodexStatusLine(configText: string | undefined): AuditCheck {
  if (!configText) {
    return {
      label: "Codex TUI status line",
      status: "missing",
      detail: "C:/Users/MI/.codex/config.toml not found",
    };
  }

  const hasTuiSection = configText.includes("[tui]");
  const hasStatusLine = configText.includes("status_line");
  const hasModel = configText.includes("\"model-name\"");
  const hasContext = configText.includes("\"context-remaining\"");
  const hasTokens = configText.includes("\"used-tokens\"");
  const hasBranch = configText.includes("\"git-branch\"");
  const hasDir = configText.includes("\"current-dir\"");

  if (hasTuiSection && hasStatusLine && hasModel && hasContext && hasTokens && hasBranch && hasDir) {
    return {
      label: "Codex TUI status line",
      status: "ok",
      detail: "C:/Users/MI/.codex/config.toml",
    };
  }

  if (hasTuiSection || hasStatusLine) {
    return {
      label: "Codex TUI status line",
      status: "partial",
      detail: "status line is configured incompletely",
    };
  }

  return {
    label: "Codex TUI status line",
    status: "missing",
    detail: "display-only visibility for model, context, tokens, branch, and dir",
  };
}

function checkProjectMcpConfig(projectMcp: ProjectMcpShape | undefined, serverId: string, label: string): AuditCheck {
  if (!projectMcp?.mcpServers) {
    return {
      label: `${label} (project)`,
      status: "missing",
      detail: ".mcp.json missing or invalid",
    };
  }

  const server = projectMcp.mcpServers[serverId];
  if (!server) {
    return {
      label: `${label} (project)`,
      status: "missing",
      detail: ".mcp.json",
    };
  }

  if (serverId === "github") {
    const hasHttp = server.type === "http";
    const hasUrl = server.url === "https://api.githubcopilot.com/mcp/";
    const hasReadonly = server.headers?.["X-MCP-Readonly"] === "true";
    const hasTokenBinding = server.headers?.Authorization === "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}";

    if (hasHttp && hasUrl && hasReadonly && hasTokenBinding) {
      return {
        label: `${label} (project)`,
        status: "ok",
        detail: ".mcp.json",
      };
    }

    return {
      label: `${label} (project)`,
      status: "partial",
      detail: "GitHub MCP exists but is missing read-only or token binding",
    };
  }

  return {
    label: `${label} (project)`,
    status: "ok",
    detail: ".mcp.json",
  };
}

function checkClaudeStopHook(settingsText: string | undefined, hookScriptExists: boolean): AuditCheck {
  if (!settingsText) {
    return {
      label: "Claude stop hook",
      status: "missing",
      detail: ".claude/settings.json missing",
    };
  }

  const hasStop = settingsText.includes("\"Stop\"") && settingsText.includes("stop-verify.ps1");

  if (hasStop && hookScriptExists) {
    return {
      label: "Claude stop hook",
      status: "ok",
      detail: "project-scoped stop verification",
    };
  }

  if (hasStop || hookScriptExists) {
    return {
      label: "Claude stop hook",
      status: "partial",
      detail: "hook config or script is incomplete",
    };
  }

  return {
    label: "Claude stop hook",
    status: "missing",
    detail: "project-scoped stop verification",
  };
}

function buildStageChecks(): AuditCheck[] {
  return STAGE_NEXT_MCP.map((item) => ({
    label: item.label,
    status: "partial",
    detail: "staged next, not part of first safe wave",
  }));
}

function collectCurrentDrift(checkGroups: AuditCheck[][]): AuditCheck[] {
  return checkGroups
    .flat()
    .filter((check) => check.status !== "ok");
}

function summarize(checkGroups: AuditCheck[][]): BaselineAuditResult["summary"] {
  const allChecks = checkGroups.flat();
  return {
    adoptNowChecks: allChecks.length,
    ok: allChecks.filter((check) => check.status === "ok").length,
    missing: allChecks.filter((check) => check.status === "missing").length,
    partial: allChecks.filter((check) => check.status === "partial").length,
  };
}

export async function runBaselineAudit(): Promise<BaselineAuditResult> {
  const [codexFiles, claudeFiles, projectFiles, codexSkills, claudeSkills] = await Promise.all([
    buildPathChecks(ADOPT_NOW_CODEX_FILES),
    buildPathChecks(ADOPT_NOW_CLAUDE_FILES),
    buildPathChecks(ADOPT_NOW_PROJECT_FILES),
    buildSkillChecks(ADOPT_NOW_CODEX_SKILLS),
    buildSkillChecks(ADOPT_NOW_CLAUDE_SKILLS),
  ]);

  const claudeSettingsPath = "C:/Users/MI/.claude/settings.json";
  const projectClaudeSettingsPath = ".claude/settings.json";
  const projectMcpPath = ".mcp.json";
  const codexConfigPath = "C:/Users/MI/.codex/config.toml";
  const stopHookPath = ".claude/hooks/stop-verify.ps1";

  const [claudeSettings, projectMcp, codexConfigText, projectClaudeSettingsText, stopHookExists] = await Promise.all([
    fileExists(claudeSettingsPath) ? readJsonFile<ClaudeSettingsShape>(claudeSettingsPath) : Promise.resolve(undefined),
    fileExists(projectMcpPath) ? readJsonFile<ProjectMcpShape>(projectMcpPath) : Promise.resolve(undefined),
    readTextIfExists(codexConfigPath),
    readTextIfExists(projectClaudeSettingsPath),
    fileExists(stopHookPath),
  ]);

  const mcpChecks: AuditCheck[] = [];
  for (const item of ADOPT_NOW_MCP) {
    mcpChecks.push(checkProjectMcpConfig(projectMcp, item.id, item.label));
    mcpChecks.push(checkCodexMcpConfig(codexConfigText, item.id, item.label));
  }

  const codexVisibilityChecks: AuditCheck[] = [
    checkCodexStatusLine(codexConfigText),
  ];

  const policyChecks: AuditCheck[] = [
    checkClaudeSecretDenyRules(claudeSettings),
    checkClaudeStopHook(projectClaudeSettingsText, stopHookExists),
  ];

  const adoptNowCheckGroups = [
    codexFiles,
    codexVisibilityChecks,
    claudeFiles,
    projectFiles,
    codexSkills,
    claudeSkills,
    mcpChecks,
    policyChecks,
  ];

  return {
    generatedAt: new Date().toISOString(),
    machineTimeZone: getLocalTimeZone(),
    summary: summarize(adoptNowCheckGroups),
    codexFiles: [...codexFiles, ...codexVisibilityChecks],
    claudeFiles: [...claudeFiles, checkClaudeSecretDenyRules(claudeSettings)],
    projectFiles: [...projectFiles, checkClaudeStopHook(projectClaudeSettingsText, stopHookExists)],
    codexSkills,
    claudeSkills,
    mcp: mcpChecks,
    staged: buildStageChecks(),
    watch: [...WATCH_ITEMS],
    reject: [...REJECT_ITEMS],
    currentDrift: collectCurrentDrift(adoptNowCheckGroups),
  };
}

function renderChecks(checks: AuditCheck[]): string {
  if (checks.length === 0) {
    return "- none";
  }

  return checks
    .map((check) => `- [${check.status}] ${check.label}${check.detail ? ` - ${check.detail}` : ""}`)
    .join("\n");
}

export function renderBaselineAuditReport(result: BaselineAuditResult): string {
  return `# Signal Scout Baseline Audit

Generated: ${result.generatedAt}
Local time zone: ${result.machineTimeZone}

## Summary

- adopt-now checks: ${result.summary.adoptNowChecks}
- ok: ${result.summary.ok}
- partial: ${result.summary.partial}
- missing: ${result.summary.missing}

## Current Drift

${result.currentDrift.length === 0
    ? "- none; current machine matches the adopt-now baseline"
    : renderChecks(result.currentDrift)}

## Codex User-Level Baseline

${renderChecks(result.codexFiles)}

## Claude User-Level Baseline

${renderChecks(result.claudeFiles)}

## Project-Level Baseline

${renderChecks(result.projectFiles)}

## Codex Personal Skills

${renderChecks(result.codexSkills)}

## Claude Personal Skills

${renderChecks(result.claudeSkills)}

## Adopt-Now MCP Baseline

${renderChecks(result.mcp)}

## Stage Next

${renderChecks(result.staged)}

## Watch

${result.watch.map((item) => `- ${item}`).join("\n")}

## Reject For Now

${result.reject.map((item) => `- ${item}`).join("\n")}

## Operator Note

- fresh Claude and Codex sessions may be required before new hook or MCP changes become visible
- use this report to check whether a machine matches the current stable baseline before adding more tools
`;
}
