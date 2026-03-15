import { buildActionQualitySummary, getPostEvidenceFlags } from "../analysis/action-quality.ts";
import { buildWindow, formatWindowLabel, getLocalTimeZone } from "../lib/time.ts";
import { buildDailyDigest, type RunDailyOptions } from "../pipeline/run-daily.ts";
import type { DailyDigestResult, SourceRunMode, TimeWindow } from "../types.ts";

export interface SourceAuditProfile {
  id: string;
  label: string;
  runMode: SourceRunMode;
  sourceFilter?: string;
}

export interface SourceAuditRun {
  profile: SourceAuditProfile;
  window: TimeWindow;
  digest?: DailyDigestResult;
  error?: string;
}

interface CadenceSummary {
  profileId: string;
  label: string;
  actionable24h?: number;
  actionable72h?: number;
}

interface RedditTargetSummary {
  subreddit: string;
  fetched: number;
  kept: number;
  actionable: number;
  ignored: number;
  artifactBacked: number;
  discussionOnly: number;
}

export const DEFAULT_SOURCE_AUDIT_PROFILES: SourceAuditProfile[] = [
  {
    id: "auto-mixed",
    label: "Auto Mixed",
    runMode: "auto",
  },
  {
    id: "github-live",
    label: "GitHub Live Only",
    runMode: "live",
    sourceFilter: "github-agent-watchlist",
  },
  {
    id: "hn-live",
    label: "HN Live Only",
    runMode: "live",
    sourceFilter: "hn-agent-search",
  },
  {
    id: "reddit-live",
    label: "Reddit Live Only",
    runMode: "live",
    sourceFilter: "reddit-agent-watchlist",
  },
  {
    id: "telegram-vibe-auto",
    label: "Telegram Vibe Only",
    runMode: "auto",
    sourceFilter: "telegram-vibe-coding",
  },
  {
    id: "telegram-llm4dev-auto",
    label: "Telegram LLM4dev Only",
    runMode: "auto",
    sourceFilter: "telegram-llm4dev",
  },
  {
    id: "telegram-pavlenko-auto",
    label: "Telegram Pavlenko Only",
    runMode: "auto",
    sourceFilter: "telegram-pavlenkodev",
  },
  {
    id: "mock-baseline",
    label: "Mock Baseline",
    runMode: "mock",
  },
];

function buildTopActionableItems(digest: DailyDigestResult): string[] {
  return digest.posts
    .filter((post) => post.analysis.decision === "use-now" || post.analysis.decision === "save-for-later")
    .slice(0, 4)
    .map((post) => {
      const repoFullName = typeof post.metadata?.repoFullName === "string" ? post.metadata.repoFullName : undefined;
      return repoFullName ?? post.analysis.topic;
    });
}

function buildRedditTargetSummaries(digest: DailyDigestResult): RedditTargetSummary[] {
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

  const grouped = new Map<string, RedditTargetSummary>();

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
      });
    }
  }

  return [...grouped.values()].sort((left, right) => {
    const actionableDelta = right.actionable - left.actionable;
    if (actionableDelta !== 0) {
      return actionableDelta;
    }

    const keptDelta = right.kept - left.kept;
    if (keptDelta !== 0) {
      return keptDelta;
    }

    return left.subreddit.localeCompare(right.subreddit);
  });
}

function renderRedditTargetBreakdown(digest: DailyDigestResult): string {
  const summaries = buildRedditTargetSummaries(digest);
  if (summaries.length === 0) {
    return "none";
  }

  return summaries
    .map((summary) =>
      `r/${summary.subreddit}: fetched ${summary.fetched}, kept ${summary.kept}, actionable ${summary.actionable}, ignored ${summary.ignored}, artifact-backed ${summary.artifactBacked}, discussion-only ${summary.discussionOnly}`,
    )
    .join("; ");
}

