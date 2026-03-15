import { PROJECT_CONTEXT } from "../config/interest-profile.ts";
import { formatDateTime, formatWindowLabel, getLocalTimeZone } from "../lib/time.ts";
import { isArtifactEvidenceUrl } from "../analysis/artifact-evidence.ts";
import { buildActionQualitySummary, getPostEvidenceFlags } from "../analysis/action-quality.ts";
import type { CrossSourceLink, DailyDigestResult, ScoredPost, SourceHealthSummary, TimeWindow } from "../types.ts";

interface PostSignalSummary {
  linkedRepos: string[];
  scoutCorroborationSources: string[];
  originScoutMentions: string[];
}

interface ScoutArtifactEvidence {
  url: string;
  label: string;
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

interface BriefBucketSelection {
  posts: ScoredPost[];
  totalEligible: number;
  hiddenCount: number;
}

function formatBulletList(items: string[], emptyLabel = "None today."): string {
  if (items.length === 0) {
    return `- ${emptyLabel}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function buildBriefKey(post: ScoredPost): string {
  return readString(post.metadata, "repoFullName") ?? post.url ?? `${post.sourceKind}:${post.sourceLabel}:${post.analysis.topic}`;
}

function selectBriefPosts(
  posts: ScoredPost[],
  predicate: (post: ScoredPost) => boolean,
  limit: number,
  crossLinks: CrossSourceLink[],
): ScoredPost[] {
  return rankBriefPosts(posts, predicate, crossLinks, compareByGeneralBriefPriority).slice(0, limit);
}

function dedupeRankedPosts(posts: ScoredPost[]): ScoredPost[] {
  const seenKeys = new Set<string>();
  const selected: ScoredPost[] = [];

  for (const post of posts) {
    const key = buildBriefKey(post);
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    selected.push(post);
  }

  return selected;
}

function rankBriefPosts(
  posts: ScoredPost[],
  predicate: (post: ScoredPost) => boolean,
  crossLinks: CrossSourceLink[],
  comparator: (left: ScoredPost, right: ScoredPost, crossLinks: CrossSourceLink[]) => number,
): ScoredPost[] {
  return dedupeRankedPosts(
    posts
      .filter(predicate)
      .sort((left, right) => comparator(left, right, crossLinks)),
  );
}

function getBriefPriority(post: ScoredPost, crossLinks: CrossSourceLink[]): number {
  const flags = getPostEvidenceFlags(post, crossLinks);
  let priority = post.analysis.relevanceScore;

  if (flags.hasArtifactEvidence) {
    priority += 40;
  }

  if (flags.hasWatchlistRepoEvidence) {
    priority += 12;
  }

  if (flags.hasExternalArtifactEvidence) {
    priority += 6;
  }

  if (flags.hasScoutCorroboration || flags.hasOriginConfirmation) {
    priority += 14;
  }

  if (post.sourceTier === "origin") {
    priority += 10;
  }

  if (post.sourceKind === "github") {
    priority += 8;
  }

  if (flags.isDiscussionOnly) {
    priority -= 35;
  }

  return priority;
}

function compareByGeneralBriefPriority(
  left: ScoredPost,
  right: ScoredPost,
  crossLinks: CrossSourceLink[],
): number {
  const priorityDelta = getBriefPriority(right, crossLinks) - getBriefPriority(left, crossLinks);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const scoreDelta = right.analysis.relevanceScore - left.analysis.relevanceScore;
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return right.publishedAt.localeCompare(left.publishedAt);
}

function getSaveThisWeekTier(post: ScoredPost, crossLinks: CrossSourceLink[]): number {
  const flags = getPostEvidenceFlags(post, crossLinks);
  const corroborated = flags.hasScoutCorroboration || flags.hasOriginConfirmation;

  if (flags.hasArtifactEvidence && corroborated) {
    return 0;
  }

  if (flags.hasArtifactEvidence) {
    return 1;
  }

  if (corroborated) {
    return 2;
  }

  return 3;
}

function compareSaveThisWeekPriority(
  left: ScoredPost,
  right: ScoredPost,
  crossLinks: CrossSourceLink[],
): number {
  const tierDelta = getSaveThisWeekTier(left, crossLinks) - getSaveThisWeekTier(right, crossLinks);
  if (tierDelta !== 0) {
    return tierDelta;
  }

  const sourcePriorityDelta = left.sourcePriority - right.sourcePriority;
  if (sourcePriorityDelta !== 0) {
    return sourcePriorityDelta;
  }

  const scoreDelta = right.analysis.relevanceScore - left.analysis.relevanceScore;
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return right.publishedAt.localeCompare(left.publishedAt);
}

function buildSaveThisWeekSelection(posts: ScoredPost[], crossLinks: CrossSourceLink[]): BriefBucketSelection {
  const doTodayKeys = new Set(
    rankBriefPosts(
      posts,
      (post) => post.analysis.decision === "use-now" && post.analysis.urgency === "today",
      crossLinks,
      compareByGeneralBriefPriority,
    ).map(buildBriefKey),
  );
  const candidates = rankBriefPosts(
    posts,
    (post) => !doTodayKeys.has(buildBriefKey(post))
      && (post.analysis.decision === "save-for-later" || post.analysis.urgency === "this-week"),
    crossLinks,
    compareSaveThisWeekPriority,
  );

  const selected: ScoredPost[] = [];
  let discussionOnlyCount = 0;

  for (const post of candidates) {
    const flags = getPostEvidenceFlags(post, crossLinks);
    if (flags.isDiscussionOnly && discussionOnlyCount >= 2) {
      continue;
    }

    selected.push(post);
    if (flags.isDiscussionOnly) {
      discussionOnlyCount += 1;
    }

    if (selected.length >= 5) {
      break;
    }
  }

  const adjustedSelection = applySaveThisWeekDiversity(selected, candidates, crossLinks);

  return {
    posts: adjustedSelection,
    totalEligible: candidates.length,
    hiddenCount: Math.max(0, candidates.length - adjustedSelection.length),
  };
}

function applySaveThisWeekDiversity(
  selected: ScoredPost[],
  candidates: ScoredPost[],
  crossLinks: CrossSourceLink[],
): ScoredPost[] {
  let adjusted = [...selected];

  while (true) {
    const sourceCounts = countBySource(adjusted);
    const overflowEntry = [...sourceCounts.entries()].find(([, count]) => count > 3);
    if (!overflowEntry) {
      break;
    }

    const [overflowSourceId] = overflowEntry;
    const overflowCandidates = [...adjusted]
      .filter((post) => post.sourceId === overflowSourceId)
      .sort((left, right) => compareSaveThisWeekPriority(right, left, crossLinks));
    const toReplace = overflowCandidates[0];
    if (!toReplace) {
      break;
    }

    const replacement = findSaveThisWeekReplacement(adjusted, candidates, toReplace, crossLinks);
    if (!replacement) {
      break;
    }

    adjusted = adjusted
      .filter((post) => post.id !== toReplace.id)
      .concat(replacement)
      .sort((left, right) => compareSaveThisWeekPriority(left, right, crossLinks));
  }

  return adjusted;
}

function countBySource(posts: ScoredPost[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const post of posts) {
    counts.set(post.sourceId, (counts.get(post.sourceId) ?? 0) + 1);
  }

  return counts;
}

function findSaveThisWeekReplacement(
  selected: ScoredPost[],
  candidates: ScoredPost[],
  replacedPost: ScoredPost,
  crossLinks: CrossSourceLink[],
): ScoredPost | undefined {
  const selectedIds = new Set(selected.map((post) => post.id));
  const selectedCounts = countBySource(selected.filter((post) => post.id !== replacedPost.id));
  const replacedFlags = getPostEvidenceFlags(replacedPost, crossLinks);
  const discussionOnlyAfterRemoval = selected
    .filter((post) => post.id !== replacedPost.id)
    .filter((post) => getPostEvidenceFlags(post, crossLinks).isDiscussionOnly)
    .length;

  for (const candidate of candidates) {
    if (selectedIds.has(candidate.id) || candidate.sourceId === replacedPost.sourceId) {
      continue;
    }

    const flags = getPostEvidenceFlags(candidate, crossLinks);
    if (selectedCounts.get(candidate.sourceId) === 3) {
      continue;
    }

    if (flags.isDiscussionOnly && discussionOnlyAfterRemoval >= 2) {
      continue;
    }

    if (replacedFlags.hasArtifactEvidence && !flags.hasArtifactEvidence) {
      continue;
    }

    return candidate;
  }

  return undefined;
}

function buildIgnoreSelection(posts: ScoredPost[], crossLinks: CrossSourceLink[]): BriefBucketSelection {
  const doTodayKeys = new Set(
    rankBriefPosts(
      posts,
      (post) => post.analysis.decision === "use-now" && post.analysis.urgency === "today",
      crossLinks,
      compareByGeneralBriefPriority,
    ).map(buildBriefKey),
  );
  const saveThisWeekKeys = new Set(buildSaveThisWeekSelection(posts, crossLinks).posts.map(buildBriefKey));
  const candidates = rankBriefPosts(
    posts,
    (post) => !doTodayKeys.has(buildBriefKey(post))
      && !saveThisWeekKeys.has(buildBriefKey(post))
      && post.analysis.decision === "ignore",
    crossLinks,
    (left, right) => {
      const scoreDelta = right.analysis.relevanceScore - left.analysis.relevanceScore;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return compareByGeneralBriefPriority(left, right, crossLinks);
    },
  );

  return {
    posts: candidates.slice(0, 2),
    totalEligible: candidates.length,
    hiddenCount: Math.max(0, candidates.length - 2),
  };
}

function buildBriefSubject(post: ScoredPost): string {
  const repoFullName = readString(post.metadata, "repoFullName");
  const label = repoFullName ?? post.analysis.topic;
  return post.url ? `[${label}](${post.url})` : label;
}

function projectTargetLabel(project: ScoredPost["analysis"]["project"]): string {
  return project === "none" ? "the current work" : project;
}

function trimBriefText(text: string, max = 110): string {
  const cleaned = text.replace(/\s+/gu, " ").trim().replace(/[.;:,]+$/u, "");
  if (cleaned.length <= max) {
    return cleaned;
  }

  return `${cleaned.slice(0, max - 3).trimEnd()}...`;
}

function formatCompactNumber(value: number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/u, "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/u, "")}K`;
  }

  return `${value}`;
}

function joinBriefParts(parts: Array<string | undefined>): string {
  return parts.filter((part): part is string => Boolean(part && part.trim().length > 0)).join(", ");
}

function formatList(items: string[], limit = 2): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length <= limit) {
    return items.join(" and ");
  }

  return `${items.slice(0, limit).join(", ")}, and ${items.length - limit} more`;
}

function buildArtifactLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "github.com" || hostname.endsWith(".github.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
    }

    return hostname;
  } catch {
    return url;
  }
}

function getScoutArtifactEvidence(post: ScoredPost): ScoutArtifactEvidence | undefined {
  if (post.sourceKind === "github") {
    return undefined;
  }

  const candidates = [
    readString(post.metadata, "outboundUrl"),
    readString(post.metadata, "linkedUrl"),
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));

  for (const url of candidates) {
    if (!isArtifactEvidenceUrl(url)) {
      continue;
    }

    return {
      url,
      label: buildArtifactLabel(url),
    };
  }

  return undefined;
}

function getPostSignalSummary(post: ScoredPost, crossLinks: CrossSourceLink[]): PostSignalSummary {
  const repoLinks = crossLinks.filter((link) => link.linkType === "repo-mention");
  const scoutLinks = crossLinks.filter((link) => link.linkType === "scout-corroboration");

  if (post.sourceKind === "github") {
    const incomingRepoLinks = repoLinks.filter((link) => link.toPostId === post.id);

    return {
      linkedRepos: [],
      scoutCorroborationSources: [],
      originScoutMentions: [...new Set(incomingRepoLinks.map((link) => link.fromSourceId))],
    };
  }

  const outgoingRepoLinks = repoLinks.filter((link) => link.fromPostId === post.id);
  const corroboratingSources = scoutLinks
    .filter((link) => link.fromPostId === post.id || link.toPostId === post.id)
    .map((link) => (link.fromPostId === post.id ? link.toSourceId : link.fromSourceId));
  const directMentionedRepos = post.mentionedRepos ?? [];

  return {
    linkedRepos: [...new Set([...directMentionedRepos, ...outgoingRepoLinks.map((link) => link.repoFullName)])],
    scoutCorroborationSources: [...new Set(corroboratingSources)],
    originScoutMentions: [],
  };
}

