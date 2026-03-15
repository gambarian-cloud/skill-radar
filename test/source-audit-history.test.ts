import assert from "node:assert/strict";
import test from "node:test";

import { renderSourceAuditHistoryReport } from "../src/audit/source-audit-history.ts";

test("renderSourceAuditHistoryReport summarizes source and reddit trends", () => {
  const report = renderSourceAuditHistoryReport(
    [
      {
        generatedAt: "2026-03-09T10:00:00.000Z",
        reportDate: "2026-03-09",
        windowHours: [24, 72],
        runs: [
          {
            profileId: "reddit-live",
            profileLabel: "Reddit Live Only",
            runMode: "live",
            sourceFilter: "reddit-agent-watchlist",
            windowStart: "2026-03-08T10:00:00.000Z",
            windowEnd: "2026-03-09T10:00:00.000Z",
            kept: 4,
            actionable: 2,
            ignored: 2,
            redditTargets: [
              {
                subreddit: "ClaudeAI",
                fetched: 8,
                kept: 1,
                actionable: 1,
                ignored: 0,
                artifactBacked: 1,
                discussionOnly: 0,
                originConfirmed: 1,
                scoutOverlap: 0,
                watchlistRepoEvidence: 1,
              },
            ],
          },
        ],
      },
      {
        generatedAt: "2026-03-10T10:00:00.000Z",
        reportDate: "2026-03-10",
        windowHours: [24, 72],
        runs: [
          {
            profileId: "reddit-live",
            profileLabel: "Reddit Live Only",
            runMode: "live",
            sourceFilter: "reddit-agent-watchlist",
            windowStart: "2026-03-09T10:00:00.000Z",
            windowEnd: "2026-03-10T10:00:00.000Z",
            kept: 6,
            actionable: 3,
            ignored: 3,
            redditTargets: [
              {
                subreddit: "ClaudeAI",
                fetched: 8,
                kept: 1,
                actionable: 1,
                ignored: 0,
                artifactBacked: 1,
                discussionOnly: 0,
                originConfirmed: 1,
                scoutOverlap: 0,
                watchlistRepoEvidence: 1,
              },
              {
                subreddit: "LLMDevs",
                fetched: 8,
                kept: 2,
                actionable: 1,
                ignored: 1,
                artifactBacked: 0,
                discussionOnly: 2,
                originConfirmed: 0,
                scoutOverlap: 0,
                watchlistRepoEvidence: 0,
              },
            ],
          },
        ],
      },
    ],
    new Date("2026-03-10T12:00:00.000Z"),
  );

  assert.match(report, /# Signal Scout Source Audit History/);
  assert.match(report, /Snapshots loaded: 2/);
  assert.match(report, /Distinct report dates: 2/);
  assert.match(report, /Reddit Live Only: latest 24h actionable 3; 3-cycle drift up/);
  assert.match(report, /r\/ClaudeAI: 2 cycle\(s\), 2 actionable total, 2 artifact-backed total, 0% discussion-only/);
  assert.match(report, /r\/LLMDevs: 1 cycle\(s\), 1 actionable total, 0 artifact-backed total, 100% discussion-only/);
  assert.match(report, /\| r\/ClaudeAI \| 2 \| 2 \| 2 \| 100% \| 2 \| 0 \| 2 \| 0 \| 2 \|/);
  assert.match(report, /\| r\/LLMDevs \| 1 \| 2 \| 1 \| 50% \| 0 \| 2 \| 0 \| 0 \| 0 \|/);
  assert.match(report, /## Retune Status Read/);
  assert.match(report, /r\/ClaudeAI: core; 2 cycle\(s\) seen, 2 actionable total, 2 artifact-backed total/);
  assert.match(report, /r\/LLMDevs: probation; 1\/5 cycle\(s\), 1 actionable, 0 artifact-backed, 0 watchlist evidence; needs 1\+ artifact-backed by cycle 5; 4 cycle\(s\) left\./);
  assert.match(report, /r\/ChatGPTCoding: short-probation; no scored cycles yet, so keep measuring before acting\./);
  assert.match(report, /Telegram Pavlenko Only: watch; latest 24h actionable 0; disable if actionable stays at 0 by the deadline by 2026-03-15\./);
});