function buildCorroborationRead(digest: DailyDigestResult): string {
  const scoutCorroborationLinks = digest.crossLinks.filter((link) => link.linkType === "scout-corroboration");
  const repoMentionLinks = digest.crossLinks.filter((link) => link.linkType === "repo-mention");

  if (scoutCorroborationLinks.length > 0) {
    const repos = [...new Set(scoutCorroborationLinks.map((link) => link.repoFullName))];
    return `shared scout overlap on ${repos.join(", ")}`;
  }

  if (repoMentionLinks.length > 0) {
    const repos = [...new Set(repoMentionLinks.map((link) => link.repoFullName))];
    return `origin confirmation exists via ${repos.join(", ")}, but scout-to-scout overlap is zero in this window`;
  }

  return "no cross-source repo overlap in this window";
}

function getWindowHours(window: TimeWindow): number {
  const millis = window.end.getTime() - window.start.getTime();
  return Math.round(millis / (1000 * 60 * 60));
}

function getActionableCount(run: SourceAuditRun): number {
  if (!run.digest) {
    return 0;
  }

  return run.digest.posts.filter(
    (post) => post.analysis.decision === "use-now" || post.analysis.decision === "save-for-later",
  ).length;
}

function renderProfileSummary(run: SourceAuditRun): string {
  if (!run.digest) {
    return `### ${run.profile.label}
- requested mode: ${run.profile.runMode}${run.profile.sourceFilter ? ` (${run.profile.sourceFilter})` : ""}
- window: ${formatWindowLabel(run.window.start, run.window.end)}
- local time zone: ${getLocalTimeZone()}
- status: failed
- error: ${run.error ?? "unknown error"}`;
  }

  const digest = run.digest;
  const actionable = digest.posts.filter(
    (post) => post.analysis.decision === "use-now" || post.analysis.decision === "save-for-later",
  ).length;
  const ignored = digest.posts.filter((post) => post.analysis.decision === "ignore").length;
  const topActionable = buildTopActionableItems(digest);
  const sourceModes = Object.entries(digest.sourceModes)
    .map(([sourceId, mode]) => `${sourceId}=${mode}`)
    .join(", ");
  const sourceHealth = digest.sourceHealth
    .map((summary) => {
      const actionableCount = summary.useNow + summary.saveForLater;
      const latestNote = summary.latestPublishedAt ? `, latest fetched ${summary.latestPublishedAt}` : "";
      const freshnessNote = `, freshness ${summary.freshnessHours ?? 24}h`;
      const cadenceNote = `, class ${summary.cadenceClass ?? "daily"}`;

      if (summary.kept === 0) {
        return `${summary.sourceId}: fetched ${summary.fetched}, no surviving posts${freshnessNote}${cadenceNote}${latestNote}`;
      }

      return `${summary.sourceId}: fetched ${summary.fetched}, kept ${summary.kept}, actionable ${actionableCount}, ignored ${summary.ignored}${freshnessNote}${cadenceNote}${latestNote}`;
    })
    .join("; ");
  const actionQuality = buildActionQualitySummary(digest.posts, digest.crossLinks);
  const actionQualityLine = actionQuality.actionableTotal === 0
    ? "none"
    : `artifact-backed ${actionQuality.artifactBackedActionables}, discussion-only ${actionQuality.discussionOnlyActionables}, corroborated total ${actionQuality.corroboratedActionables}, origin-confirmed ${actionQuality.originConfirmedActionables}, scout-overlap ${actionQuality.scoutOverlapActionables}${actionQuality.discussionOnlyDroppedByCeiling > 0 ? `, dropped by ceiling ${actionQuality.discussionOnlyDroppedByCeiling}` : ""}`;
  const actionQualityBySource = actionQuality.bySource.length === 0
    ? "none"
    : actionQuality.bySource
      .map((summary) => `${summary.sourceId}: ${summary.actionable} actionable (${summary.artifactBacked} artifact-backed, ${summary.discussionOnly} discussion-only, ${summary.corroborated} corroborated total, ${summary.originConfirmed} origin-confirmed, ${summary.scoutOverlap} scout-overlap${summary.discussionOnlyDropped > 0 ? `, ${summary.discussionOnlyDropped} dropped by ceiling` : ""})`)
      .join("; ");
  const corroborationRead = buildCorroborationRead(digest);
  const perTargetRead = run.profile.sourceFilter === "reddit-agent-watchlist"
    ? `\n- per-target read: ${renderRedditTargetBreakdown(digest)}`
    : "";

  return `### ${run.profile.label}
- requested mode: ${run.profile.runMode}${run.profile.sourceFilter ? ` (${run.profile.sourceFilter})` : ""}
- window: ${formatWindowLabel(run.window.start, run.window.end)}
- local time zone: ${getLocalTimeZone()}
- source modes: ${sourceModes}
- kept after cleanup: ${digest.stats.kept}
- actionable items: ${actionable}
- ignored items: ${ignored}
- action quality: ${actionQualityLine}
- actionable by source: ${actionQualityBySource}
- corroboration read: ${corroborationRead}
- top actionable: ${topActionable.length > 0 ? topActionable.join(", ") : "none"}${perTargetRead}
- source health: ${sourceHealth}`;
}

