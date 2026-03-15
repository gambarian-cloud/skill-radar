import { readdir } from "node:fs/promises";

import { REDDIT_RETUNE_POLICIES, SOURCE_RETUNE_CHECKS } from "../config/source-retune-policy.ts";
import { readJsonFile } from "../lib/file-system.ts";

interface SourceAuditSnapshotSourceHealth {
  sourceId: string;
  sourceLabel: string;
  fetched: number;
  kept: number;
  actionable: number;
  ignored: number;
  freshnessHours?: number;
  cadenceClass?: string;
}

interface SourceAuditSnapshotRedditTarget {
  subreddit: string;
  fetched: number;
  kept: number;
  actionable: number;
  ignored: number;
  artifactBacked: number;
  discussionOnly: number;
  originConfirmed?: number;
  scoutOverlap?: number;
  watchlistRepoEvidence?: number;
}

interface SourceAuditSnapshotRun {
  profileId: string;
  profileLabel: string;
  runMode: string;
  sourceFilter?: string;
  windowStart: string;
  windowEnd: string;
  kept?: number;
  actionable?: number;
  ignored?: number;
  error?: string;
  sourceHealth?: SourceAuditSnapshotSourceHealth[];
  redditTargets?: SourceAuditSnapshotRedditTarget[];
}

interface SourceAuditSnapshot {
  generatedAt: string;
  reportDate: string;
  windowHours: number[];
  runs: SourceAuditSnapshotRun[];
}

interface RedditTrendSummary {
  subreddit: string;
  cyclesSeen: number;
  keptTotal: number;
  actionableTotal: number;
  artifactBackedTotal: number;
  discussionOnlyTotal: number;
  originConfirmedTotal: number;
  scoutOverlapTotal: number;
  watchlistRepoEvidenceTotal: number;
}

type RetuneReadStatus = "core" | "probation" | "short-probation" | "watch" | "demote-ready";

function getWindowHours(run: SourceAuditSnapshotRun): number {
  const start = new Date(run.windowStart).getTime();
  const end = new Date(run.windowEnd).getTime();
  return Math.round((end - start) / (1000 * 60 * 60));
}

function sortSnapshots(snapshots: SourceAuditSnapshot[]): SourceAuditSnapshot[] {
  return [...snapshots].sort((left, right) => left.generatedAt.localeCompare(right.generatedAt));
}

function collapseSnapshotsByReportDate(snapshots: SourceAuditSnapshot[]): SourceAuditSnapshot[] {
  const latestByDate = new Map<string, SourceAuditSnapshot>();

  for (const snapshot of sortSnapshots(snapshots)) {
    latestByDate.set(snapshot.reportDate, snapshot);
  }

  return sortSnapshots([...latestByDate.values()]);
}

function buildSourceTrendLines(snapshots: SourceAuditSnapshot[]): string[] {
  const latest = snapshots.at(-1);
  if (!latest) {
    return ["- none"];
  }

  const latest24hRuns = latest.runs.filter((run) => getWindowHours(run) === 24 && run.sourceFilter);

  return latest24hRuns.map((run) => {
    const lastThree = snapshots
      .map((snapshot) =>
        snapshot.runs.find((candidate) => candidate.profileId === run.profileId && getWindowHours(candidate) === 24),
      )
      .filter((candidate): candidate is SourceAuditSnapshotRun => Boolean(candidate))
      .slice(-3);
    const actionableSeries = lastThree.map((candidate) => candidate.actionable ?? 0);
    const latestActionable = actionableSeries.at(-1) ?? 0;
    const previousAverage = actionableSeries.length > 1
      ? actionableSeries.slice(0, -1).reduce((sum, value) => sum + value, 0) / (actionableSeries.length - 1)
      : latestActionable;
    const drift = latestActionable - previousAverage;
    const driftLabel = drift > 0.5 ? "up" : drift < -0.5 ? "down" : "flat";

    return `- ${run.profileLabel}: latest 24h actionable ${latestActionable}; 3-cycle drift ${driftLabel}`;
  });
}