function extractGitHubDescription(post: ScoredPost): string | undefined {
  const metadataDescription = readString(post.metadata, "repoDescription");
  if (metadataDescription) {
    return trimBriefText(metadataDescription, 95);
  }

  const summaryWithoutPrefix = post.shortSummary.includes(": ")
    ? post.shortSummary.split(": ").slice(1).join(": ")
    : post.shortSummary;
  const summaryWithoutSignals = summaryWithoutPrefix.split("Adoption signals:")[0]?.trim() ?? summaryWithoutPrefix.trim();

  if (!summaryWithoutSignals) {
    return undefined;
  }

  return trimBriefText(summaryWithoutSignals, 95);
}

function buildGitHubTimingNote(post: ScoredPost, reportDate: string): string {
  const releaseTag = readString(post.metadata, "releaseTag");
  const publishedDate = post.publishedAt.slice(0, 10);

  if (publishedDate === reportDate) {
    return releaseTag ? `released ${releaseTag} today` : "updated today";
  }

  return releaseTag ? `released ${releaseTag} on ${publishedDate}` : `updated ${publishedDate}`;
}

function buildTodayReason(post: ScoredPost, reportDate: string, crossLinks: CrossSourceLink[]): string {
  const signal = getPostSignalSummary(post, crossLinks);
  const scoutArtifact = getScoutArtifactEvidence(post);

  if (post.sourceKind === "github") {
    const description = extractGitHubDescription(post);
    const stars = formatCompactNumber(readNumber(post.metadata, "stars"));
    const adoption = stars ? `${stars} stars` : undefined;
    const timing = buildGitHubTimingNote(post, reportDate);
    const corroboration = signal.originScoutMentions.length > 0
      ? signal.originScoutMentions.length > 1
        ? `surfaced by ${signal.originScoutMentions.length} trusted scout sources`
        : "surfaced by a trusted scout source"
      : post.analysis.crossSourceAdjustment > 0
        ? "corroborated by another trusted source"
        : undefined;
    const projectFit = post.analysis.project === "none" ? "project fit still needs a decision" : undefined;

    return joinBriefParts([description, adoption, timing, corroboration, projectFit]);
  }

  if (signal.linkedRepos.length > 0 || signal.scoutCorroborationSources.length > 0) {
    const repoEvidence = signal.linkedRepos.length > 0
      ? signal.linkedRepos.length > 1
        ? `points to ${formatList(signal.linkedRepos)}`
        : `points to ${signal.linkedRepos[0]}`
      : undefined;
    const externalArtifact = signal.linkedRepos.length === 0 && scoutArtifact
      ? `links to external artifact ${scoutArtifact.label}`
      : undefined;
    const scoutCorroboration = signal.scoutCorroborationSources.length > 0
      ? signal.scoutCorroborationSources.length > 1
        ? `repeated by ${signal.scoutCorroborationSources.length} other scout sources`
        : "repeated by another scout source"
      : undefined;

    return joinBriefParts([repoEvidence, externalArtifact, scoutCorroboration]);
  }

  if (scoutArtifact) {
    return `links to external artifact ${scoutArtifact.label}`;
  }

  if (post.analysis.feedbackNotes.length > 0) {
    return trimBriefText(post.analysis.feedbackNotes[0] ?? "");
  }

  if (post.sourceTier === "scout") {
    return "discussion signal only, with no direct artifact link yet";
  }

  if (post.analysis.crossSourceAdjustment > 0) {
    return "corroborated by another trusted source";
  }

  if (post.analysis.project === "none") {
    return "it looks promising but still needs a clear project fit";
  }

  return trimBriefText(post.analysis.whyItMatters, 105);
}

