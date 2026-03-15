import type { CrossSourceLink, NormalizedPost } from "../types.ts";

function readRepoFullName(post: NormalizedPost): string | undefined {
  const repoFullName = post.metadata?.repoFullName;
  return typeof repoFullName === "string" ? repoFullName : undefined;
}

function normalizeRepoFullName(value: string): string | undefined {
  const trimmed = value.trim().replace(/^\/+|\/+$/gu, "");
  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(/^([a-z0-9][a-z0-9-]{0,38})\/([a-z0-9][a-z0-9._-]{0,99})$/iu);
  if (!match) {
    return undefined;
  }

  return `${match[1]}/${match[2]}`;
}

function extractRepoFromGitHubUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== "github.com" && hostname !== "www.github.com") {
      return undefined;
    }

    const [owner, repo] = url.pathname
      .split("/")
      .filter((segment) => segment.length > 0);
    if (!owner || !repo) {
      return undefined;
    }

    return normalizeRepoFullName(`${owner}/${repo}`);
  } catch {
    return undefined;
  }
}

function readStringList(metadata: Record<string, unknown> | undefined, key: string): string[] {
  const value = metadata?.[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function collectDynamicRepos(post: NormalizedPost): string[] {
  const repos = new Set<string>();
  const candidates = [
    post.url,
    typeof post.metadata?.outboundUrl === "string" ? post.metadata.outboundUrl : undefined,
    typeof post.metadata?.linkedUrl === "string" ? post.metadata.linkedUrl : undefined,
    ...readStringList(post.metadata, "outboundUrls"),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  for (const candidate of candidates) {
    const repoFullName = extractRepoFromGitHubUrl(candidate);
    if (repoFullName) {
      repos.add(repoFullName);
    }
  }

  const explicitRepo = readRepoFullName(post);
  if (explicitRepo) {
    const normalized = normalizeRepoFullName(explicitRepo);
    if (normalized) {
      repos.add(normalized);
    }
  }

  for (const repoFullName of post.mentionedRepos ?? []) {
    const normalized = normalizeRepoFullName(repoFullName);
    if (normalized) {
      repos.add(normalized);
    }
  }

  return [...repos];
}

export function buildCrossSourceLinks(posts: NormalizedPost[]): CrossSourceLink[] {
  const githubPostsByRepo = new Map<string, NormalizedPost[]>();
  const scoutPostsByRepo = new Map<string, NormalizedPost[]>();
  const links = new Map<string, CrossSourceLink>();

  for (const post of posts) {
    if (post.sourceKind !== "github") {
      continue;
    }

    const repoFullName = normalizeRepoFullName(readRepoFullName(post) ?? "")?.toLowerCase();
    if (!repoFullName) {
      continue;
    }

    const bucket = githubPostsByRepo.get(repoFullName) ?? [];
    bucket.push(post);
    githubPostsByRepo.set(repoFullName, bucket);
  }

  for (const post of posts) {
    if (post.sourceKind !== "github" && post.sourceTier === "scout") {
      for (const repoFullName of collectDynamicRepos(post)) {
        const bucket = scoutPostsByRepo.get(repoFullName.toLowerCase()) ?? [];
        bucket.push(post);
        scoutPostsByRepo.set(repoFullName.toLowerCase(), bucket);
      }
    }

    if (!post.mentionedRepos || post.mentionedRepos.length === 0) {
      continue;
    }

    for (const repoFullName of post.mentionedRepos) {
      const githubPosts = githubPostsByRepo.get(repoFullName.toLowerCase()) ?? [];
      for (const githubPost of githubPosts) {
        const key = `${post.id}:${githubPost.id}:${repoFullName.toLowerCase()}`;
        links.set(key, {
          fromPostId: post.id,
          toPostId: githubPost.id,
          fromSourceId: post.sourceId,
          toSourceId: githubPost.sourceId,
          linkType: "repo-mention",
          repoFullName,
        });
      }
    }
  }

  for (const [repoFullName, scoutPosts] of scoutPostsByRepo.entries()) {
    for (let leftIndex = 0; leftIndex < scoutPosts.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < scoutPosts.length; rightIndex += 1) {
        const left = scoutPosts[leftIndex];
        const right = scoutPosts[rightIndex];

        if (!left || !right || left.sourceId === right.sourceId) {
          continue;
        }

        const [fromPost, toPost] = left.id.localeCompare(right.id) <= 0 ? [left, right] : [right, left];
        const key = `${fromPost.id}:${toPost.id}:${repoFullName}:scout`;

        links.set(key, {
          fromPostId: fromPost.id,
          toPostId: toPost.id,
          fromSourceId: fromPost.sourceId,
          toSourceId: toPost.sourceId,
          linkType: "scout-corroboration",
          repoFullName,
        });
      }
    }
  }

  return [...links.values()];
}
