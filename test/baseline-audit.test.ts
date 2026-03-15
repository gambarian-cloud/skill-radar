import assert from "node:assert/strict";
import test from "node:test";

import { renderBaselineAuditReport, type BaselineAuditResult } from "../src/audit/baseline-audit.ts";

test("renderBaselineAuditReport summarizes baseline state clearly", () => {
  const result: BaselineAuditResult = {
    generatedAt: "2026-03-08T20:00:00.000Z",
    machineTimeZone: "Asia/Jerusalem",
    summary: {
      adoptNowChecks: 10,
      ok: 8,
      partial: 1,
      missing: 1,
    },
    codexFiles: [
      { label: "C:/Users/MI/.codex/AGENTS.md", status: "ok" },
    ],
    claudeFiles: [
      { label: "C:/Users/MI/.claude/CLAUDE.md", status: "ok" },
      { label: "Claude deny rules for secrets", status: "partial", detail: "missing: Read(./secrets/**)" },
    ],
    projectFiles: [
      { label: ".claude/settings.json", status: "ok" },
      { label: "Claude stop hook", status: "ok", detail: "project-scoped stop verification" },
    ],
    codexSkills: [
      { label: "model-routing", status: "ok", detail: "C:/Users/MI/.codex/skills/model-routing/SKILL.md" },
    ],
    claudeSkills: [
      { label: "systematic-debugging", status: "ok", detail: "C:/Users/MI/.claude/skills/systematic-debugging/SKILL.md" },
    ],
    mcp: [
      { label: "Context7 (project)", status: "ok", detail: ".mcp.json" },
      { label: "Sequential Thinking", status: "missing", detail: "Codex user config" },
    ],
    staged: [
      { label: "GitHub MCP", status: "partial", detail: "staged next, not part of first safe wave" },
    ],
    watch: ["formatter hook"],
    reject: ["Filesystem MCP"],
    currentDrift: [
      { label: "Claude deny rules for secrets", status: "partial", detail: "missing: Read(./secrets/**)" },
      { label: "Sequential Thinking", status: "missing", detail: "Codex user config" },
    ],
  };

  const report = renderBaselineAuditReport(result);

  assert.match(report, /# Signal Scout Baseline Audit/);
  assert.match(report, /adopt-now checks: 10/);
  assert.match(report, /## Current Drift/);
  assert.match(report, /current drift/i);
  assert.match(report, /\[partial\] Claude deny rules for secrets/);
  assert.match(report, /\[ok\] Claude stop hook/);
  assert.match(report, /\[missing\] Sequential Thinking/);
  assert.match(report, /GitHub MCP/);
  assert.match(report, /formatter hook/);
  assert.match(report, /Filesystem MCP/);
});
