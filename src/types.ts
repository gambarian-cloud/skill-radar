export type SourceKind = "telegram" | "github" | "x" | "reddit" | "web";
export type SourceRunMode = "auto" | "mock" | "live";
export type SourceTier = "origin" | "scout" | "explainer";
export type SourceCadenceClass = "daily" | "slower-cadence" | "watch";
export type Decision = "use-now" | "save-for-later" | "ignore";
export type ThemeCategory =
  | "agent-workflow"
  | "prompting-evals"
  | "frontend"
  | "security"
  | "deploy"
  | "tooling"
  | "automation";
export type AgentRuntime = "codex" | "claude-code";
export type SkillCatalogCategory = "project-owned" | "official" | "community";
export type SkillCatalogMaturity = "adopt-now" | "watch" | "experimental";
export type TrustedSkillSourceCategory = "official-catalog" | "community-catalog" | "community-repo" | "marketplace";
export type CorpusDocumentKind = "research-note" | "daily-digest" | "skill" | "project-doc";

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface TelegramApifyFieldAliases {
  externalId?: string[];
  text?: string[];
  publishedAt?: string[];
  url?: string[];
  author?: string[];
}

export interface TelegramLiveApifyConfig {
  provider: "apify-dataset" | "apify-actor-run";
  tokenEnvVar: string;
  datasetId?: string;
  actorId?: string;
  actorInput?: Record<string, unknown>;
  itemLimit?: number;
  fieldAliases?: TelegramApifyFieldAliases;
}

export interface TelegramLivePublicWebConfig {
  provider: "telegram-public-web";
  itemLimit?: number;
}

export type TelegramLiveConfig = TelegramLiveApifyConfig | TelegramLivePublicWebConfig;

export interface TelegramSourceConfig {
  id: string;
  kind: "telegram";
  enabled: boolean;
  label: string;
  tier: SourceTier;
  priority: number;
  freshnessHours?: number;
  cadenceClass?: SourceCadenceClass;
  channelRef: string;
  mock: {
    fixturePath: string;
  };
  live?: TelegramLiveConfig;
}

export interface GitHubRepoTarget {
  owner: string;
  repo: string;
  label?: string;
}

export interface GitHubLiveConfig {
  tokenEnvVar?: string;
  includeLatestRelease?: boolean;
}

export interface GitHubSourceConfig {
  id: string;
  kind: "github";
  enabled: boolean;
  label: string;
  tier: SourceTier;
  priority: number;
  freshnessHours?: number;
  cadenceClass?: SourceCadenceClass;
  watch: GitHubRepoTarget[];
  mock: {
    fixturePath: string;
  };
  live?: GitHubLiveConfig;
}

export interface XSourceConfig {
  id: string;
  kind: "x";
  enabled: boolean;
  label: string;
  tier: SourceTier;
  priority: number;
  freshnessHours?: number;
  cadenceClass?: SourceCadenceClass;
}

export interface RedditSubredditTarget {
  name: string;
  label?: string;
}

export interface RedditLiveConfig {
  listing?: "new";
  limitPerSubreddit?: number;
  userAgent?: string;
}

export interface RedditSourceConfig {
  id: string;
  kind: "reddit";
  enabled: boolean;
  label: string;
  tier: SourceTier;
  priority: number;
  freshnessHours?: number;
  cadenceClass?: SourceCadenceClass;
  watch: RedditSubredditTarget[];
  mock: {
    fixturePath: string;
  };
  live?: RedditLiveConfig;
}

export interface WebSourceConfig {
  id: string;
  kind: "web";
  enabled: boolean;
  label: string;
  tier: SourceTier;
  priority: number;
  freshnessHours?: number;
  cadenceClass?: SourceCadenceClass;
  mock: {
    fixturePath: string;
  };
  live?: {
    provider: "hn-algolia-search";
    queries: string[];
    tags?: string[];
    hitsPerPage?: number;
  };
}

export type SourceConfig =
  | TelegramSourceConfig
  | GitHubSourceConfig
  | XSourceConfig
  | RedditSourceConfig
  | WebSourceConfig;

export interface TrustedSkillSource {
  id: string;
  label: string;
  url: string;
  category: TrustedSkillSourceCategory;
  compatibility: AgentRuntime[];
  whyTrack: string;
  installHint: string;
}

