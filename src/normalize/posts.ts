import { NOISE_KEYWORDS } from "../config/interest-profile.ts";
import { hashText } from "../lib/hash.ts";
import { buildWindow, isWithinWindow } from "../lib/time.ts";
import type { NormalizedPost, RawSourcePost, RunStats, TimeWindow } from "../types.ts";

function sanitizeText(text: string): string {
  return text
    .replace(/ג€”|â€”|â€“/gu, "-")
    .replace(/�/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function buildSummary(text: string): string {
  const cleaned = sanitizeText(text);
  if (cleaned.length <= 180) {
    return cleaned;
  }

  return `${cleaned.slice(0, 177).trimEnd()}...`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function matchesNoiseKeyword(text: string, keyword: string): boolean {
  if (keyword.includes(" ")) {
    return text.includes(keyword);
  }

  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegex(keyword)}(?:$|[^\\p{L}\\p{N}])`, "u").test(text);
}

function isNoise(text: string): boolean {
  const normalized = text.toLowerCase();
  if (normalized.length < 40) {
    return true;
  }

  return NOISE_KEYWORDS.some((keyword) => matchesNoiseKeyword(normalized, keyword));
}

export function normalizePosts(
  rawPosts: RawSourcePost[],
  window: TimeWindow,
  sourceFreshnessHours: Record<string, number> = {},
): { posts: NormalizedPost[]; stats: RunStats } {
  const seenUrls = new Set<string>();
  const seenTexts = new Set<string>();
  const posts: NormalizedPost[] = [];
  const stats: RunStats = {
    totalFetched: rawPosts.length,
    droppedOutsideWindow: 0,
    droppedNoise: 0,
    droppedDuplicates: 0,
    kept: 0,
  };

  for (const rawPost of rawPosts) {
    const sourceWindow = sourceFreshnessHours[rawPost.sourceId]
      ? buildWindow(window.end, sourceFreshnessHours[rawPost.sourceId])
      : window;

    if (!isWithinWindow(rawPost.publishedAt, sourceWindow.start, sourceWindow.end)) {
      stats.droppedOutsideWindow += 1;
      continue;
    }

    const text = sanitizeText(rawPost.text);
    if (isNoise(text)) {
      stats.droppedNoise += 1;
      continue;
    }

    const textKey = hashText(text.toLowerCase());
    const urlKey = rawPost.url?.trim().toLowerCase();
    if ((urlKey && seenUrls.has(urlKey)) || seenTexts.has(textKey)) {
      stats.droppedDuplicates += 1;
      continue;
    }

    if (urlKey) {
      seenUrls.add(urlKey);
    }
    seenTexts.add(textKey);

    posts.push({
      id: hashText(`${rawPost.sourceId}:${rawPost.externalId}:${rawPost.publishedAt}`),
      sourceId: rawPost.sourceId,
      sourceLabel: rawPost.sourceLabel,
      sourceKind: rawPost.sourceKind,
      sourceTier: rawPost.sourceTier,
      sourcePriority: rawPost.sourcePriority,
      externalId: rawPost.externalId,
      url: rawPost.url,
      author: rawPost.author,
      publishedAt: rawPost.publishedAt,
      text,
      shortSummary: buildSummary(text),
      dedupeKey: textKey,
      metadata: rawPost.metadata,
    });
  }

  stats.kept = posts.length;
  return { posts, stats };
}
