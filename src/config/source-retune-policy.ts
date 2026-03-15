export type RetuneBaselineStatus = "core" | "probation" | "short-probation" | "watch";

export interface RedditRetunePolicy {
  subreddit: string;
  label: string;
  baselineStatus: RetuneBaselineStatus;
  maxCycles?: number;
  successMetric?: "artifact-backed" | "watchlist-evidence" | "actionable";
  successThreshold?: number;
  keepReason: string;
}

export interface SourceRetuneCheck {
  sourceId: string;
  profileId: string;
  label: string;
  baselineStatus: RetuneBaselineStatus;
  deadline?: string;
  condition: string;
}

export const REDDIT_RETUNE_POLICIES: RedditRetunePolicy[] = [
  {
    subreddit: "ClaudeCode",
    label: "r/ClaudeCode",
    baselineStatus: "core",
    keepReason: "historically the strongest direct Claude Code community source",
  },
  {
    subreddit: "ClaudeAI",
    label: "r/ClaudeAI",
    baselineStatus: "core",
    keepReason: "currently the cleanest artifact-backed Reddit signal",
  },
  {
    subreddit: "codex",
    label: "r/codex",
    baselineStatus: "core",
    keepReason: "needed for Codex product reality and release reaction",
  },
  {
    subreddit: "LLMDevs",
    label: "r/LLMDevs",
    baselineStatus: "probation",
    maxCycles: 5,
    successMetric: "artifact-backed",
    successThreshold: 1,
    keepReason: "worth keeping only if it produces at least one artifact-backed item",
  },
  {
    subreddit: "OpenAI",
    label: "r/OpenAI",
    baselineStatus: "probation",
    maxCycles: 5,
    successMetric: "watchlist-evidence",
    successThreshold: 1,
    keepReason: "worth keeping only if it links to a GitHub watchlist repo",
  },
  {
    subreddit: "ChatGPTCoding",
    label: "r/ChatGPTCoding",
    baselineStatus: "short-probation",
    maxCycles: 3,
    successMetric: "actionable",
    successThreshold: 1,
    keepReason: "fast-fail experiment that must prove basic usefulness quickly",
  },
] as const;

export const SOURCE_RETUNE_CHECKS: SourceRetuneCheck[] = [
  {
    sourceId: "telegram-pavlenkodev",
    profileId: "telegram-pavlenko-auto",
    label: "Telegram Pavlenko Only",
    baselineStatus: "watch",
    deadline: "2026-03-15",
    condition: "disable if actionable stays at 0 by the deadline",
  },
] as const;