function buildRedditTrendSummaries(snapshots: SourceAuditSnapshot[]): RedditTrendSummary[] {
  const grouped = new Map<string, RedditTrendSummary>();

  for (const snapshot of snapshots) {
    const redditRun = snapshot.runs.find((run) => run.profileId === "reddit-live" && getWindowHours(run) === 24);
    if (!redditRun?.redditTargets) {
      continue;
    }

    for (const target of redditRun.redditTargets) {
      const existing = grouped.get(target.subreddit) ?? {
        subreddit: target.subreddit,
        cyclesSeen: 0,
        keptTotal: 0,
        actionableTotal: 0,
        artifactBackedTotal: 0,
        discussionOnlyTotal: 0,
        originConfirmedTotal: 0,
        scoutOverlapTotal: 0,
        watchlistRepoEvidenceTotal: 0,
      };
      existing.cyclesSeen += 1;
      existing.keptTotal += target.kept;
      existing.actionableTotal += target.actionable;
      existing.artifactBackedTotal += target.artifactBacked;
      existing.discussionOnlyTotal += target.discussionOnly;
      existing.originConfirmedTotal += target.originConfirmed ?? 0;
      existing.scoutOverlapTotal += target.scoutOverlap ?? 0;
      existing.watchlistRepoEvidenceTotal += target.watchlistRepoEvidence ?? 0;
      grouped.set(target.subreddit, existing);
    }
  }

  return [...grouped.values()].sort((left, right) => {
    const actionableDelta = right.actionableTotal - left.actionableTotal;
    if (actionableDelta !== 0) {
      return actionableDelta;
    }

    return left.subreddit.localeCompare(right.subreddit);
  });
}

function renderRedditTrendLines(snapshots: SourceAuditSnapshot[]): string[] {
  const summaries = buildRedditTrendSummaries(snapshots);
  if (summaries.length === 0) {
    return ["- none"];
  }

  return summaries.map((summary) => {
    const discussionRatio = summary.actionableTotal + (summary.discussionOnlyTotal - summary.actionableTotal) > 0
      ? summary.discussionOnlyTotal / Math.max(summary.discussionOnlyTotal, summary.artifactBackedTotal + summary.discussionOnlyTotal)
      : 0;
    const ratioLabel = `${Math.round(discussionRatio * 100)}% discussion-only`;
    return `- r/${summary.subreddit}: ${summary.cyclesSeen} cycle(s), ${summary.actionableTotal} actionable total, ${summary.artifactBackedTotal} artifact-backed total, ${ratioLabel}`;
  });
}

function renderRedditScorecard(snapshots: SourceAuditSnapshot[]): string {
  const summaries = buildRedditTrendSummaries(snapshots);
  if (summaries.length === 0) {
    return "| Subreddit | Cycles | Kept | Actionable | Hit Rate | Artifact | Discussion | Origin Confirmed | Scout Overlap | Watchlist Evidence |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n| none | 0 | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0 |";
  }

  const header = "| Subreddit | Cycles | Kept | Actionable | Hit Rate | Artifact | Discussion | Origin Confirmed | Scout Overlap | Watchlist Evidence |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|";
  const rows = summaries.map((summary) => {
    const hitRate = summary.keptTotal > 0 ? Math.round((summary.actionableTotal / summary.keptTotal) * 100) : 0;
    return `| r/${summary.subreddit} | ${summary.cyclesSeen} | ${summary.keptTotal} | ${summary.actionableTotal} | ${hitRate}% | ${summary.artifactBackedTotal} | ${summary.discussionOnlyTotal} | ${summary.originConfirmedTotal} | ${summary.scoutOverlapTotal} | ${summary.watchlistRepoEvidenceTotal} |`;
  });

  return [header, ...rows].join("\n");
}

function resolveRedditRetuneStatus(
  baselineStatus: RetuneReadStatus,
  summary: RedditTrendSummary,
  policyCycles: number,
  metricValue: number,
  successThreshold: number,
): RetuneReadStatus {
  if (summary.cyclesSeen >= policyCycles && metricValue < successThreshold) {
    return "demote-ready";
  }

  return baselineStatus;
}

