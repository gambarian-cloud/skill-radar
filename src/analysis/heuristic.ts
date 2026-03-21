import { isArtifactEvidenceUrl } from "./artifact-evidence.ts";
import { isCriticalRuntimeFailure } from "./failure-signals.ts";
import { DIRECT_SIGNAL_KEYWORDS, STACK_KEYWORDS, THEME_KEYWORDS } from "../config/interest-profile.ts";
import { buildLensSearchTerms, getActiveRadarLenses, type RadarProfile } from "../config/radar-profile.ts";
import type {
  AnalysisResult,
  CrossSourceLink,
  Decision,
  NormalizedPost,
  RankingFeedbackRule,
  ScoredPost,
  ScoringTraceStep,
  ThemeCategory,
} from "../types.ts";

const THEME_PRIORITY: ThemeCategory[] = [
  "agent-workflow",
  "prompting-evals",
  "security",
  "automation",
  "frontend",
  "deploy",
  "tooling",
];

function countMatches(text: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => text.includes(keyword));
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function readNumberMetadata(metadata: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === "number" ? value : undefined;
}

function readBooleanMetadata(metadata: Record<string, unknown> | undefined, key: string): boolean | undefined {
  const value = metadata?.[key];
  return typeof value === "boolean" ? value : undefined;
}

function readStringMetadata(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

function hasRecentIsoDate(value: string | undefined, maxDays: number): boolean {
  if (!value) {
    return false;
  }

  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return false;
  }

  const ageMs = Date.now() - time;
  if (ageMs < 0) {
    return true;
  }

  return ageMs <= maxDays * 24 * 60 * 60 * 1000;
}

function hasArtifactEvidence(post: NormalizedPost): boolean {
  const outboundUrl = readStringMetadata(post.metadata, "outboundUrl")?.toLowerCase();
  const linkedUrl = readStringMetadata(post.metadata, "linkedUrl")?.toLowerCase();

  return (post.mentionedRepos?.length ?? 0) > 0
    || (post.url?.toLowerCase().includes("github.com/") ?? false)
    || isArtifactEvidenceUrl(outboundUrl)
    || isArtifactEvidenceUrl(linkedUrl);
}

function selectTheme(text: string): { theme: ThemeCategory; matches: string[] } {
  let bestTheme: ThemeCategory = "tooling";
  let bestScore = -1;
  let bestMatches: string[] = [];

  for (const theme of THEME_PRIORITY) {
    const matches = countMatches(text, THEME_KEYWORDS[theme]);
    let score = matches.length;

    if (theme === "security" && (text.includes("server-only") || text.includes("leak") || text.includes("browser bundle") || text.includes("exposure") || text.includes("sandbox"))) {
      score += 2;
    }

    if (theme === "automation" && (text.includes("telegram") || text.includes("apify") || text.includes("automations") || text.includes("pipeline"))) {
      score += 2;
    }

    if (score > bestScore) {
      bestTheme = theme;
      bestScore = score;
      bestMatches = matches;
    }
  }

  return { theme: bestTheme, matches: bestMatches };
}

function inferTopic(theme: ThemeCategory, text: string): string {
  switch (theme) {
    case "agent-workflow":
      return text.includes("skill") || text.includes("agent") ? "Reusable agent skills and workflow design" : "Agent workflow pattern";
    case "prompting-evals":
      return "Prompt reliability and eval discipline";
    case "frontend":
      return "Next.js and React implementation pattern";
    case "security":
      return "Security boundary for model-powered applications";
    case "deploy":
      return "Deployment and preview-release hygiene";
    case "automation":
      return "Automation pipeline and source ingestion pattern";
    case "tooling":
    default:
      return "Developer tooling pattern";
  }
}

function pickProject(theme: ThemeCategory, text: string): "Volcker Copilot" | "Signal Scout" | "none" {
  if (theme === "automation" && (text.includes("telegram") || text.includes("apify") || text.includes("dataset") || text.includes("scraping") || text.includes("ingestion"))) {
    return "Signal Scout";
  }

  if (
    theme === "agent-workflow" ||
    theme === "prompting-evals" ||
    theme === "frontend" ||
    theme === "security" ||
    theme === "deploy" ||
    text.includes("next.js") ||
    text.includes("vercel") ||
    text.includes("codex") ||
    text.includes("claude code")
  ) {
    return "Volcker Copilot";
  }

  return "none";
}

