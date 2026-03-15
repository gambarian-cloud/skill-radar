import { readJsonFile } from "../lib/file-system.ts";
import type {
  FetchContext,
  FetchResult,
  GitHubRepoTarget,
  GitHubSourceConfig,
  RawSourcePost,
  SourceNote,
} from "../types.ts";

interface GitHubFixtureItem {
  id?: string;
  text: string;
  url?: string;
  author?: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

interface GitHubRepoApiResponse {
  html_url?: string;
  description?: string;
  pushed_at?: string;
  updated_at?: string;
  language?: string;
  topics?: string[];
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  subscribers_count?: number;
  archived?: boolean;
  disabled?: boolean;
}

interface GitHubReleaseApiResponse {
  html_url?: string;
  name?: string;
  tag_name?: string;
  body?: string;
  published_at?: string;
}

function buildHeaders(token: string | undefined): HeadersInit {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "signal-scout",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

function trimText(text: string | undefined, max = 220): string {
  if (!text) {
    return "";
  }

  const cleaned = text
    .replace(/ג€”|â€”|â€“/gu, "-")
    .replace(/�/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
  if (cleaned.length <= max) {
    return cleaned;
  }

  return `${cleaned.slice(0, max - 3).trimEnd()}...`;
}

function formatIsoDate(value: string | undefined): string {
  return value ? value.slice(0, 10) : "unknown";
}

function buildRepoText(
  target: GitHubRepoTarget,
  repo: GitHubRepoApiResponse,
  release: GitHubReleaseApiResponse | null,
): string {
  const repoName = `${target.owner}/${target.repo}`;
  const description = trimText(repo.description, 180) || "Community repository relevant to coding agents and developer workflows.";
  const topics = Array.isArray(repo.topics) && repo.topics.length > 0 ? repo.topics.join(", ") : "none";
  const releaseLabel = release?.tag_name ?? release?.name;
  const releaseText = releaseLabel
    ? ` Latest release: ${releaseLabel} (${formatIsoDate(release.published_at)}). ${trimText(release.body, 160)}`
    : "";

  return `${repoName}: ${description} Adoption signals: ${repo.stargazers_count ?? 0} stars, ${repo.forks_count ?? 0} forks, ${repo.open_issues_count ?? 0} open issues, ${repo.subscribers_count ?? 0} subscribers. Last push: ${formatIsoDate(repo.pushed_at)}. Language: ${repo.language ?? "unknown"}. Topics: ${topics}.${releaseText}`.trim();
}

function buildRepoPost(
  source: GitHubSourceConfig,
  target: GitHubRepoTarget,
  repo: GitHubRepoApiResponse,
  release: GitHubReleaseApiResponse | null,
): RawSourcePost {
  const repoName = `${target.owner}/${target.repo}`;
  const publishedAt = release?.published_at ?? repo.pushed_at ?? repo.updated_at ?? new Date().toISOString();
  const repoUrl = release?.html_url ?? repo.html_url ?? `https://github.com/${repoName}`;
  const repoDescription = trimText(repo.description, 180) || "Repository relevant to coding agents and developer workflows.";

  return {
    sourceId: source.id,
    sourceLabel: `${source.label}: ${target.label ?? repoName}`,
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId: `${repoName}:${publishedAt}`,
    text: buildRepoText(target, repo, release),
    url: repoUrl,
    author: target.owner,
    publishedAt,
    metadata: {
      repoFullName: repoName,
      repoLabel: target.label ?? repoName,
      repoDescription,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      subscribers: repo.subscribers_count ?? 0,
      pushedAt: repo.pushed_at ?? null,
      updatedAt: repo.updated_at ?? null,
      language: repo.language ?? null,
      topics: repo.topics ?? [],
      archived: repo.archived ?? false,
      disabled: repo.disabled ?? false,
      releaseTag: release?.tag_name ?? null,
      releasePublishedAt: release?.published_at ?? null,
    },
  };
}

async function fetchRepo(target: GitHubRepoTarget, token: string | undefined): Promise<GitHubRepoApiResponse> {
  const response = await fetch(`https://api.github.com/repos/${target.owner}/${target.repo}`, {
    headers: buildHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`GitHub repo request failed for ${target.owner}/${target.repo}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GitHubRepoApiResponse;
}

async function fetchLatestRelease(
  target: GitHubRepoTarget,
  token: string | undefined,
  includeLatestRelease: boolean,
): Promise<GitHubReleaseApiResponse | null> {
  if (!includeLatestRelease) {
    return null;
  }

  const response = await fetch(`https://api.github.com/repos/${target.owner}/${target.repo}/releases/latest`, {
    headers: buildHeaders(token),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub latest release request failed for ${target.owner}/${target.repo}: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as GitHubReleaseApiResponse;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isGitHubRateLimitError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("rate limit") || message.includes("403");
}

function getFixtureSourceLabel(source: GitHubSourceConfig, metadata: Record<string, unknown> | undefined): string {
  const repoLabel = typeof metadata?.repoLabel === "string"
    ? metadata.repoLabel
    : typeof metadata?.repoFullName === "string"
      ? metadata.repoFullName
      : undefined;

  return repoLabel ? `${source.label}: ${repoLabel}` : source.label;
}

async function fetchFromMock(source: GitHubSourceConfig): Promise<FetchResult> {
  const fixture = await readJsonFile<GitHubFixtureItem[]>(source.mock.fixturePath);
  const posts: RawSourcePost[] = fixture.map((item, index) => ({
    sourceId: source.id,
    sourceLabel: getFixtureSourceLabel(source, item.metadata),
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId: item.id ?? `${source.id}-mock-${index + 1}`,
    text: item.text,
    url: item.url,
    author: item.author,
    publishedAt: item.publishedAt,
    metadata: item.metadata,
  }));

  return {
    posts,
    modeUsed: "mock",
    notes: [
      {
        sourceId: source.id,
        message: "Using local mock fixture for GitHub watchlist activity.",
      },
    ],
  };
}

async function fetchLive(source: GitHubSourceConfig): Promise<FetchResult> {
  const token = source.live?.tokenEnvVar ? process.env[source.live.tokenEnvVar] : undefined;
  const includeLatestRelease = source.live?.includeLatestRelease ?? true;
  const posts: RawSourcePost[] = [];
  const notes: SourceNote[] = [];

  for (const target of source.watch) {
    const repoName = `${target.owner}/${target.repo}`;

    try {
      const repo = await fetchRepo(target, token);
      const release = await fetchLatestRelease(target, token, includeLatestRelease);
      posts.push(buildRepoPost(source, target, repo, release));
    } catch (error: unknown) {
      notes.push({
        sourceId: source.id,
        message: `Skipped ${repoName}: ${getErrorMessage(error)}`,
      });

      if (isGitHubRateLimitError(error)) {
        notes.push({
          sourceId: source.id,
          message: `GitHub API rate limit hit after ${posts.length} successful watchlist item(s). Add GITHUB_TOKEN in .env.local for stable live runs.`,
        });
        break;
      }
    }
  }

  if (posts.length === 0) {
    throw new Error(notes[0]?.message ?? "GitHub live fetch produced no watchlist items.");
  }

  notes.unshift({
    sourceId: source.id,
    message: token
      ? `Fetched ${posts.length} GitHub watchlist item(s) using authenticated API access.`
      : `Fetched ${posts.length} GitHub watchlist item(s) using public unauthenticated API access.`,
  });

  return {
    posts,
    modeUsed: "live",
    notes,
  };
}

export async function fetchGitHubPosts(
  source: GitHubSourceConfig,
  context: FetchContext,
): Promise<FetchResult> {
  if (context.runMode === "mock") {
    return fetchFromMock(source);
  }

  if (context.runMode === "live") {
    return fetchLive(source);
  }

  try {
    return await fetchLive(source);
  } catch {
    return fetchFromMock(source);
  }
}