export interface SkillCatalogEntry {
  id: string;
  label: string;
  summary: string;
  tags: string[];
  recommendedWhen: string[];
  compatibility: AgentRuntime[];
  maturity: SkillCatalogMaturity;
  sourceClass: SkillCatalogCategory;
  sourceUrl: string;
  evidenceUrls: string[];
  installHint?: string;
  localPath?: string;
}

export interface SkillLookupMatch {
  entry: SkillCatalogEntry;
  score: number;
  reasons: string[];
}

export interface CorpusDocument {
  id: string;
  kind: CorpusDocumentKind;
  path: string;
  title: string;
  text: string;
}

export interface CorpusLookupMatch {
  document: CorpusDocument;
  score: number;
  reasons: string[];
  snippet: string;
}

export interface LookupResult {
  catalogMatches: SkillLookupMatch[];
  corpusMatches: CorpusLookupMatch[];
  profile?: {
    selectedLenses: string[];
    riskAppetite: string;
    updatedAt: string;
  } | null;
}

export interface FeedbackRuleMatch {
  sourceId?: string;
  externalId?: string;
  dedupeKey?: string;
  urlContains?: string;
  repoFullName?: string;
  textIncludes?: string[];
}

export interface RankingFeedbackRule {
  id: string;
  description: string;
  match: FeedbackRuleMatch;
  scoreAdjustment?: number;
  decisionOverride?: Decision;
  projectOverride?: "Volcker Copilot" | "Signal Scout" | "none";
  urgencyOverride?: "today" | "this-week" | "backlog" | "none";
  note?: string;
}

export interface CrossSourceLink {
  fromPostId: string;
  toPostId: string;
  fromSourceId: string;
  toSourceId: string;
  linkType: "repo-mention" | "scout-corroboration";
  repoFullName: string;
}

export interface FetchContext {
  runMode: SourceRunMode;
  window: TimeWindow;
  now: Date;
}

export interface SourceNote {
  sourceId: string;
  message: string;
}

export interface RawSourcePost {
  sourceId: string;
  sourceLabel: string;
  sourceKind: SourceKind;
  sourceTier: SourceTier;
  sourcePriority: number;
  externalId: string;
  text: string;
  url?: string;
  author?: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

export interface FetchResult {
  posts: RawSourcePost[];
  modeUsed: "mock" | "live";
  notes: SourceNote[];
}

export interface NormalizedPost {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceKind: SourceKind;
  sourceTier: SourceTier;
  sourcePriority: number;
  externalId: string;
  url?: string;
  author?: string;
  publishedAt: string;
  text: string;
  shortSummary: string;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
  mentionedRepos?: string[];
}

export interface AnalysisResult {
  topic: string;
  decision: Decision;
  theme: ThemeCategory;
  relevanceScore: number;
  baseRelevanceScore: number;
  crossSourceAdjustment: number;
  crossSourceNotes: string[];
  scoreAdjustment: number;
  whyItMatters: string;
  suggestedNextAction: string;
  project: "Volcker Copilot" | "Signal Scout" | "none";
  urgency: "today" | "this-week" | "backlog" | "none";
  matchedSignals: string[];
  feedbackRuleIds: string[];
  feedbackNotes: string[];
  policyNotes?: string[];
  discussionCeilingDropped?: boolean;
}

export interface ScoredPost extends NormalizedPost {
  analysis: AnalysisResult;
}

export interface RunStats {
  totalFetched: number;
  droppedOutsideWindow: number;
  droppedNoise: number;
  droppedDuplicates: number;
  kept: number;
}

export interface SourceHealthSummary {
  sourceId: string;
  sourceLabel: string;
  sourceTier: SourceTier;
  modeUsed: "mock" | "live";
  freshnessHours?: number;
  cadenceClass?: SourceCadenceClass;
  fetched: number;
  latestPublishedAt?: string;
  kept: number;
  useNow: number;
  saveForLater: number;
  ignored: number;
}

export interface DailyDigestResult {
  reportPath: string;
  reportDate: string;
  stats: RunStats;
  posts: ScoredPost[];
  notes: SourceNote[];
  sourceModes: Record<string, "mock" | "live">;
  crossLinks: CrossSourceLink[];
  sourceHealth: SourceHealthSummary[];
  radarProfileSummary?: string;
  radarProfileFocus?: string;
}