function scoreSourceContext(post: NormalizedPost, text: string): number {
  let score = 0;

  if (post.sourceTier === "scout") {
    score += 5;
  } else if (post.sourceTier === "origin") {
    score += 3;
  } else {
    score -= 4;
  }

  if (post.sourcePriority <= 1) {
    score += 3;
  } else if (post.sourcePriority <= 3) {
    score += 1;
  }

  if (
    post.sourceTier === "scout" &&
    (text.includes("github") ||
      text.includes("repo") ||
      text.includes("readme") ||
      text.includes("issue") ||
      text.includes("discussion") ||
      text.includes("open source") ||
      text.includes("oss") ||
      text.includes("release") ||
      text.includes("open-source"))
  ) {
    score += 6;
  }

  if (
    post.sourceTier === "origin" &&
    (text.includes("docs") || text.includes("announcement") || text.includes("release") || text.includes("help center"))
  ) {
    score += 2;
  }

  return score;
}

function scoreGitHubAdoptionSignals(post: NormalizedPost): number {
  if (post.sourceKind !== "github") {
    return 0;
  }

  const stars = readNumberMetadata(post.metadata, "stars") ?? 0;
  const forks = readNumberMetadata(post.metadata, "forks") ?? 0;
  const subscribers = readNumberMetadata(post.metadata, "subscribers") ?? 0;
  const openIssues = readNumberMetadata(post.metadata, "openIssues") ?? 0;
  const releaseTag = typeof post.metadata?.releaseTag === "string" ? post.metadata.releaseTag : null;
  const releasePublishedAt = readStringMetadata(post.metadata, "releasePublishedAt");
  const archived = readBooleanMetadata(post.metadata, "archived") ?? false;
  const disabled = readBooleanMetadata(post.metadata, "disabled") ?? false;

  let score = 0;

  if (stars >= 50_000) {
    score += 6;
  } else if (stars >= 10_000) {
    score += 5;
  } else if (stars >= 5_000) {
    score += 4;
  } else if (stars >= 1_000) {
    score += 3;
  } else if (stars >= 250) {
    score += 1;
  }

  if (forks >= 5_000) {
    score += 3;
  } else if (forks >= 1_000) {
    score += 2;
  } else if (forks >= 250) {
    score += 1;
  }

  if (subscribers >= 500) {
    score += 2;
  } else if (subscribers >= 100) {
    score += 1;
  }

  if (stars >= 10_000 && openIssues >= 500) {
    score += 2;
  } else if (stars >= 1_000 && openIssues >= 100) {
    score += 1;
  }

  if (releaseTag) {
    score += 2;
    if (hasRecentIsoDate(releasePublishedAt, 14)) {
      score += 2;
    }
  }

  if (archived || disabled) {
    score -= 12;
  }

  return score;
}

function scoreHackerNewsSignals(post: NormalizedPost): number {
  if (post.sourceKind !== "web" || readStringMetadata(post.metadata, "provider") !== "hn-algolia-search") {
    return 0;
  }

  const points = readNumberMetadata(post.metadata, "points") ?? 0;
  const comments = readNumberMetadata(post.metadata, "comments") ?? 0;
  const title = (readStringMetadata(post.metadata, "title") ?? post.shortSummary).toLowerCase();
  const query = (readStringMetadata(post.metadata, "query") ?? "").toLowerCase();

  let score = -18;

  if (points >= 100) {
    score += 6;
  } else if (points >= 50) {
    score += 4;
  } else if (points >= 20) {
    score += 2;
  } else if (points >= 10) {
    score += 1;
  }

  if (comments >= 80) {
    score += 6;
  } else if (comments >= 40) {
    score += 4;
  } else if (comments >= 15) {
    score += 2;
  } else if (comments >= 5) {
    score += 1;
  }

  if (points <= 2 && comments <= 1) {
    score -= 20;
  } else if (points <= 5 && comments <= 2) {
    score -= 12;
  }

  if (title.startsWith("show hn:")) {
    score -= 12;
  } else if (title.startsWith("ask hn:")) {
    score -= 6;
  }

  if (post.mentionedRepos && post.mentionedRepos.length > 0) {
    score += 12;
  }

  if (
    title.includes("openai/skills") ||
    title.includes("anthropics/skills") ||
    title.includes("vercel-labs/agent-skills") ||
    title.includes("obra/superpowers") ||
    title.includes("aider")
  ) {
    score += 5;
  }

  if (query.includes("agents.md") || title.includes("agents.md")) {
    score += 2;
  }

  return score;
}

