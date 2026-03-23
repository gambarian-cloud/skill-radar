import { writeTextFile } from "./lib/file-system.ts";
import {
  loadLookupCorpus,
  summarizeCurrentBaseline,
  summarizeCurrentGitHubWatchlist,
  summarizeCurrentPresetRead,
  summarizeCurrentProjectStatus,
  summarizeCurrentSourcePolicy,
  summarizeCurrentSourceRead,
  summarizePresetSpecificRead,
} from "./lib/corpus.ts";
import {
  getActiveRadarLenses,
  loadRadarProfile,
  summarizeRadarProfile,
  summarizeRadarProfileFocus,
  type RadarProfile,
} from "./config/radar-profile.ts";
import { SKILL_CATALOG, TRUSTED_SKILL_SOURCES } from "./config/skill-catalog.ts";
import type {
  AgentRuntime,
  CorpusDocument,
  CorpusLookupMatch,
  LookupResult,
  SkillCatalogEntry,
  SkillLookupMatch,
} from "./types.ts";

export interface LookupOptions {
  query: string;
  tool?: AgentRuntime;
  limit: number;
  write: boolean;
}

export function parseLookupArgs(argv: string[]): LookupOptions {
  const options: LookupOptions = {
    query: "",
    limit: 6,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if ((arg === "--query" || arg === "-q") && next) {
      options.query = next;
      index += 1;
      continue;
    }

    if (arg === "--tool" && next) {
      if (next === "codex" || next === "claude-code") {
        options.tool = next;
      } else {
        throw new Error(`Unsupported tool \"${next}\". Use codex or claude-code.`);
      }
      index += 1;
      continue;
    }

    if (arg === "--limit" && next) {
      options.limit = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--write") {
      options.write = true;
    }
  }

  if (!options.query.trim()) {
    throw new Error("Lookup requires --query \"...\".");
  }

  return options;
}

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+.-]+/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
}

function normalizeMatchToken(value: string): string {
  let token = value.toLowerCase().trim();

  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  const trimDoubledConsonant = (input: string): string => (
    /([b-df-hj-np-tv-z])\1$/iu.test(input) ? input.slice(0, -1) : input
  );

  if (token.endsWith("ing") && token.length > 5) {
    token = trimDoubledConsonant(token.slice(0, -3));
    return token;
  }

  if (token.endsWith("ed") && token.length > 4) {
    token = trimDoubledConsonant(token.slice(0, -2));
    return token;
  }

  if (token.endsWith("es") && token.length > 4) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }

  return token;
}

function titleMatches(entry: SkillCatalogEntry, query: string): boolean {
  return entry.label.toLowerCase().includes(query);
}

export function collectMatches(values: string[], tokens: string[]): string[] {
  const haystack = values.map((value) => new Set(tokenize(value).map(normalizeMatchToken)));
  const matches = new Set<string>();

  for (const token of tokens) {
    const normalizedToken = normalizeMatchToken(token);
    if (haystack.some((value) => value.has(normalizedToken))) {
      matches.add(token);
    }
  }

  return [...matches];
}

function scoreCatalogEntry(entry: SkillCatalogEntry, query: string, tokens: string[], tool?: AgentRuntime): SkillLookupMatch | null {
  const reasons: string[] = [];
  let score = 0;
  let hasQueryMatch = false;

  if (tool && !entry.compatibility.includes(tool)) {
    return null;
  }

  if (titleMatches(entry, query)) {
    score += 28;
    hasQueryMatch = true;
    reasons.push("title match");
  }

  const tagMatches = collectMatches(entry.tags, tokens);
  if (tagMatches.length > 0) {
    score += tagMatches.length * 8;
    hasQueryMatch = true;
    reasons.push(`tags: ${tagMatches.join(", ")}`);
  }

  const useCaseMatches = collectMatches(entry.recommendedWhen, tokens);
  if (useCaseMatches.length > 0) {
    score += useCaseMatches.length * 6;
    hasQueryMatch = true;
    reasons.push(`use-cases: ${useCaseMatches.join(", ")}`);
  }

  const summaryMatches = collectMatches([entry.summary], tokens);
  if (summaryMatches.length > 0) {
    score += summaryMatches.length * 4;
    hasQueryMatch = true;
    reasons.push(`summary: ${summaryMatches.join(", ")}`);
  }

  if (!hasQueryMatch) {
    return null;
  }

  if (entry.maturity === "adopt-now") {
    score += 8;
    reasons.push("adopt-now");
  } else if (entry.maturity === "experiment") {
    score += 5;
    reasons.push("experiment");
  } else if (entry.maturity === "watch") {
    score += 3;
  } else if (entry.maturity === "reject") {
    score -= 10;
    reasons.push("rejected");
  }

  if (entry.sourceClass === "project-owned") {
    score += 6;
    reasons.push("project-owned");
  }

  if (tool && entry.compatibility.includes(tool)) {
    score += 10;
    reasons.push(`fits ${tool}`);
  }

  return { entry, score, reasons };
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) {
    return 0;
  }

  let count = 0;
  let index = haystack.indexOf(needle);

  while (index >= 0) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }

  return count;
}