function buildWeekReason(post: ScoredPost): string {
  if (post.analysis.crossSourceAdjustment < 0) {
    return "it matters, but it still lacks scout corroboration";
  }

  if (post.analysis.project === "none") {
    return "it is interesting, but the project fit is still unclear";
  }

  return "it is useful, but not a same-day move";
}

function buildIgnoreReason(post: ScoredPost): string {
  if (post.analysis.project === "none") {
    return "it does not map tightly to the current build plan";
  }

  return "it is weaker than the items worth acting on today";
}

function buildTodayBrief(post: ScoredPost, reportDate: string, crossLinks: CrossSourceLink[]): string {
  return `Review ${buildBriefSubject(post)} today for ${projectTargetLabel(post.analysis.project)}: ${buildTodayReason(post, reportDate, crossLinks)}.`;
}

function buildWeekBrief(post: ScoredPost): string {
  return `Save ${buildBriefSubject(post)} for this week for ${projectTargetLabel(post.analysis.project)}; ${buildWeekReason(post)}.`;
}

function buildIgnoreBrief(post: ScoredPost): string {
  return `Ignore ${buildBriefSubject(post)} for now; ${buildIgnoreReason(post)}.`;
}

function buildDoTodayClusterKey(post: ScoredPost, crossLinks: CrossSourceLink[]): string {
  const repoFullName = readString(post.metadata, "repoFullName");
  if (repoFullName) {
    return `repo:${repoFullName}`;
  }

  const signal = getPostSignalSummary(post, crossLinks);
  if (signal.linkedRepos.length === 1) {
    return `repo:${signal.linkedRepos[0]}`;
  }

  const scoutArtifact = getScoutArtifactEvidence(post);
  if (scoutArtifact?.label) {
    return `artifact:${scoutArtifact.label}`;
  }

  return `topic:${post.analysis.topic}`;
}