function scoreRedditSignals(post: NormalizedPost): number {
  if (post.sourceKind !== "reddit" || readStringMetadata(post.metadata, "provider") !== "reddit-json-listing") {
    return 0;
  }

  const scoreValue = readNumberMetadata(post.metadata, "score") ?? 0;
  const comments = readNumberMetadata(post.metadata, "comments") ?? 0;
  const flair = (readStringMetadata(post.metadata, "flair") ?? "").toLowerCase();
  const isCrosspost = readBooleanMetadata(post.metadata, "isCrosspost") ?? false;

  let score = -8;

  if (scoreValue >= 50) {
    score += 5;
  } else if (scoreValue >= 20) {
    score += 4;
  } else if (scoreValue >= 10) {
    score += 3;
  } else if (scoreValue >= 3) {
    score += 1;
  }

  if (comments >= 30) {
    score += 5;
  } else if (comments >= 10) {
    score += 4;
  } else if (comments >= 5) {
    score += 2;
  } else if (comments >= 2) {
    score += 1;
  }

  if (post.mentionedRepos && post.mentionedRepos.length > 0) {
    score += 8;
  }

  if (flair.includes("humor")) {
    score -= 12;
  } else if (flair.includes("question")) {
    score -= 2;
  }

  if (isCrosspost) {
    score -= 4;
  }

  return score;
}

function decisionFromScore(score: number): Decision {
  return score >= 75 ? "use-now" : score >= 50 ? "save-for-later" : "ignore";
}

function inferUrgency(score: number, decision: AnalysisResult["decision"]): AnalysisResult["urgency"] {
  if (decision === "ignore") {
    return "none";
  }

  if (decision === "save-for-later") {
    return score >= 60 ? "this-week" : "backlog";
  }

  if (score >= 80) {
    return "today";
  }

  if (score >= 60) {
    return "this-week";
  }

  return "backlog";
}

function buildWhyItMatters(project: AnalysisResult["project"], matches: string[]): string {
  const matchLabel = matches.length > 0 ? matches.slice(0, 3).join(", ") : "general developer workflow";
  if (project === "Signal Scout") {
    return `This affects how Signal Scout should ingest and normalize sources. It maps directly to ${matchLabel}.`;
  }

  if (project === "Volcker Copilot") {
    return `This maps onto the current Volcker Copilot stack and workflow. The strongest signals are ${matchLabel}.`;
  }

  return "This is adjacent to the team interests, but it does not map tightly to the current build plan.";
}

function buildGitHubWhyItMatters(
  post: NormalizedPost,
  project: AnalysisResult["project"],
  matches: string[],
): string | undefined {
  if (post.sourceKind !== "github") {
    return undefined;
  }

  const repoFullName = readStringMetadata(post.metadata, "repoFullName")?.toLowerCase();
  const projectName = projectLabel(project);
  const matchLabel = matches.length > 0 ? matches.slice(0, 3).join(", ") : "agent workflow";

  switch (repoFullName) {
    case "openai/skills":
      return `This is official Codex capability truth for reusable skills. It matters if ${projectName} needs a Codex-native baseline instead of community guesses.`;
    case "anthropics/skills":
      return `This is official Claude capability truth for reusable skills and plugin patterns. It matters if ${projectName} needs a Claude-native baseline instead of second-hand advice.`;
    case "vercel-labs/agent-skills":
      return `This is strong community practice truth for agent skills with direct Next.js and React overlap. It maps tightly to ${projectName} because of ${matchLabel}.`;
    case "vercel-labs/skills":
      return `This repo sits in the shared Codex plus Claude ecosystem. It matters when ${projectName} needs a cross-tool installation or skill-discovery pattern.`;
    case "obra/superpowers":
      return `This is a high-signal practitioner workflow pack. It matters when ${projectName} needs sharper patterns for debugging, worktrees, planning, or TDD.`;
    case "openai/codex":
      return `This is official Codex product truth. It matters when ${projectName} needs to align with real Codex workflows, approvals, and repository boundaries.`;
    case "openai/symphony":
      return `This matters only if ${projectName} is moving toward orchestration or multi-agent coordination instead of single-agent workflows.`;
    case "apify/agent-skills":
      return `This is more relevant to automation and extraction workflows than the current ${projectName} build plan. It is useful mainly as infrastructure reference.`;
    case "shanraisshan/claude-code-best-practice":
      return `This is practitioner guidance for Claude workflow discipline. It matters if ${projectName} needs a sharper Claude operating baseline, not just more tools.`;
    case "aider-ai/aider":
      return `This matters as practice truth for repo-map and large-codebase agent ergonomics. It is relevant if ${projectName} starts hitting navigation or editing friction.`;
    case "phuryn/pm-skills":
      return `This is not same-day implementation guidance, but it is strong packaging reference for turning repeated workflows into reusable skills.`;
    default:
      return post.sourceTier === "origin"
        ? `This is source-of-truth capability evidence for ${projectName}. The strongest signals are ${matchLabel}.`
        : `This is practice-truth evidence for ${projectName}. The strongest signals are ${matchLabel}.`;
  }
}