function renderRetuneStatusRead(snapshots: SourceAuditSnapshot[]): string {
  const summaries = buildRedditTrendSummaries(snapshots);
  const summaryMap = new Map(summaries.map((summary) => [summary.subreddit, summary]));
  const lines: string[] = [];

  for (const policy of REDDIT_RETUNE_POLICIES) {
    const summary = summaryMap.get(policy.subreddit);

    if (!summary) {
      if (policy.baselineStatus === "core") {
        lines.push(`- ${policy.label}: core; keep even if the current window is quiet because it is directly relevant.`);
      } else {
        lines.push(`- ${policy.label}: ${policy.baselineStatus}; no scored cycles yet, so keep measuring before acting.`);
      }
      continue;
    }

    if (policy.baselineStatus === "core") {
      lines.push(`- ${policy.label}: core; ${summary.cyclesSeen} cycle(s) seen, ${summary.actionableTotal} actionable total, ${summary.artifactBackedTotal} artifact-backed total; ${policy.keepReason}.`);
      continue;
    }

    const cyclesTarget = policy.maxCycles ?? 0;
    const cyclesLeft = Math.max(cyclesTarget - summary.cyclesSeen, 0);
    let metricValue = 0;
    let metricLabel = "signal";

    switch (policy.successMetric) {
      case "artifact-backed":
        metricValue = summary.artifactBackedTotal;
        metricLabel = "artifact-backed";
        break;
      case "watchlist-evidence":
        metricValue = summary.watchlistRepoEvidenceTotal;
        metricLabel = "watchlist evidence";
        break;
      case "actionable":
        metricValue = summary.actionableTotal;
        metricLabel = "actionable";
        break;
      default:
        metricValue = summary.actionableTotal;
        metricLabel = "actionable";
        break;
    }

    const threshold = policy.successThreshold ?? 1;
    const status = resolveRedditRetuneStatus(policy.baselineStatus, summary, cyclesTarget, metricValue, threshold);
    const needText = metricValue >= threshold
      ? `already met success bar with ${metricValue} ${metricLabel}`
      : `needs ${threshold}+ ${metricLabel} by cycle ${cyclesTarget}`;

    lines.push(`- ${policy.label}: ${status}; ${summary.cyclesSeen}/${cyclesTarget} cycle(s), ${summary.actionableTotal} actionable, ${summary.artifactBackedTotal} artifact-backed, ${summary.watchlistRepoEvidenceTotal} watchlist evidence; ${needText}${status === "demote-ready" ? " and is ready for manual demotion review." : cyclesLeft > 0 ? `; ${cyclesLeft} cycle(s) left.` : "."}`);
  }

  const latest = snapshots.at(-1);
  if (latest) {
    const latest24hRuns = latest.runs.filter((run) => getWindowHours(run) === 24 && run.sourceFilter);
    for (const check of SOURCE_RETUNE_CHECKS) {
      const run = latest24hRuns.find((candidate) => candidate.profileId === check.profileId);
      const actionable = run?.actionable ?? 0;
      lines.push(`- ${check.label}: ${check.baselineStatus}; latest 24h actionable ${actionable}; ${check.condition}${check.deadline ? ` by ${check.deadline}` : ""}.`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : "- none";
}

export async function loadSourceAuditSnapshots(historyDir: string): Promise<SourceAuditSnapshot[]> {
  const entries = await readdir(historyDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith("-source-audit.json"))
    .map((entry) => `${historyDir}/${entry.name}`);

  const snapshots = await Promise.all(files.map((path) => readJsonFile<SourceAuditSnapshot>(path)));
  return sortSnapshots(snapshots);
}

export function renderSourceAuditHistoryReport(
  snapshots: SourceAuditSnapshot[],
  generatedAt: Date,
): string {
  const distinctSnapshots = collapseSnapshotsByReportDate(snapshots);
  const latest = distinctSnapshots.at(-1);
  const latestDate = latest?.reportDate ?? "unknown";

  return `# Signal Scout Source Audit History

Generated: ${generatedAt.toISOString()}
Snapshots loaded: ${snapshots.length}
Distinct report dates: ${distinctSnapshots.length}
Latest report date: ${latestDate}

## Why This Report Exists

This report turns individual source-audit snapshots into trend reads, so we can make keep/drop decisions from data instead of memory.

Only the latest snapshot for each report date counts toward cycle-based decisions. Re-runs on the same day update the day, but do not create fake extra cycles.

## Source Trend Read

${buildSourceTrendLines(distinctSnapshots).join("\n")}

## Reddit Target Trend Read

${renderRedditTrendLines(distinctSnapshots).join("\n")}

## Reddit Cumulative Scorecard

${renderRedditScorecard(distinctSnapshots)}

## Retune Status Read

${renderRetuneStatusRead(distinctSnapshots)}
`;
}