function buildCadenceSummaries(runs: SourceAuditRun[]): CadenceSummary[] {
  const sourceRuns = runs.filter((run) => run.profile.sourceFilter);
  const summaries = new Map<string, CadenceSummary>();

  for (const run of sourceRuns) {
    const existing = summaries.get(run.profile.id) ?? {
      profileId: run.profile.id,
      label: run.profile.label,
    };
    const hours = getWindowHours(run.window);
    const actionable = getActionableCount(run);

    if (hours === 24) {
      existing.actionable24h = actionable;
    } else if (hours === 72) {
      existing.actionable72h = actionable;
    }

    summaries.set(run.profile.id, existing);
  }

  return [...summaries.values()];
}

function renderCadenceRead(runs: SourceAuditRun[]): string {
  const summaries = buildCadenceSummaries(runs);
  if (summaries.length === 0) {
    return "- none";
  }

  return summaries
    .map((summary) => {
      const a24 = summary.actionable24h ?? 0;
      const a72 = summary.actionable72h ?? 0;
      let status = "cold";
      let reason = "no actionable signal in either 24h or 72h";

      if (a24 > 0) {
        status = "daily-viable";
        reason = `shows actionable signal in 24h (${a24})`;
      } else if (a72 > 0) {
        status = "slower-cadence";
        reason = `quiet in 24h but useful in 72h (${a72})`;
      }

      return `- ${summary.label}: ${status} - 24h ${a24}, 72h ${a72}; ${reason}`;
    })
    .join("\n");
}

function renderWindowSection(runs: SourceAuditRun[], windowHours: number): string {
  const matchingRuns = runs.filter((run) => getWindowHours(run.window) === windowHours);
  if (matchingRuns.length === 0) {
    return "";
  }

  return `### ${windowHours}h Window

${matchingRuns.map((run) => renderProfileSummary(run)).join("\n\n")}`;
}

export function renderSourceAuditReport(
  runs: SourceAuditRun[],
  generatedAt: Date,
): string {
  const windowSections = [...new Set(runs.map((run) => getWindowHours(run.window)))]
    .sort((left, right) => left - right)
    .map((windowHours) => renderWindowSection(runs, windowHours))
    .filter((section) => section.length > 0)
    .join("\n\n");

  return `# Signal Scout Source Audit

Generated: ${generatedAt.toISOString()}
Profiles run: ${runs.length}

## Why This Report Exists

This report compares multiple digest profiles side by side so we can judge:

- which source mix is actually useful
- which source is mostly noise
- whether live mode is really better than mock for the current window

## Cadence Read

${renderCadenceRead(runs)}

## Profile Results

${windowSections}
`;
}

export async function runSourceAudit(
  profiles: SourceAuditProfile[],
  baseOptions: Omit<RunDailyOptions, "runMode" | "sourceFilter" | "respectSourceFreshness">,
): Promise<SourceAuditRun[]> {
  const runs: SourceAuditRun[] = [];
  const window = buildWindow(baseOptions.runDate, baseOptions.windowHours);

  for (const profile of profiles) {
    try {
      const built = await buildDailyDigest({
        ...baseOptions,
        respectSourceFreshness: false,
        runMode: profile.runMode,
        sourceFilter: profile.sourceFilter,
      });

      runs.push({
        profile,
        digest: built.result,
        window: built.window,
      });
    } catch (error: unknown) {
      runs.push({
        profile,
        window,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return runs;
}