function projectLabel(project: AnalysisResult["project"]): string {
  return project === "none" ? "the current project" : project;
}

function buildGitHubSuggestedAction(
  post: NormalizedPost,
  decision: AnalysisResult["decision"],
  project: AnalysisResult["project"],
): string | undefined {
  if (post.sourceKind !== "github" || decision === "ignore") {
    return undefined;
  }

  const repoFullName = readStringMetadata(post.metadata, "repoFullName");
  const repoDescription = readStringMetadata(post.metadata, "repoDescription");
  const repoText = `${repoFullName ?? ""} ${repoDescription ?? ""}`.toLowerCase();
  const targetProject = projectLabel(project);
  const repoLabel = repoFullName ?? "this repo";

  if (repoText.includes("pm-skills")) {
    return `Mine ${repoLabel} for packaging ideas, but only adopt a skill if it clearly fits the current ${targetProject} workflow.`;
  }

  if (repoText.includes("claude-code-best-practice") || repoText.includes("claude code")) {
    return `Extract one concrete Claude Code rule from ${repoLabel} and compare it against the current ${targetProject} baseline before adopting more.`;
  }

  if (repoText.includes("aider")) {
    return `Compare ${repoLabel} against the current ${targetProject} edit loop and copy only one repo-map or terminal workflow if it removes friction.`;
  }

  if (repoText.includes("symphony") || repoText.includes("multi-agent") || repoText.includes("orchestration")) {
    return `Treat ${repoLabel} as orchestration research for ${targetProject}; review it only if parallel agent coordination becomes a live requirement.`;
  }

  if (repoText.includes("codex")) {
    return `Review whether ${repoLabel} exposes one Codex workflow worth folding into the current ${targetProject} baseline.`;
  }

  if (repoText.includes("claude")) {
    return `Review whether ${repoLabel} exposes one Claude workflow worth folding into the current ${targetProject} baseline.`;
  }

  if (repoText.includes("skill")) {
    return `Review whether ${repoLabel} contains one reusable skill worth adopting into the current ${targetProject} baseline.`;
  }

  return `Capture one concrete workflow from ${repoLabel} and compare it against the current ${targetProject} baseline before adopting anything.`;
}

function buildSuggestedAction(
  post: NormalizedPost,
  theme: ThemeCategory,
  decision: AnalysisResult["decision"],
  project: AnalysisResult["project"],
): string {
  if (decision === "ignore") {
    return "Skip for now. No immediate action.";
  }

  const githubAction = buildGitHubSuggestedAction(post, decision, project);
  if (githubAction) {
    return githubAction;
  }

  switch (theme) {
    case "agent-workflow":
      return `Test the workflow pattern in ${project} by turning one repeated manual step into a scripted or skill-based flow.`;
    case "prompting-evals":
      return `Add or refine a small eval case in ${project} and compare behavior before the next prompt or tool change.`;
    case "frontend":
      return `Save the pattern for the next frontend touchpoint in ${project} rather than interrupting current work.`;
    case "security":
      return `Review the current key and permission boundaries in ${project} and close any browser-side exposure quickly.`;
    case "deploy":
      return `Wire the idea into preview deployment checks in ${project}, ideally with a lightweight smoke eval.`;
    case "automation":
      return `Apply the ingestion pattern in ${project} and keep the source adapter pluggable instead of hardcoding Telegram assumptions.`;
    case "tooling":
    default:
      return `Capture the idea in the backlog for ${project} and only pull it in if it removes friction in the next build step.`;
  }
}