function buildSnippet(text: string, tokens: string[]): string {
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const matchLine = lines.find((line) => tokens.some((token) => line.toLowerCase().includes(token)));
  const snippet = matchLine ?? lines[0] ?? "";
  const cleaned = snippet.replace(/\s+/gu, " ").trim();

  if (cleaned.length <= 220) {
    return cleaned;
  }

  return `${cleaned.slice(0, 217).trimEnd()}...`;
}

function scoreCorpusDocument(document: CorpusDocument, query: string, tokens: string[]): CorpusLookupMatch | null {
  const lowerTitle = document.title.toLowerCase();
  const lowerPath = document.path.toLowerCase();
  const lowerText = document.text.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  if (lowerTitle.includes(query)) {
    score += 24;
    reasons.push("title phrase");
  }

  if (lowerPath.includes(query)) {
    score += 20;
    reasons.push("path phrase");
  }

  if (lowerText.includes(query)) {
    score += 18;
    reasons.push("text phrase");
  }

  const titleMatches = collectMatches([document.title], tokens);
  if (titleMatches.length > 0) {
    score += titleMatches.length * 10;
    reasons.push(`title: ${titleMatches.join(", ")}`);
  }

  const pathMatches = collectMatches([document.path], tokens);
  if (pathMatches.length > 0) {
    score += pathMatches.length * 7;
    reasons.push(`path: ${pathMatches.join(", ")}`);
  }

  const textMatches = collectMatches([document.text], tokens);
  if (textMatches.length > 0) {
    score += textMatches.length * 5;
    reasons.push(`text: ${textMatches.join(", ")}`);
  }

  const repeatedHits = tokens.reduce((sum, token) => sum + countOccurrences(lowerText, token), 0);
  if (repeatedHits > 0) {
    score += Math.min(repeatedHits, 8);
  }

  if (document.path.startsWith("synthetic/") && score > 0) {
    score += 16;
    reasons.push("current state");
  }

  if (document.path.startsWith("Research/") && score > 0) {
    score += 6;
    reasons.push("current research");
  }

  if (score <= 0) {
    return null;
  }

  return {
    document,
    score,
    reasons,
    snippet: buildSnippet(document.text, tokens),
  };
}

