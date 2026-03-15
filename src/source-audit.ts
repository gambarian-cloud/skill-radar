import { renderSourceAuditReport, runSourceAudit, DEFAULT_SOURCE_AUDIT_PROFILES } from "./audit/source-audit.ts";
import { loadSourceAuditSnapshots, renderSourceAuditHistoryReport } from "./audit/source-audit-history.ts";
import { loadEnvFiles } from "./lib/env.ts";
import { writeJsonFile, writeTextFile } from "./lib/file-system.ts";
import { parseRunDate, formatReportDate } from "./lib/time.ts";
import { getPostEvidenceFlags } from "./analysis/action-quality.ts";
import type { DailyDigestResult } from "./types.ts";

interface CliOptions {
  date?: string;
  windowHours: number[];
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
  sourceHealth?: Array<{
    sourceId: string;
    sourceLabel: string;
    fetched: number;
    kept: number;
    actionable: number;
    ignored: number;
    freshnessHours?: number;
    cadenceClass?: string;
  }>;
  redditTargets?: Array<{
    subreddit: string;
    fetched: number;
    kept: number;
    actionable: number;
    ignored: number;
    artifactBacked: number;
    discussionOnly: number;
    originConfirmed: number;
    scoutOverlap: number;
    watchlistRepoEvidence: number;
  }>;
  error?: string;
}

interface SourceAuditSnapshot {
  generatedAt: string;
  reportDate: string;
  windowHours: number[];
  runs: SourceAuditSnapshotRun[];
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    windowHours: [24, 72],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--date" && next) {
      options.date = next;
      index += 1;
      continue;
    }

    if (arg === "--window-hours" && next) {
      options.windowHours = next
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);
      index += 1;
      continue;
    }
  }

  return options;
}

function formatSnapshotStamp(date: Date): string {
  return date.toISOString().replace(/:/gu, "-");
}

function buildRedditTargetSnapshot(digest: DailyDigestResult): SourceAuditSnapshotRun["redditTargets"] {
  const fetchedBySubreddit = new Map<string, number>();

  for (const note of digest.notes) {
    if (note.sourceId !== "reddit-agent-watchlist") {
      continue;
    }

    const match = note.message.match(/^Fetched (\d+) Reddit post\(s\) from r\/([^;]+); kept (\d+) after scout filtering\.$/u);
    if (!match) {
      continue;
    }

    const [, fetched, subreddit] = match;
    fetchedBySubreddit.set(subreddit, Number(fetched));
  }

  const grouped = new Map<string, NonNullable<SourceAuditSnapshotRun["redditTargets"]>[number]>();

  for (const post of digest.posts) {
    if (post.sourceId !== "reddit-agent-watchlist") {
      continue;
    }

    const subreddit = typeof post.metadata?.subreddit === "string" ? post.metadata.subreddit : "unknown";
    const flags = getPostEvidenceFlags(post, digest.crossLinks);
    const bucket = grouped.get(subreddit) ?? {
      subreddit,
      fetched: fetchedBySubreddit.get(subreddit) ?? 0,
      kept: 0,
      actionable: 0,
      ignored: 0,
      artifactBacked: 0,
      discussionOnly: 0,
      originConfirmed: 0,
      scoutOverlap: 0,
      watchlistRepoEvidence: 0,
    };

    bucket.kept += 1;
    if (post.analysis.decision === "ignore") {
      bucket.ignored += 1;
    } else {
      bucket.actionable += 1;
    }
    if (flags.hasArtifactEvidence) {
      bucket.artifactBacked += 1;
    }
    if (flags.isDiscussionOnly) {
      bucket.discussionOnly += 1;
    }
    if (flags.hasOriginConfirmation) {
      bucket.originConfirmed += 1;
    }
    if (flags.hasScoutCorroboration) {
      bucket.scoutOverlap += 1;
    }
    if (flags.hasWatchlistRepoEvidence) {
      bucket.watchlistRepoEvidence += 1;
    }

    grouped.set(subreddit, bucket);
  }

  for (const [subreddit, fetched] of fetchedBySubreddit.entries()) {
    if (!grouped.has(subreddit)) {
      grouped.set(subreddit, {
        subreddit,
        fetched,
        kept: 0,
        actionable: 0,
        ignored: 0,
        artifactBacked: 0,
        discussionOnly: 0,
        originConfirmed: 0,
        scoutOverlap: 0,
        watchlistRepoEvidence: 0,
      });
    }
  }

  return [...grouped.values()].sort((left, right) => left.subreddit.localeCompare(right.subreddit));
}

function buildSnapshot(reportDate: string, windowHours: number[], runs: Awaited<ReturnType<typeof runSourceAudit>>): SourceAuditSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    reportDate,
    windowHours,
    runs: runs.map((run) => ({
      profileId: run.profile.id,
      profileLabel: run.profile.label,
      runMode: run.profile.runMode,
      sourceFilter: run.profile.sourceFilter,
      windowStart: run.window.start.toISOString(),
      windowEnd: run.window.end.toISOString(),
      kept: run.digest?.stats.kept,
      actionable: run.digest?.posts.filter(
        (post) => post.analysis.decision === "use-now" || post.analysis.decision === "save-for-later",
      ).length,
      ignored: run.digest?.posts.filter((post) => post.analysis.decision === "ignore").length,
      sourceHealth: run.digest?.sourceHealth.map((summary) => ({
        sourceId: summary.sourceId,
        sourceLabel: summary.sourceLabel,
        fetched: summary.fetched,
        kept: summary.kept,
        actionable: summary.useNow + summary.saveForLater,
        ignored: summary.ignored,
        freshnessHours: summary.freshnessHours,
        cadenceClass: summary.cadenceClass,
      })),
      redditTargets: run.profile.sourceFilter === "reddit-agent-watchlist" && run.digest
        ? buildRedditTargetSnapshot(run.digest)
        : undefined,
      error: run.error,
    })),
  };
}

async function main(): Promise<void> {
  await loadEnvFiles();
  const options = parseArgs(process.argv.slice(2));
  const runDate = parseRunDate(options.date);
  const runs = [];

  for (const windowHours of options.windowHours) {
    const windowRuns = await runSourceAudit(DEFAULT_SOURCE_AUDIT_PROFILES, {
      runDate,
      windowHours,
    });
    runs.push(...windowRuns);
  }

  const reportDate = formatReportDate(runDate);
  const reportPath = `reports/research/${reportDate}-source-audit.md`;
  const snapshotPath = `reports/research/history/${formatSnapshotStamp(runDate)}-source-audit.json`;
  const historyReportPath = `reports/research/${reportDate}-source-audit-history.md`;
  const markdown = renderSourceAuditReport(runs, runDate);
  const snapshot = buildSnapshot(reportDate, options.windowHours, runs);

  await writeTextFile(reportPath, markdown);
  await writeJsonFile(snapshotPath, snapshot);
  const snapshots = await loadSourceAuditSnapshots("reports/research/history");
  const historyMarkdown = renderSourceAuditHistoryReport(snapshots, runDate);
  await writeTextFile(historyReportPath, historyMarkdown);

  console.log(`Signal Scout source audit written to ${reportPath}`);
  console.log(`Signal Scout source audit snapshot written to ${snapshotPath}`);
  console.log(`Signal Scout source audit history written to ${historyReportPath}`);
  console.log(`Profiles processed: ${runs.length}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Signal Scout source audit failed: ${message}`);
  process.exitCode = 1;
});