function buildBaseAnalysis(post: NormalizedPost): AnalysisResult {
  const normalizedText = post.text.toLowerCase();
  const { theme, matches: themeMatches } = selectTheme(normalizedText);
  const stackMatches = countMatches(normalizedText, STACK_KEYWORDS);
  const directMatches = countMatches(normalizedText, DIRECT_SIGNAL_KEYWORDS);

  const trace: ScoringTraceStep[] = [];
  let score = 12;
  trace.push({ label: "base", delta: 12, running: score });

  const themeDelta = themeMatches.length * 9;
  if (themeDelta > 0) {
    score += themeDelta;
    trace.push({ label: "theme-matches", delta: themeDelta, running: score, reason: themeMatches.slice(0, 3).join(", ") });
  }

  const stackDelta = stackMatches.length * 6;
  if (stackDelta > 0) {
    score += stackDelta;
    trace.push({ label: "stack-matches", delta: stackDelta, running: score, reason: stackMatches.slice(0, 3).join(", ") });
  }

  const directDelta = directMatches.length * 5;
  if (directDelta > 0) {
    score += directDelta;
    trace.push({ label: "direct-signal", delta: directDelta, running: score, reason: directMatches.slice(0, 3).join(", ") });
  }

  const srcDelta = scoreSourceContext(post, normalizedText);
  if (srcDelta !== 0) {
    score += srcDelta;
    trace.push({ label: "source-context", delta: srcDelta, running: score, reason: `${post.sourceTier}/${post.sourceKind}` });
  }

  const ghDelta = scoreGitHubAdoptionSignals(post);
  if (ghDelta !== 0) {
    score += ghDelta;
    trace.push({ label: "github-adoption", delta: ghDelta, running: score });
  }

  const hnDelta = scoreHackerNewsSignals(post);
  if (hnDelta !== 0) {
    score += hnDelta;
    trace.push({ label: "hn-signals", delta: hnDelta, running: score });
  }

  const redditDelta = scoreRedditSignals(post);
  if (redditDelta !== 0) {
    score += redditDelta;
    trace.push({ label: "reddit-signals", delta: redditDelta, running: score });
  }

  if (normalizedText.includes("volcker") || normalizedText.includes("next.js") || normalizedText.includes("vercel")) {
    score += 6;
    trace.push({ label: "project-keyword", delta: 6, running: score, reason: "volcker/next.js/vercel" });
  }

  if (normalizedText.includes("try") || normalizedText.includes("pattern") || normalizedText.includes("worth") || normalizedText.includes("useful") || normalizedText.includes("recommended")) {
    score += 4;
    trace.push({ label: "actionable-language", delta: 4, running: score });
  }

  if (themeMatches.length >= 3) {
    score += 8;
    trace.push({ label: "theme-depth-bonus", delta: 8, running: score, reason: `${themeMatches.length} theme matches` });
  }

  if (theme === "security" && (normalizedText.includes("leak") || normalizedText.includes("server-only") || normalizedText.includes("sandbox") || normalizedText.includes("exposure"))) {
    score += 14;
    trace.push({ label: "security-boost", delta: 14, running: score });
  }

  if (theme === "automation" && (normalizedText.includes("telegram") || normalizedText.includes("apify") || normalizedText.includes("automations") || normalizedText.includes("webhook") || normalizedText.includes("pipeline"))) {
    score += 14;
    trace.push({ label: "automation-boost", delta: 14, running: score });
  }

  if (theme === "agent-workflow" && (normalizedText.includes("claude code") || normalizedText.includes("codex") || normalizedText.includes("agents.md") || normalizedText.includes("skill"))) {
    score += 10;
    trace.push({ label: "agent-workflow-boost", delta: 10, running: score });
  }

  if (theme === "prompting-evals" && (normalizedText.includes("eval") || normalizedText.includes("context mode") || normalizedText.includes("text-to-sql"))) {
    score += 10;
    trace.push({ label: "eval-boost", delta: 10, running: score });
  }

  if (normalizedText.includes("not urgent") || normalizedText.includes("worth saving") || normalizedText.includes("save") || normalizedText.includes("low priority")) {
    score -= 10;
    trace.push({ label: "low-priority-penalty", delta: -10, running: score });
  }

  const clampedScore = clamp(score);
  if (clampedScore !== score) {
    trace.push({ label: "clamp", delta: clampedScore - score, running: clampedScore, reason: `clamped from ${score}` });
  }

  const decision = decisionFromScore(clampedScore);
  const project = pickProject(theme, normalizedText);
  const urgency = inferUrgency(clampedScore, decision);
  const matchedSignals = [...new Set([...themeMatches, ...stackMatches, ...directMatches])];
  const whyItMatters = buildGitHubWhyItMatters(post, project, matchedSignals) ?? buildWhyItMatters(project, matchedSignals);

  return {
    topic: inferTopic(theme, normalizedText),
    decision,
    theme,
    relevanceScore: clampedScore,
    baseRelevanceScore: clampedScore,
    crossSourceAdjustment: 0,
    crossSourceNotes: [],
    scoreAdjustment: 0,
    whyItMatters,
    suggestedNextAction: buildSuggestedAction(post, theme, decision, project),
    project,
    urgency,
    matchedSignals,
    feedbackRuleIds: [],
    feedbackNotes: [],
    scoringTrace: trace,
  };
}

