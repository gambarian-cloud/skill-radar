import assert from "node:assert/strict";
import test from "node:test";

import { renderSourceAuditReport, type SourceAuditRun } from "../src/audit/source-audit.ts";

test("renderSourceAuditReport compares multiple source profiles cleanly", () => {
  const runs: SourceAuditRun[] = [
    {
      profile: {
        id: "auto-mixed",
        label: "Auto Mixed",
        runMode: "auto",
      },
      window: {
        start: new Date("2026-03-06T00:00:00Z"),
        end: new Date("2026-03-07T00:00:00Z"),
      },
      digest: {
        reportPath: "reports/daily/2026-03-07.md",
        reportDate: "2026-03-07",
        stats: {
          totalFetched: 20,
          droppedOutsideWindow: 10,
          droppedNoise: 2,
          droppedDuplicates: 1,
          kept: 7,
        },
        posts: [
          {
            id: "post-1",
            sourceId: "github-agent-watchlist",
            sourceLabel: "GitHub Agent Watchlist",
            sourceKind: "github",
            sourceTier: "origin",
            sourcePriority: 1,
            externalId: "post-1",
            text: "text",
            shortSummary: "summary",
            dedupeKey: "dedupe-1",
            publishedAt: "2026-03-07T00:00:00Z",
            metadata: {
              repoFullName: "openai/skills",
            },
            analysis: {
              topic: "Reusable agent skills and workflow design",
              decision: "use-now",
              theme: "agent-workflow",
              relevanceScore: 90,
              baseRelevanceScore: 90,
              crossSourceAdjustment: 0,
              crossSourceNotes: [],
              scoreAdjustment: 0,
              whyItMatters: "Useful",
              suggestedNextAction: "Review it.",
              project: "Volcker Copilot",
              urgency: "today",
              matchedSignals: ["skills"],
              feedbackRuleIds: [],
              feedbackNotes: [],
            },
          },
        ],
        notes: [],
        sourceModes: {
          "github-agent-watchlist": "live",
          "hn-agent-search": "live",
        },
        crossLinks: [],
        sourceHealth: [
          {
            sourceId: "github-agent-watchlist",
            sourceLabel: "GitHub Agent Watchlist",
            sourceTier: "origin",
            modeUsed: "live",
            fetched: 11,
            kept: 4,
            useNow: 2,
            saveForLater: 2,
            ignored: 0,
          },
          {
            sourceId: "hn-agent-search",
            sourceLabel: "Hacker News Agent Search",
            sourceTier: "scout",
            modeUsed: "live",
            fetched: 8,
            kept: 3,
            useNow: 0,
            saveForLater: 0,
            ignored: 3,
          },
        ],
      },
    },
    {
      profile: {
        id: "mock-baseline",
        label: "Mock Baseline",
        runMode: "mock",
      },
      window: {
        start: new Date("2026-03-06T00:00:00Z"),
        end: new Date("2026-03-07T00:00:00Z"),
      },
      digest: {
        reportPath: "reports/daily/2026-03-07.md",
        reportDate: "2026-03-07",
        stats: {
          totalFetched: 15,
          droppedOutsideWindow: 12,
          droppedNoise: 1,
          droppedDuplicates: 0,
          kept: 2,
        },
        posts: [],
        notes: [],
        sourceModes: {
          "github-agent-watchlist": "mock",
        },
        crossLinks: [],
        sourceHealth: [
          {
            sourceId: "github-agent-watchlist",
            sourceLabel: "GitHub Agent Watchlist",
            sourceTier: "origin",
            modeUsed: "mock",
            fetched: 11,
            kept: 0,
            useNow: 0,
            saveForLater: 0,
            ignored: 0,
          },
        ],
      },
    },
    {
      profile: {
        id: "github-live",
        label: "GitHub Live Only",
        runMode: "live",
        sourceFilter: "github-agent-watchlist",
      },
      window: {
        start: new Date("2026-03-06T00:00:00Z"),
        end: new Date("2026-03-07T00:00:00Z"),
      },
      error: "Skipped openai/codex: GitHub repo request failed for openai/codex: 403 rate limit exceeded",
    },
  ];

  const report = renderSourceAuditReport(runs, new Date("2026-03-07T12:00:00Z"));

  assert.match(report, /# Signal Scout Source Audit/);
  assert.match(report, /## Cadence Read/);
  assert.match(report, /GitHub Live Only: cold - 24h 0, 72h 0; no actionable signal in either 24h or 72h/);
  assert.match(report, /### 24h Window/);
  assert.match(report, /### Auto Mixed/);
  assert.match(report, /source modes: github-agent-watchlist=live, hn-agent-search=live/);
  assert.match(report, /action quality: artifact-backed 1, discussion-only 0, corroborated total 0, origin-confirmed 0, scout-overlap 0/);
  assert.match(report, /actionable by source: github-agent-watchlist: 1 actionable \(1 artifact-backed, 0 discussion-only, 0 corroborated total, 0 origin-confirmed, 0 scout-overlap\)/);
  assert.match(report, /corroboration read: no cross-source repo overlap in this window/);
  assert.match(report, /top actionable: openai\/skills/);
  assert.match(report, /github-agent-watchlist: fetched 11, kept 4, actionable 4, ignored 0/);
  assert.match(report, /### Mock Baseline/);
  assert.match(report, /github-agent-watchlist: fetched 11, no surviving posts/);
  assert.match(report, /### GitHub Live Only/);
  assert.match(report, /status: failed/);
  assert.match(report, /rate limit exceeded/i);
});
