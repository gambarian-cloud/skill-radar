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
    baselineStatus: "probation",
    maxCycles: 5,
    successMetric: "artifact-backed",
    successThreshold: 1,
    keepReason: "passed short-probation (1 actionable in 3 cycles) but 0 artifact-backed; promoted to regular probation 2026-03-21, must produce 1+ artifact-backed item by cycle 5 or remove",
  },
] as const;

export const SOURCE_RETUNE_CHECKS: SourceRetuneCheck[] = [
  {
    sourceId: "telegram-pavlenkodev",
    profileId: "telegram-pavlenko-auto",
    label: "Telegram Pavlenko Only",
    baselineStatus: "watch",
    deadline: "2026-03-15",
    condition: "disabled 2026-03-21: 0 actionable by deadline, source turned off in sources.ts",
  },
] as const;