function appendTrace(analysis: AnalysisResult, step: ScoringTraceStep): void {
  if (analysis.scoringTrace) {
    analysis.scoringTrace.push(step);
  }
}

function applyScoutGuardrails(post: NormalizedPost, analysis: AnalysisResult): AnalysisResult {
  const hasRepoEvidence = hasArtifactEvidence(post);

  if (post.sourceKind === "web" && readStringMetadata(post.metadata, "provider") === "hn-algolia-search") {
    if (hasRepoEvidence || analysis.decision !== "use-now") {
      return analysis;
    }

    const result = {
      ...analysis,
      decision: "save-for-later" as const,
      urgency: inferUrgency(analysis.relevanceScore, "save-for-later"),
      whyItMatters: `${analysis.whyItMatters} This is discussion signal without direct repo evidence, so it should not drive same-day action on its own.`,
    };
    appendTrace(result, { label: "guardrail-hn-cap", delta: 0, running: result.relevanceScore, reason: "HN discussion without repo evidence" });
    return result;
  }

  if (post.sourceKind === "reddit" && readStringMetadata(post.metadata, "provider") === "reddit-json-listing") {
    const criticalFailure = isCriticalRuntimeFailure(post.text.toLowerCase());

    if (hasRepoEvidence || criticalFailure) {
      return analysis;
    }

    const cappedScore = Math.min(analysis.relevanceScore, 75);
    const decision = analysis.decision === "ignore" ? "ignore" as const : "save-for-later" as const;
    const delta = cappedScore - analysis.relevanceScore;

    const result = {
      ...analysis,
      relevanceScore: cappedScore,
      decision,
      urgency: inferUrgency(cappedScore, decision),
      whyItMatters: `${analysis.whyItMatters} This is useful discussion signal, but without direct repo evidence it should top out at 'save this week' unless it reports a real breaking change.`,
    };
    appendTrace(result, { label: "guardrail-reddit-cap", delta, running: cappedScore, reason: "Reddit discussion without repo evidence" });
    return result;
  }

  return analysis;
}

function applySourceSpecificActionCaps(
  post: NormalizedPost,
  analysis: AnalysisResult,
  crossLinks: CrossSourceLink[],
): AnalysisResult {
  if (post.sourceKind === "telegram" && post.sourceTier === "scout") {
    const hasGitHubWatchlistConfirmation = crossLinks.some(
      (link) => link.linkType === "repo-mention" && link.fromPostId === post.id,
    );
    const criticalFailure = isCriticalRuntimeFailure(post.text.toLowerCase());

    if (
      hasGitHubWatchlistConfirmation
      || criticalFailure
      || analysis.theme === "security"
      || analysis.decision === "ignore"
    ) {
      return analysis;
    }

    const cappedScore = Math.min(analysis.relevanceScore, 80);
    const delta = cappedScore - analysis.relevanceScore;

    const result = {
      ...analysis,
      relevanceScore: cappedScore,
      decision: "save-for-later" as const,
      urgency: inferUrgency(cappedScore, "save-for-later"),
      whyItMatters: `${analysis.whyItMatters} Telegram scout signal should top out at 'save this week' until a watched GitHub artifact confirms it.`,
    };
    if (delta !== 0) {
      appendTrace(result, { label: "telegram-cap", delta, running: cappedScore, reason: "unconfirmed scout signal" });
    }
    return result;
  }

  return analysis;
}

