import { analyzePosts } from "../analysis/heuristic.ts";
import { applyDiscussionCeilings } from "../analysis/discussion-ceilings.ts";
import { GITHUB_AGENT_WATCHLIST } from "../config/github-watchlist.ts";
import { loadRadarProfile, summarizeRadarProfile, summarizeRadarProfileFocus } from "../config/radar-profile.ts";
import { loadRankingFeedbackRules } from "../config/ranking-feedback.ts";
import { SOURCE_CONFIG } from "../config/sources.ts";
import { renderDailyDigest } from "../digest/markdown.ts";
import { writeTextFile } from "../lib/file-system.ts";
import { buildWindow, formatReportDate } from "../lib/time.ts";
import { buildCrossSourceLinks } from "../normalize/cross-link.ts";
import { annotateRepoMentions } from "../normalize/extract-repos.ts";
import { normalizePosts } from "../normalize/posts.ts";
import { fetchSource } from "../sources/registry.ts";
import type { DailyDigestResult, SourceHealthSummary, SourceRunMode, TimeWindow } from "../types.ts";

export interface RunDailyOptions {
  runDate: Date;
  windowHours: number;
  runMode: SourceRunMode;
  sourceFilter?: string;
  respectSourceFreshness?: boolean;
}

export interface BuiltDailyDigest {
  result: DailyDigestResult;
  window: TimeWindow;
}

export async function buildDailyDigest(options: RunDailyOptions): Promise<BuiltDailyDigest> {
  const sources = SOURCE_CONFIG.filter(
    (source) => source.enabled && (!options.sourceFilter || source.id === options.sourceFilter),
  );

  if (sources.length === 0) {
    throw new Error("No enabled sources matched the current run.");
  }

  const sourceFreshnessHours = Object.fromEntries(
    sources.map((source) => [
      source.id,
      options.respectSourceFreshness === false ? options.windowHours : (source.freshnessHours ?? options.windowHours),
    ]),
  );
  const sourceCadenceClasses = Object.fromEntries(
    sources.map((source) => [source.id, source.cadenceClass ?? "daily"]),
  );

  const window = buildWindow(options.runDate, options.windowHours);
  const collectedPosts = [];
  const notes = [];
  const sourceModes: Record<string, "mock" | "live"> = {};

  for (const source of sources) {
    const result = await fetchSource(source, {
      runMode: options.runMode,
      window,
      now: options.runDate,
    });
    sourceModes[source.id] = result.modeUsed;
    collectedPosts.push(...result.posts);
    notes.push(...result.notes);
  }

  const { posts, stats } = normalizePosts(collectedPosts, window, sourceFreshnessHours);
  const annotatedPosts = annotateRepoMentions(posts, GITHUB_AGENT_WATCHLIST);
  const crossLinks = buildCrossSourceLinks(annotatedPosts);
  const feedbackRules = await loadRankingFeedbackRules();
  const radarProfile = await loadRadarProfile();
  const analyzedPosts = analyzePosts(annotatedPosts, feedbackRules, crossLinks, radarProfile);
  const cappedPosts = applyDiscussionCeilings(analyzedPosts, crossLinks);
  const sourceHealth: SourceHealthSummary[] = sources.map((source) => {
    const fetchedPosts = collectedPosts.filter((post) => post.sourceId === source.id);
    const sourcePosts = cappedPosts.filter((post) => post.sourceId === source.id);
    const latestPublishedAt = fetchedPosts
      .map((post) => post.publishedAt)
      .sort((left, right) => right.localeCompare(left))[0];

    return {
      sourceId: source.id,
      sourceLabel: source.label,
      sourceTier: source.tier,
      modeUsed: sourceModes[source.id] ?? "mock",
      freshnessHours: sourceFreshnessHours[source.id] ?? options.windowHours,
      cadenceClass: sourceCadenceClasses[source.id],
      fetched: fetchedPosts.length,
      latestPublishedAt,
      kept: sourcePosts.length,
      useNow: sourcePosts.filter((post) => post.analysis.decision === "use-now").length,
      saveForLater: sourcePosts.filter((post) => post.analysis.decision === "save-for-later").length,
      ignored: sourcePosts.filter((post) => post.analysis.decision === "ignore").length,
    };
  });
  const reportDate = formatReportDate(options.runDate);
  const reportPath = `reports/daily/${reportDate}.md`;

  notes.push({
    sourceId: "ranking-feedback",
    message: `Loaded ${feedbackRules.length} ranking feedback rule(s).`,
  });
  notes.push({
    sourceId: "cross-links",
    message: `Built ${crossLinks.length} cross-source repo link(s).`,
  });

  const result: DailyDigestResult = {
    reportPath,
    reportDate,
    stats,
    posts: cappedPosts,
    notes,
    sourceModes,
    crossLinks,
    sourceHealth,
    radarProfileSummary: radarProfile ? summarizeRadarProfile(radarProfile) : undefined,
    radarProfileFocus: radarProfile ? summarizeRadarProfileFocus(radarProfile) : undefined,
  };

  return {
    result,
    window,
  };
}

export async function runDailyDigest(options: RunDailyOptions): Promise<DailyDigestResult> {
  const built = await buildDailyDigest(options);
  const markdown = renderDailyDigest(built.result, built.window);
  await writeTextFile(built.result.reportPath, markdown);

  return built.result;
}