export function findSkillCatalogMatches(query: string, tool?: AgentRuntime, limit = 6): SkillLookupMatch[] {
  const normalizedQuery = query.trim().toLowerCase();
  const tokens = tokenize(normalizedQuery);

  return SKILL_CATALOG
    .map((entry) => scoreCatalogEntry(entry, normalizedQuery, tokens, tool))
    .filter((value): value is SkillLookupMatch => value !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function findCorpusMatches(corpus: CorpusDocument[], query: string, limit = 6): CorpusLookupMatch[] {
  const normalizedQuery = query.trim().toLowerCase();
  const tokens = tokenize(normalizedQuery);

  return corpus
    .map((document) => scoreCorpusDocument(document, normalizedQuery, tokens))
    .filter((value): value is CorpusLookupMatch => value !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

function compatibilityLabel(values: AgentRuntime[]): string {
  return values.length === 2 ? "codex + claude-code" : values.join(", ");
}

function applyRadarProfileCorpusBoosts(
  corpusMatches: CorpusLookupMatch[],
  profile: RadarProfile | null,
): CorpusLookupMatch[] {
  const activeLenses = getActiveRadarLenses(profile);
  if (activeLenses.length === 0) {
    return corpusMatches;
  }

  const activeLensPaths = new Set(activeLenses.map((lens) => `synthetic/radar-lens-${lens.id}`));

  return corpusMatches
    .map((match) => {
      let bonus = 0;
      const reasons = [...match.reasons];

      if (activeLensPaths.has(match.document.path)) {
        bonus += 18;
        reasons.push("active lens");
      }

      if (match.document.path === "synthetic/radar-profile") {
        bonus += 12;
        reasons.push("active profile");
      }

      return {
        ...match,
        score: match.score + bonus,
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score);
}

interface PresetDecisionSignal {
  label: string;
  decision: "adopt-now" | "experiment" | "watch" | "reject";
}

function corpusKindLabel(kind: CorpusDocument["kind"]): string {
  switch (kind) {
    case "research-note":
      return "research note";
    case "daily-digest":
      return "daily digest";
    case "skill":
      return "project skill";
    case "project-doc":
      return "project doc";
  }
}

function hasCorpusPath(result: LookupResult, path: string): boolean {
  return result.corpusMatches.some((match) => match.document.path === path);
}

function hasCorpusTitle(result: LookupResult, fragment: string): boolean {
  const normalized = fragment.toLowerCase();
  return result.corpusMatches.some((match) => match.document.title.toLowerCase().includes(normalized));
}

function firstDocumentLine(result: LookupResult, path: string): string | undefined {
  const match = result.corpusMatches.find((item) => item.document.path === path);
  if (!match) {
    return undefined;
  }

  return match.document.text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}

function firstMatchedDocumentByPrefix(result: LookupResult, prefix: string): CorpusLookupMatch | undefined {
  return result.corpusMatches.find((match) => match.document.path.startsWith(prefix));
}

function extractPresetDecisionSignals(text: string): PresetDecisionSignal[] {
  const matches = [...text.matchAll(/^- (.+?) \((?:skill|mcp|hook|workflow|ecosystem)\) -> (adopt-now|experiment|watch|reject):/gmu)];
  return matches.map((match) => ({
    label: (match[1] ?? "").trim().toLowerCase(),
    decision: (match[2] as PresetDecisionSignal["decision"]) ?? "watch",
  }));
}

function applyPresetDecisionBoosts(
  catalogMatches: SkillLookupMatch[],
  corpusMatches: CorpusLookupMatch[],
): SkillLookupMatch[] {
  const presetDocs = corpusMatches
    .filter((match) => (
      match.document.path.startsWith("synthetic/radar-core-")
      || match.document.path.startsWith("synthetic/radar-lens-")
    ))
    .slice(0, 2);

  if (presetDocs.length === 0) {
    return catalogMatches;
  }

  const decisionSignals = presetDocs.flatMap((match) => extractPresetDecisionSignals(match.document.text));
  if (decisionSignals.length === 0) {
    return catalogMatches;
  }

  return catalogMatches
    .map((match) => {
      const lowerId = match.entry.id.toLowerCase();
      const lowerLabel = match.entry.label.toLowerCase();
      let bonus = 0;
      const reasons = [...match.reasons];

      for (const signal of decisionSignals) {
        const isDirectMatch = signal.label === lowerId || signal.label === lowerLabel;
        if (!isDirectMatch) {
          continue;
        }

        if (signal.decision === "adopt-now") {
          bonus += 24;
          reasons.push("preset adopt-now");
        } else if (signal.decision === "experiment") {
          bonus += 10;
          reasons.push("preset experiment");
        } else if (signal.decision === "watch") {
          bonus += 4;
          reasons.push("preset watch");
        }
      }

      return {
        ...match,
        score: match.score + bonus,
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score);
}

function applyRadarProfileSkillBoosts(
  catalogMatches: SkillLookupMatch[],
  profile: RadarProfile | null,
): SkillLookupMatch[] {
  const activeLenses = getActiveRadarLenses(profile);
  if (activeLenses.length === 0) {
    return catalogMatches;
  }

  const signals = activeLenses.flatMap((lens) =>
    lens.decisions.map((decision) => ({
      label: decision.label.toLowerCase(),
      decision: decision.decision,
    })),
  );

  return catalogMatches
    .map((match) => {
      let bonus = 0;
      const reasons = [...match.reasons];
      const lowerId = match.entry.id.toLowerCase();
      const lowerLabel = match.entry.label.toLowerCase();

      for (const signal of signals) {
        const isDirectMatch = signal.label === lowerId || signal.label === lowerLabel;
        if (!isDirectMatch) {
          continue;
        }

        if (signal.decision === "adopt-now") {
          bonus += 14;
          reasons.push("active lens adopt-now");
        } else if (signal.decision === "experiment") {
          bonus += 6;
          reasons.push("active lens experiment");
        } else if (signal.decision === "watch") {
          bonus += 2;
          reasons.push("active lens watch");
        }
      }

      return {
        ...match,
        score: match.score + bonus,
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score);
}

function buildQuickRead(_options: LookupOptions, result: LookupResult): string[] {
  const lines: string[] = [];

  if ((result.profile?.selectedLenses.length ?? 0) > 0 || hasCorpusPath(result, "synthetic/radar-profile")) {
    lines.push(summarizeRadarProfile(result.profile ?? null));
    lines.push(summarizeRadarProfileFocus(result.profile ?? null));
  }

  if (hasCorpusPath(result, "synthetic/agent-baseline")) {
    lines.push(summarizeCurrentBaseline());
  }

  if (hasCorpusPath(result, "synthetic/source-config")) {
    lines.push(summarizeCurrentSourcePolicy());
  }

  if (hasCorpusPath(result, "synthetic/github-watchlist")) {
    lines.push(summarizeCurrentGitHubWatchlist());
  }

  if (hasCorpusPath(result, "synthetic/radar-presets")) {
    lines.push(summarizeCurrentPresetRead());
  }

  const matchedCapability = firstMatchedDocumentByPrefix(result, "synthetic/radar-core-");
  if (matchedCapability) {
    lines.push(matchedCapability.document.text.split(/\r?\n/u)[0]?.trim() ?? summarizePresetSpecificRead());
  }

  const matchedLens = firstMatchedDocumentByPrefix(result, "synthetic/radar-lens-");
  if (matchedLens) {
    lines.push(matchedLens.document.text.split(/\r?\n/u)[0]?.trim() ?? summarizePresetSpecificRead());
  }

  if (matchedCapability || matchedLens) {
    lines.push(summarizePresetSpecificRead());
  }

  const radarEvidence = firstDocumentLine(result, "synthetic/current-radar-evidence");
  if (radarEvidence) {
    lines.push(radarEvidence);
  }

  const cadenceEvidence = firstDocumentLine(result, "synthetic/current-cadence-evidence");
  if (cadenceEvidence) {
    lines.push(cadenceEvidence);
  }

  const doTodayQueue = firstDocumentLine(result, "synthetic/current-do-today-queue");
  if (doTodayQueue) {
    lines.push(doTodayQueue);
  }

  const saveThisWeekQueue = firstDocumentLine(result, "synthetic/current-save-this-week-queue");
  if (saveThisWeekQueue) {
    lines.push(saveThisWeekQueue);
  }

  const ignoreForNowQueue = firstDocumentLine(result, "synthetic/current-ignore-for-now-queue");
  if (ignoreForNowQueue) {
    lines.push(ignoreForNowQueue);
  }

  const repoEvidence = firstDocumentLine(result, "synthetic/current-repo-evidence");
  if (repoEvidence) {
    lines.push(repoEvidence);
  }

  const sourceTrends = firstDocumentLine(result, "synthetic/current-source-trends");
  if (sourceTrends) {
    lines.push(sourceTrends);
  }

  const redditTargetTrends = firstDocumentLine(result, "synthetic/current-reddit-target-trends");
  if (redditTargetTrends) {
    lines.push(redditTargetTrends);
  }

  const retuneStatus = firstDocumentLine(result, "synthetic/current-retune-status");
  if (retuneStatus) {
    lines.push(retuneStatus);
  }

  const recommendation = firstDocumentLine(result, "synthetic/current-recommendations");
  if (recommendation) {
    lines.push(recommendation);
  }

  if (hasCorpusPath(result, "synthetic/project-status") || hasCorpusTitle(result, "project status")) {
    lines.push(summarizeCurrentProjectStatus());
  }

  if (
    hasCorpusPath(result, "synthetic/project-status")
    || hasCorpusTitle(result, "source audit history")
    || hasCorpusTitle(result, "source audit")
  ) {
    lines.push(summarizeCurrentSourceRead());
  }

  if (result.catalogMatches.length > 0) {
    lines.push(`Top skill match: ${result.catalogMatches[0].entry.label}.`);
  }

  return lines;
}

export function renderLookup(options: LookupOptions, result: LookupResult): string {
  const lines: string[] = [];
  lines.push("# Signal Scout Lookup");
  lines.push("");
  lines.push(`Query: ${options.query}`);
  lines.push(`Tool target: ${options.tool ?? "any"}`);
  lines.push("");

  const quickRead = buildQuickRead(options, result);
  if (quickRead.length > 0) {
    lines.push("## Quick Read");
    lines.push("");
    for (const item of quickRead) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  lines.push("## Recommended Skills");
  lines.push("");

  if (result.catalogMatches.length === 0) {
    lines.push("No strong skill-catalog matches found.");
  } else {
    result.catalogMatches.forEach((match, index) => {
      lines.push(`${index + 1}. ${match.entry.label} (${match.entry.sourceClass}, ${match.entry.maturity})`);
      lines.push(`   Compatibility: ${compatibilityLabel(match.entry.compatibility)}`);
      lines.push(`   Why: ${match.entry.summary}`);
      lines.push(`   Reasons: ${match.reasons.join("; ")}`);
      if (match.entry.localPath) {
        lines.push(`   Local path: ${match.entry.localPath}`);
      }
      lines.push(`   Source: ${match.entry.sourceUrl}`);
      if (match.entry.installHint) {
        lines.push(`   Install hint: ${match.entry.installHint}`);
      }
      lines.push(`   Evidence: ${match.entry.evidenceUrls.join(", ")}`);
      lines.push("");
    });
  }

  lines.push("## Relevant Local Evidence");
  lines.push("");

  if (result.corpusMatches.length === 0) {
    lines.push("No strong local corpus matches found.");
  } else {
    result.corpusMatches.forEach((match, index) => {
      lines.push(`${index + 1}. ${match.document.title} (${corpusKindLabel(match.document.kind)})`);
      lines.push(`   Path: ${match.document.path}`);
      lines.push(`   Why: ${match.reasons.join("; ")}`);
      lines.push(`   Snippet: ${match.snippet}`);
      lines.push("");
    });
  }

  lines.push("## Trusted Skill Sources");
  lines.push("");
  for (const source of TRUSTED_SKILL_SOURCES) {
    if (options.tool && !source.compatibility.includes(options.tool)) {
      continue;
    }

    lines.push(`- ${source.label} (${source.category}, ${compatibilityLabel(source.compatibility)})`);
    lines.push(`  Why track: ${source.whyTrack}`);
    lines.push(`  URL: ${source.url}`);
    lines.push(`  Install hint: ${source.installHint}`);
  }

  return lines.join("\n");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function runLookup(options: LookupOptions): Promise<LookupResult> {
  const corpus = await loadLookupCorpus();
  const profile = await loadRadarProfile();
  const corpusMatches = applyRadarProfileCorpusBoosts(
    findCorpusMatches(corpus, options.query, options.limit),
    profile,
  );
  const catalogMatches = applyRadarProfileSkillBoosts(
    applyPresetDecisionBoosts(
      findSkillCatalogMatches(options.query, options.tool, options.limit),
      corpusMatches,
    ),
    profile,
  );

  return {
    catalogMatches,
    corpusMatches,
    profile,
  };
}

export async function maybeWriteLookupReport(options: LookupOptions, output: string): Promise<string | undefined> {
  if (!options.write) {
    return undefined;
  }

  const today = new Date().toISOString().slice(0, 10);
  const reportPath = `reports/research/lookups/${today}-${slugify(options.query)}.md`;
  await writeTextFile(reportPath, output);
  return reportPath;
}