function applyRadarProfileFocus(
  post: NormalizedPost,
  analysis: AnalysisResult,
  profile: RadarProfile | null,
): AnalysisResult {
  const activeLenses = getActiveRadarLenses(profile);
  if (activeLenses.length === 0) {
    return analysis;
  }

  const text = `${post.text} ${post.shortSummary}`.toLowerCase();
  let bestLensLabel: string | undefined;
  let bestMatches: string[] = [];

  for (const lens of activeLenses) {
    const matches = countMatches(text, buildLensSearchTerms(lens));
    if (matches.length > bestMatches.length) {
      bestMatches = matches;
      bestLensLabel = lens.label;
    }
  }

  if (!bestLensLabel || bestMatches.length === 0) {
    return analysis;
  }

  // Respect guardrail caps: if a guardrail already capped the score,
  // radar lens records the match but does not boost above the capped score.
  const guardrailCapped = (analysis.scoringTrace ?? []).some(
    (step) => step.label.startsWith("guardrail-"),
  );

  if (guardrailCapped) {
    const result = {
      ...analysis,
      policyNotes: [
        ...(analysis.policyNotes ?? []),
        `Active radar lens ${bestLensLabel} matched ${bestMatches.slice(0, 3).join(", ")} (boost suppressed: guardrail cap active).`,
      ],
    };
    appendTrace(result, { label: "radar-lens", delta: 0, running: analysis.relevanceScore, reason: `lens: ${bestLensLabel} (suppressed by guardrail)` });
    return result;
  }

  const boost = Math.min(12, bestMatches.length * 4);
  const adjustedScore = clamp(analysis.relevanceScore + boost);
  const decision = decisionFromScore(adjustedScore);
  const urgency = inferUrgency(adjustedScore, decision);

  const result = {
    ...analysis,
    relevanceScore: adjustedScore,
    decision,
    urgency,
    policyNotes: [
      ...(analysis.policyNotes ?? []),
      `Active radar lens ${bestLensLabel} matched ${bestMatches.slice(0, 3).join(", ")}.`,
    ],
  };
  appendTrace(result, { label: "radar-lens", delta: boost, running: adjustedScore, reason: `lens: ${bestLensLabel}` });
  return result;
}

function applyCrossSourceCorroboration(
  post: NormalizedPost,
  analysis: AnalysisResult,
  crossLinks: CrossSourceLink[],
): AnalysisResult {
  const outgoingRepoLinks = crossLinks.filter((link) => link.linkType === "repo-mention" && link.fromPostId === post.id);
  const incomingRepoLinks = crossLinks.filter((link) => link.linkType === "repo-mention" && link.toPostId === post.id);
  const scoutCorroborationLinks = crossLinks.filter(
    (link) => link.linkType === "scout-corroboration" && (link.fromPostId === post.id || link.toPostId === post.id),
  );
  const corroboratedRepos = [...new Set([...outgoingRepoLinks, ...incomingRepoLinks].map((link) => link.repoFullName))];
  let adjustment = 0;
  const notes: string[] = [];

  if (post.sourceTier === "scout" && post.sourceKind !== "github" && outgoingRepoLinks.length > 0) {
    adjustment += 4;
    notes.push(
      corroboratedRepos.length > 1
        ? `Direct repo evidence from ${corroboratedRepos.length} watched repos.`
        : `Direct repo evidence from watched repo ${corroboratedRepos[0]}.`,
    );
  }

  if (post.sourceTier === "scout" && post.sourceKind !== "github" && scoutCorroborationLinks.length > 0) {
    const corroboratingSources = new Set(
      scoutCorroborationLinks.map((link) => (link.fromPostId === post.id ? link.toSourceId : link.fromSourceId)),
    );

    adjustment += corroboratingSources.size >= 2 ? 6 : 4;
    notes.push(
      corroboratingSources.size >= 2
        ? `Also surfaced by ${corroboratingSources.size} other scout sources.`
        : "Also surfaced by another scout source.",
    );
  }

  if (post.sourceKind === "github") {
    if (incomingRepoLinks.length > 0) {
      const scoutSources = new Set(incomingRepoLinks.map((link) => link.fromSourceId));

      adjustment += scoutSources.size >= 2 ? 10 : incomingRepoLinks.length >= 2 ? 8 : 6;
      notes.push(
        scoutSources.size >= 2
          ? `Surfaced by ${incomingRepoLinks.length} scout mentions across ${scoutSources.size} trusted sources.`
          : incomingRepoLinks.length >= 2
            ? "Surfaced repeatedly by the same trusted scout source."
            : "Surfaced by a trusted scout source.",
      );
    } else {
      adjustment -= 5;
      notes.push("GitHub watchlist item without scout corroboration yet.");
    }
  }

  if (adjustment === 0) {
    return analysis;
  }

  // Use post-guardrail relevanceScore, not baseRelevanceScore, so corroboration
  // cannot undo scout guardrail caps (e.g. HN/Reddit score ceilings).
  const adjustedScore = clamp(analysis.relevanceScore + adjustment);
  const decision = decisionFromScore(adjustedScore);
  const urgency = inferUrgency(adjustedScore, decision);

  const result = {
    ...analysis,
    relevanceScore: adjustedScore,
    crossSourceAdjustment: adjustment,
    crossSourceNotes: notes,
    decision,
    urgency,
  };
  appendTrace(result, { label: "cross-source", delta: adjustment, running: adjustedScore, reason: notes[0] });
  return result;
}