function clusterDoTodayPosts(posts: ScoredPost[], crossLinks: CrossSourceLink[]): ScoredPost[] {
  const selectedByKey = new Map<string, ScoredPost>();

  for (const post of posts) {
    const key = buildDoTodayClusterKey(post, crossLinks);
    const existing = selectedByKey.get(key);
    if (!existing) {
      selectedByKey.set(key, post);
      continue;
    }

    if (compareByGeneralBriefPriority(post, existing, crossLinks) > 0) {
      continue;
    }

    selectedByKey.set(key, post);
  }

  return [...selectedByKey.values()].sort((left, right) => compareByGeneralBriefPriority(left, right, crossLinks));
}

function summarizeDoToday(posts: ScoredPost[], reportDate: string, crossLinks: CrossSourceLink[]): string[] {
  return clusterDoTodayPosts(
    rankBriefPosts(
      posts,
      (post) => post.analysis.decision === "use-now" && post.analysis.urgency === "today",
      crossLinks,
      compareByGeneralBriefPriority,
    ),
    crossLinks,
  )
    .map((post) => buildTodayBrief(post, reportDate, crossLinks));
}

function summarizeSaveThisWeek(selection: BriefBucketSelection): string[] {
  return selection.posts.map(buildWeekBrief);
}

function summarizeIgnore(selection: BriefBucketSelection): string[] {
  const lines = selection.posts.map(buildIgnoreBrief);

  if (selection.hiddenCount > 0) {
    lines.push(`and ${selection.hiddenCount} more ignored item(s) in full digest.`);
  }

  return lines;
}

function buildRunHealthNotes(
  result: DailyDigestResult,
  doToday: string[],
  saveThisWeek: BriefBucketSelection,
): string[] {
  const notes: string[] = [];
  const mockSources = Object.entries(result.sourceModes)
    .filter(([, mode]) => mode === "mock")
    .map(([sourceId]) => sourceId);
  const actionableCount = doToday.length + saveThisWeek.posts.length;

  if (mockSources.length > 0) {
    notes.push(`${mockSources.join(", ")} ran in mock mode, so this digest is not a fully live view.`);
  }

  if (actionableCount === 0) {
    notes.push("This run produced no actionable items, so treat it as a weak signal pass rather than a definitive 'nothing changed' result.");
  }

  if (result.posts.length === 0) {
    notes.push("No posts survived cleanup in the current window, so this run is effectively empty.");
  } else if (result.posts.length < 3) {
    notes.push(`Only ${result.posts.length} post(s) survived cleanup in the current window, so confidence is lower than a fuller run.`);
  }

  if (saveThisWeek.hiddenCount > 0) {
    notes.push(`Save This Week: showing ${saveThisWeek.posts.length} of ${saveThisWeek.totalEligible}. Full list in Post Reviews below.`);
  }

  return notes;
}

function buildSourceHealthLine(summary: SourceHealthSummary): string {
  const actionable = summary.useNow + summary.saveForLater;
  const head = `${summary.sourceLabel} (${summary.sourceId}, ${summary.sourceTier}, ${summary.modeUsed})`;
  const freshnessNote = ` Freshness window: ${summary.freshnessHours ?? 24}h.`;
  const cadenceNote = ` Cadence class: ${summary.cadenceClass ?? "daily"}.`;
  const latestNote = summary.latestPublishedAt
    ? ` Latest fetched post: ${formatDateTime(summary.latestPublishedAt)}.`
    : "";

  if (summary.kept === 0) {
    return `${head}: fetched ${summary.fetched}, no posts survived cleanup.${freshnessNote}${cadenceNote}${latestNote}`;
  }

  return `${head}: fetched ${summary.fetched}, kept ${summary.kept}, actionable ${actionable}, ignored ${summary.ignored}.${freshnessNote}${cadenceNote}${latestNote}`;
}

