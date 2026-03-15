import type { GitHubRepoTarget, NormalizedPost } from "../types.ts";

function buildRepoFullName(target: GitHubRepoTarget): string {
  return `${target.owner}/${target.repo}`;
}

function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

const AMBIGUOUS_ALIAS_BLACKLIST = new Set([
  "codex",
]);

function buildAliasCandidates(target: GitHubRepoTarget): string[] {
  const aliases = new Set<string>();
  const repoPhrase = normalizePhrase(target.repo);
  const labelPhrase = target.label ? normalizePhrase(target.label) : "";

  if (repoPhrase.length >= 3 && !AMBIGUOUS_ALIAS_BLACKLIST.has(repoPhrase)) {
    aliases.add(repoPhrase);
  }

  if (labelPhrase.length >= 3 && !AMBIGUOUS_ALIAS_BLACKLIST.has(labelPhrase)) {
    aliases.add(labelPhrase);
  }

  return [...aliases];
}

function buildRepoMaps(watchlist: GitHubRepoTarget[]): {
  fullNameMap: Map<string, string>;
  aliasMap: Map<string, string>;
} {
  const fullNameMap = new Map<string, string>();
  const aliasBuckets = new Map<string, Set<string>>();

  for (const target of watchlist) {
    const repoFullName = buildRepoFullName(target);
    fullNameMap.set(repoFullName.toLowerCase(), repoFullName);

    for (const alias of buildAliasCandidates(target)) {
      const bucket = aliasBuckets.get(alias) ?? new Set<string>();
      bucket.add(repoFullName);
      aliasBuckets.set(alias, bucket);
    }
  }

  const aliasMap = new Map<string, string>();
  for (const [alias, bucket] of aliasBuckets.entries()) {
    if (bucket.size === 1) {
      aliasMap.set(alias, [...bucket][0]);
    }
  }

  return { fullNameMap, aliasMap };
}

export function extractRepoMentions(text: string, watchlist: GitHubRepoTarget[]): string[] {
  const { fullNameMap, aliasMap } = buildRepoMaps(watchlist);
  const mentions = new Set<string>();
  const lowerText = text.toLowerCase();
  const normalizedText = ` ${normalizePhrase(text)} `;
  const repoPattern = /([a-z0-9][a-z0-9-]{0,38}\/[a-z0-9][a-z0-9.-]{0,99})/giu;
  const githubUrlPattern = /github\.com\/([a-z0-9][a-z0-9-]{0,38}\/[a-z0-9][a-z0-9.-]{0,99})/giu;

  for (const match of lowerText.matchAll(repoPattern)) {
    const candidate = match[1]?.toLowerCase();
    if (!candidate) {
      continue;
    }

    const fullName = fullNameMap.get(candidate);
    if (fullName) {
      mentions.add(fullName);
    }
  }

  for (const match of lowerText.matchAll(githubUrlPattern)) {
    const candidate = match[1]?.toLowerCase();
    if (!candidate) {
      continue;
    }

    const fullName = fullNameMap.get(candidate);
    if (fullName) {
      mentions.add(fullName);
    }
  }

  const aliases = [...aliasMap.keys()].sort((left, right) => right.length - left.length);
  for (const alias of aliases) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, "u");
    if (pattern.test(normalizedText)) {
      mentions.add(aliasMap.get(alias)!);
    }
  }

  return [...mentions];
}

export function annotateRepoMentions(
  posts: NormalizedPost[],
  watchlist: GitHubRepoTarget[],
): NormalizedPost[] {
  return posts.map((post) => {
    if (post.sourceKind === "github") {
      return post;
    }

    const metadataUrls = [
      post.metadata?.outboundUrl,
      post.metadata?.linkedUrl,
    ]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
    const mentionText = [post.text, post.url, ...metadataUrls].filter(Boolean).join(" ");
    const mentionedRepos = extractRepoMentions(mentionText, watchlist);
    if (mentionedRepos.length === 0) {
      return post;
    }

    return {
      ...post,
      mentionedRepos,
    };
  });
}