function matchesFeedbackRule(post: NormalizedPost, rule: RankingFeedbackRule): boolean {
  const text = post.text.toLowerCase();
  const repoFullName = typeof post.metadata?.repoFullName === "string" ? post.metadata.repoFullName.toLowerCase() : undefined;
  const { match } = rule;

  if (match.sourceId && post.sourceId !== match.sourceId) {
    return false;
  }

  if (match.externalId && post.externalId !== match.externalId) {
    return false;
  }

  if (match.dedupeKey && post.dedupeKey !== match.dedupeKey) {
    return false;
  }

  if (match.urlContains && !(post.url?.toLowerCase().includes(match.urlContains.toLowerCase()) ?? false)) {
    return false;
  }

  if (match.repoFullName && repoFullName !== match.repoFullName.toLowerCase()) {
    return false;
  }

  if (match.textIncludes && !match.textIncludes.every((value) => text.includes(value.toLowerCase()))) {
    return false;
  }

  return Object.keys(match).length > 0;
}

function applyRankingFeedback(
  post: NormalizedPost,
  analysis: AnalysisResult,
  feedbackRules: RankingFeedbackRule[],
): AnalysisResult {
  const matchedRules = feedbackRules.filter((rule) => matchesFeedbackRule(post, rule));
  if (matchedRules.length === 0) {
    return analysis;
  }

  const scoreAdjustment = matchedRules.reduce((sum, rule) => sum + (rule.scoreAdjustment ?? 0), 0);
  const adjustedScore = clamp(analysis.relevanceScore + scoreAdjustment);
  const decisionRule = [...matchedRules].reverse().find((rule) => rule.decisionOverride !== undefined);
  const projectRule = [...matchedRules].reverse().find((rule) => rule.projectOverride !== undefined);
  const urgencyRule = [...matchedRules].reverse().find((rule) => rule.urgencyOverride !== undefined);
  const decision = decisionRule?.decisionOverride ?? decisionFromScore(adjustedScore);
  const project = projectRule?.projectOverride ?? analysis.project;
  const urgency = urgencyRule?.urgencyOverride ?? inferUrgency(adjustedScore, decision);

  const result = {
    ...analysis,
    decision,
    project,
    urgency,
    relevanceScore: adjustedScore,
    scoreAdjustment,
    feedbackRuleIds: matchedRules.map((rule) => rule.id),
    feedbackNotes: matchedRules.map((rule) => rule.note ?? rule.description),
  };
  if (scoreAdjustment !== 0) {
    appendTrace(result, { label: "feedback", delta: scoreAdjustment, running: adjustedScore, reason: matchedRules.map((r) => r.id).join(", ") });
  }
  return result;
}

export function analyzePost(
  post: NormalizedPost,
  feedbackRules: RankingFeedbackRule[] = [],
  crossLinks: CrossSourceLink[] = [],
  profile: RadarProfile | null = null,
): AnalysisResult {
  // Scoring pipeline order — each layer operates on the previous layer's output:
  // 1. base       → theme, stack, signals, platform, boosts, penalties, clamp
  // 2. guardrails → HN/Reddit caps for discussion-only posts
  // 3. corroboration → cross-source boost (respects guardrail caps)
  // 4. radar lens → profile focus boost
  // 5. action caps → Telegram scout ceiling
  // 6. feedback   → manual ranking overrides
  const guarded = applyScoutGuardrails(post, buildBaseAnalysis(post));
  const corroborated = applyCrossSourceCorroboration(post, guarded, crossLinks);
  const focused = applyRadarProfileFocus(post, corroborated, profile);
  const capped = applySourceSpecificActionCaps(post, focused, crossLinks);
  return applyRankingFeedback(post, capped, feedbackRules);
}

export function analyzePosts(
  posts: NormalizedPost[],
  feedbackRules: RankingFeedbackRule[] = [],
  crossLinks: CrossSourceLink[] = [],
  profile: RadarProfile | null = null,
): ScoredPost[] {
  return posts
    .map((post) => ({
      ...post,
      analysis: analyzePost(post, feedbackRules, crossLinks, profile),
    }))
    .sort((left, right) => right.analysis.relevanceScore - left.analysis.relevanceScore);
}