function buildRedditTargetSummaries(result: DailyDigestResult): RedditTargetSummary[] {
  const fetchedBySubreddit = new Map<string, number>();

  for (const note of result.notes) {
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

  for (const post of result.posts) {
    if (post.sourceId !== "reddit-agent-watchlist") {
      continue;
    }

    const subreddit = readString(post.metadata, "subreddit") ?? "unknown";
    const flags = getPostEvidenceFlags(post, result.crossLinks);
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

function renderRedditTargetBreakdown(result: DailyDigestResult): string {
  const summaries = buildRedditTargetSummaries(result);
  if (summaries.length === 0) {
    return "";
  }

  const compact = summaries
    .map((summary) =>
      `r/${summary.subreddit}: ${summary.actionable} actionable, ${summary.artifactBacked} artifact-backed, ${summary.discussionOnly} discussion-only`,
    )
    .join("; ");

  return ` Reddit breakdown: ${compact}.`;
}

function renderSourceHealth(result: DailyDigestResult): string {
  if (result.sourceHealth.length === 0) {
    return "";
  }

  return result.sourceHealth
    .map((summary) => {
      const extra = summary.sourceId === "reddit-agent-watchlist"
        ? renderRedditTargetBreakdown(result)
        : "";
      return `- ${buildSourceHealthLine(summary)}${extra}`;
    })
    .join("\n");
}

function renderActionQuality(result: DailyDigestResult): string {
  const summary = buildActionQualitySummary(result.posts, result.crossLinks);
  const lines = [
    `- actionable total: ${summary.actionableTotal}`,
    `- use now: ${summary.useNowCount}`,
    `- save this week: ${summary.saveForLaterCount}`,
    `- artifact-backed: ${summary.artifactBackedActionables}`,
    `- discussion-only: ${summary.discussionOnlyActionables}`,
    `- corroborated total: ${summary.corroboratedActionables}`,
    `- origin-confirmed: ${summary.originConfirmedActionables}`,
    `- scout-overlap: ${summary.scoutOverlapActionables}`,
  ];

  if (summary.discussionOnlyDroppedByCeiling > 0) {
    lines.push(`- discussion-only dropped by ceiling: ${summary.discussionOnlyDroppedByCeiling}`);
  }

  if (summary.bySource.length > 0) {
    lines.push(
      ...summary.bySource.map((source) =>
        `- ${source.sourceLabel}: ${source.actionable} actionable, ${source.artifactBacked} artifact-backed, ${source.discussionOnly} discussion-only, ${source.corroborated} corroborated total, ${source.originConfirmed} origin-confirmed, ${source.scoutOverlap} scout-overlap${source.discussionOnlyDropped > 0 ? `, ${source.discussionOnlyDropped} dropped by ceiling` : ""}.`,
      ),
    );
  }

  return lines.join("\n");
}

function readNumber(metadata: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === "number" ? value : undefined;
}

function readString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

function renderGitHubSignals(post: ScoredPost): string {
  if (post.sourceKind !== "github" || !post.metadata) {
    return "";
  }

  const repoFullName = readString(post.metadata, "repoFullName");
  const stars = readNumber(post.metadata, "stars");
  const forks = readNumber(post.metadata, "forks");
  const openIssues = readNumber(post.metadata, "openIssues");
  const subscribers = readNumber(post.metadata, "subscribers");
  const pushedAt = readString(post.metadata, "pushedAt");
  const releaseTag = readString(post.metadata, "releaseTag");
  const releasePublishedAt = readString(post.metadata, "releasePublishedAt");

  if (!repoFullName) {
    return "";
  }

  const signals = [
    stars !== undefined ? `${stars} stars` : null,
    forks !== undefined ? `${forks} forks` : null,
    openIssues !== undefined ? `${openIssues} open issues` : null,
    subscribers !== undefined ? `${subscribers} subscribers` : null,
  ].filter((value): value is string => value !== null);

  const lastPush = pushedAt ? pushedAt.slice(0, 10) : "unknown";
  const releaseSignal = releaseTag
    ? `; latest release ${releaseTag}${releasePublishedAt ? ` on ${releasePublishedAt.slice(0, 10)}` : ""}`
    : "";
  return `\n- repo evidence: ${repoFullName}; ${signals.join(", ")}; last push ${lastPush}${releaseSignal}`;
}

function renderScore(post: ScoredPost): string {
  const adjustments: string[] = [];

  if (post.analysis.crossSourceAdjustment !== 0) {
    const adjustment = post.analysis.crossSourceAdjustment > 0
      ? `cross-source +${post.analysis.crossSourceAdjustment}`
      : `cross-source ${post.analysis.crossSourceAdjustment}`;
    adjustments.push(adjustment);
  }

  if (post.analysis.scoreAdjustment !== 0) {
    const adjustment = post.analysis.scoreAdjustment > 0
      ? `manual +${post.analysis.scoreAdjustment}`
      : `manual ${post.analysis.scoreAdjustment}`;
    adjustments.push(adjustment);
  }

  if (adjustments.length === 0) {
    return `${post.analysis.relevanceScore}/100`;
  }

  return `${post.analysis.relevanceScore}/100 (base ${post.analysis.baseRelevanceScore}; ${adjustments.join(", ")})`;
}

function renderFeedback(post: ScoredPost): string {
  if (post.analysis.feedbackNotes.length === 0) {
    return "";
  }

  return `\n- feedback applied: ${post.analysis.feedbackNotes.join("; ")}`;
}

function renderCrossSourceSupport(post: ScoredPost): string {
  if (post.analysis.crossSourceNotes.length === 0) {
    return "";
  }

  return `\n- cross-source support: ${post.analysis.crossSourceNotes.join("; ")}`;
}

function renderSignalChain(post: ScoredPost, crossLinks: CrossSourceLink[]): string {
  const signal = getPostSignalSummary(post, crossLinks);
  const scoutArtifact = getScoutArtifactEvidence(post);

  if (post.sourceKind === "github") {
    if (signal.originScoutMentions.length === 0) {
      return "\n- signal chain: origin artifact only; no scout source has surfaced it yet.";
    }

    return signal.originScoutMentions.length > 1
      ? `\n- signal chain: origin artifact -> surfaced by ${signal.originScoutMentions.length} scout sources.`
      : "\n- signal chain: origin artifact -> surfaced by one scout source.";
  }

  const parts = ["scout discovery"];

  if (signal.linkedRepos.length > 0) {
    parts.push(
      signal.linkedRepos.length > 1
        ? `artifact evidence via ${formatList(signal.linkedRepos)}`
        : `artifact evidence via ${signal.linkedRepos[0]}`,
    );
  } else if (scoutArtifact) {
    parts.push(`artifact evidence via ${scoutArtifact.label}`);
  } else {
    parts.push("no direct artifact yet");
  }

  if (signal.scoutCorroborationSources.length > 0) {
    parts.push(
      signal.scoutCorroborationSources.length > 1
        ? `repeated across ${signal.scoutCorroborationSources.length} scout sources`
        : "repeated by another scout source",
    );
  }

  return `\n- signal chain: ${parts.join(" -> ")}.`;
}

function buildPostIndexMap(posts: ScoredPost[]): Map<string, number> {
  const indexMap = new Map<string, number>();

  posts.forEach((post, index) => {
    indexMap.set(post.id, index + 1);
  });

  return indexMap;
}

function renderCrossLinks(
  post: ScoredPost,
  postsById: Map<string, ScoredPost>,
  postIndexMap: Map<string, number>,
  crossLinks: CrossSourceLink[],
): string {
  const scoutArtifact = getScoutArtifactEvidence(post);

  if (post.sourceKind === "github") {
    const incomingLinks = crossLinks.filter((link) => link.linkType === "repo-mention" && link.toPostId === post.id);
    if (incomingLinks.length === 0) {
      return "";
    }

    const mentions = [...new Set(incomingLinks
      .map((link) => {
        const referringPost = postsById.get(link.fromPostId);
        const index = postIndexMap.get(link.fromPostId);
        if (!referringPost || !index) {
          return null;
        }

        return `${referringPost.sourceLabel} (post #${index})`;
      })
      .filter((value): value is string => value !== null))];

    if (mentions.length === 0) {
      return "";
    }

    return `\n- mentioned in: ${mentions.join(", ")}`;
  }

  const outgoingRepoLinks = crossLinks.filter((link) => link.linkType === "repo-mention" && link.fromPostId === post.id);
  const scoutCorroborationLinks = crossLinks.filter(
    (link) => link.linkType === "scout-corroboration" && (link.fromPostId === post.id || link.toPostId === post.id),
  );

  const parts: string[] = [];

  if (outgoingRepoLinks.length > 0) {
    const linkedRepos = [...new Set(outgoingRepoLinks.map((link) => {
      const index = postIndexMap.get(link.toPostId);
      return index ? `${link.repoFullName} (post #${index})` : link.repoFullName;
    }))];

    parts.push(`- linked repos: ${linkedRepos.join(", ")}`);
  }

  if (scoutCorroborationLinks.length > 0) {
    const corroboratingPosts = [...new Set(scoutCorroborationLinks
      .map((link) => {
        const otherPostId = link.fromPostId === post.id ? link.toPostId : link.fromPostId;
        const otherPost = postsById.get(otherPostId);
        const index = postIndexMap.get(otherPostId);
        if (!otherPost || !index) {
          return null;
        }

        return `${otherPost.sourceLabel} (post #${index})`;
      })
      .filter((value): value is string => value !== null))];

    if (corroboratingPosts.length > 0) {
      parts.push(`- corroborated by: ${corroboratingPosts.join(", ")}`);
    }
  }

  if (scoutArtifact) {
    parts.push(`- linked artifact: ${scoutArtifact.label} (${scoutArtifact.url})`);
  }

  return parts.length > 0 ? `\n${parts.join("\n")}` : "";
}

function renderPost(
  post: ScoredPost,
  index: number,
  postsById: Map<string, ScoredPost>,
  postIndexMap: Map<string, number>,
  crossLinks: CrossSourceLink[],
): string {
  const urlLabel = post.url ? ` [link](${post.url})` : "";
  const linkedArtifacts = renderCrossLinks(post, postsById, postIndexMap, crossLinks);
  const signalChain = renderSignalChain(post, crossLinks);
  const crossSourceSupport = renderCrossSourceSupport(post);
  const githubSignals = renderGitHubSignals(post);
  const feedback = renderFeedback(post);

  return `### ${index + 1}. ${post.analysis.topic}${urlLabel}
- source: ${post.sourceKind} / ${post.sourceLabel} / ${post.sourceTier} (p${post.sourcePriority})
- date: ${formatDateTime(post.publishedAt)}
- short summary: ${post.shortSummary}
- relevance score: ${renderScore(post)}
- decision: \`${post.analysis.decision}\`
- theme: \`${post.analysis.theme}\`
- why it matters: ${post.analysis.whyItMatters}
- suggested next action: ${post.analysis.suggestedNextAction}
- target project: ${post.analysis.project}
- urgency: ${post.analysis.urgency}${signalChain}${linkedArtifacts}${crossSourceSupport}${githubSignals}${feedback}`;
}

export function renderDailyDigest(
  result: DailyDigestResult,
  window: TimeWindow,
): string {
  const doToday = summarizeDoToday(result.posts, result.reportDate, result.crossLinks);
  const saveThisWeekSelection = buildSaveThisWeekSelection(result.posts, result.crossLinks);
  const ignoreSelection = buildIgnoreSelection(result.posts, result.crossLinks);
  const saveThisWeek = summarizeSaveThisWeek(saveThisWeekSelection);
  const ignore = summarizeIgnore(ignoreSelection);
  const runHealthNotes = buildRunHealthNotes(result, doToday, saveThisWeekSelection);
  const sourceHealth = renderSourceHealth(result);
  const actionQuality = renderActionQuality(result);
  const fetchNotes = result.notes.map((note) => `- ${note.sourceId}: ${note.message}`).join("\n");
  const runModeSummary = Object.entries(result.sourceModes)
    .map(([sourceId, mode]) => `${sourceId}=${mode}`)
    .join(", ");
  const postsById = new Map(result.posts.map((post) => [post.id, post]));
  const postIndexMap = buildPostIndexMap(result.posts);
  const postReviews = result.posts.length > 0
    ? result.posts.map((post, index) => renderPost(post, index, postsById, postIndexMap, result.crossLinks)).join("\n\n")
    : "_No posts survived cleanup in the current window._";

  return `# Signal Scout Daily Digest - ${result.reportDate}

_Primary project context: ${PROJECT_CONTEXT.primaryProject}. Time zone: ${getLocalTimeZone()}. Window: ${formatWindowLabel(
    window.start,
    window.end,
  )}. Source modes: ${runModeSummary}._

${result.radarProfileSummary ? `_Active radar profile: ${result.radarProfileSummary.replace(/^Current radar profile:\s*/u, "")}_` : ""}
${result.radarProfileFocus ? `\n_Active radar focus: ${result.radarProfileFocus.replace(/^Current radar focus:\s*/u, "")}_` : ""}

## Executive Brief

### Do Today
${formatBulletList(doToday)}

### Save This Week
${formatBulletList(saveThisWeek)}

### Ignore For Now
${formatBulletList(ignore)}

${runHealthNotes.length > 0 ? `### Run Health
${formatBulletList(runHealthNotes)}

` : ""}
## Source Health
${sourceHealth || "- no source health summary"}

## Action Quality
${actionQuality}

## Run Notes
- fetched posts: ${result.stats.totalFetched}
- kept after cleanup: ${result.stats.kept}
- dropped outside window: ${result.stats.droppedOutsideWindow}
- dropped as noise: ${result.stats.droppedNoise}
- dropped as duplicates: ${result.stats.droppedDuplicates}
- cross-source links: ${result.crossLinks.length}
${fetchNotes || "- no source notes"}

## Post Reviews

${postReviews}
`;
}




