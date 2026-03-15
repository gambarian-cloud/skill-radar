import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { readJsonFile, writeJsonFile } from "../lib/file-system.ts";
import { RADAR_DOMAIN_LENSES, type RadarLensDefinition, type RadarLensId } from "./radar-presets.ts";

export type RadarRiskAppetite = "safe" | "balanced" | "experimental";

export interface RadarProfile {
  version: 1;
  selectedLenses: RadarLensId[];
  riskAppetite: RadarRiskAppetite;
  updatedAt: string;
}

export const DEFAULT_RADAR_PROFILE: RadarProfile = {
  version: 1,
  selectedLenses: [],
  riskAppetite: "balanced",
  updatedAt: new Date(0).toISOString(),
};

export function getRadarProfilePath(): string {
  const envOverride = process.env.SKILL_RADAR_PROFILE_PATH?.trim();
  if (envOverride) {
    return envOverride;
  }

  return join(homedir(), ".agent-baseline", "skill-radar-profile.json");
}

export function parseRiskAppetite(
  value: string | undefined,
  fallback: RadarRiskAppetite = "balanced",
): RadarRiskAppetite {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) {
    return fallback;
  }

  switch (normalized) {
    case "1":
    case "safe":
      return "safe";
    case "2":
    case "balanced":
      return "balanced";
    case "3":
    case "experimental":
      return "experimental";
    default:
      throw new Error(`Unsupported risk appetite "${value}". Use 1/2/3 or safe/balanced/experimental.`);
  }
}

export function normalizeLensIds(values: string[]): RadarLensId[] {
  const valid = new Set(RADAR_DOMAIN_LENSES.map((lens) => lens.id));
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter((value): value is RadarLensId => valid.has(value as RadarLensId)))];
}

export function buildRadarProfile(
  selectedLenses: string[],
  riskAppetite: RadarRiskAppetite,
  updatedAt = new Date().toISOString(),
): RadarProfile {
  return {
    version: 1,
    selectedLenses: normalizeLensIds(selectedLenses),
    riskAppetite,
    updatedAt,
  };
}

export async function loadRadarProfile(): Promise<RadarProfile | null> {
  const path = getRadarProfilePath();

  try {
    await access(path);
  } catch {
    return null;
  }

  const value = await readJsonFile<Partial<RadarProfile>>(path);
  return {
    version: 1,
    selectedLenses: normalizeLensIds(Array.isArray(value.selectedLenses) ? value.selectedLenses : []),
    riskAppetite: value.riskAppetite === "safe" || value.riskAppetite === "balanced" || value.riskAppetite === "experimental"
      ? value.riskAppetite
      : "balanced",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
}

export async function loadRadarProfileOrDefault(): Promise<RadarProfile> {
  return (await loadRadarProfile()) ?? DEFAULT_RADAR_PROFILE;
}

export async function saveRadarProfile(profile: RadarProfile): Promise<string> {
  const path = getRadarProfilePath();
  await writeJsonFile(path, profile);
  return path;
}

export function getActiveRadarLenses(profile: RadarProfile | null): RadarLensDefinition[] {
  const selected = new Set((profile ?? DEFAULT_RADAR_PROFILE).selectedLenses);
  return RADAR_DOMAIN_LENSES.filter((lens) => selected.has(lens.id));
}

export function summarizeRadarProfile(profile: RadarProfile | null): string {
  if (!profile || profile.selectedLenses.length === 0) {
    return "Current radar profile: core capabilities only; no domain lenses saved yet. Run `npm run radar:profile -- --init --lenses creator,education` to personalize it.";
  }

  const labels = getActiveRadarLenses(profile).map((lens) => lens.label).join(", ");
  return `Current radar profile: active domain lenses -> ${labels}; risk appetite -> ${profile.riskAppetite}.`;
}

export function summarizeRadarProfileFocus(profile: RadarProfile | null): string {
  const activeLenses = getActiveRadarLenses(profile);
  if (activeLenses.length === 0) {
    return "Current radar focus: core capabilities only, with no extra domain overlays yet.";
  }

  const focus = activeLenses
    .slice(0, 3)
    .map((lens) => `${lens.label} -> ${lens.signalsToTrack.slice(0, 2).join(", ")}`)
    .join("; ");

  return `Current radar focus: ${focus}.`;
}

export function buildLensSearchTerms(lens: RadarLensDefinition): string[] {
  return [...new Set([
    lens.id,
    lens.label,
    ...lens.signalsToTrack,
    ...lens.decisions.map((decision) => decision.label),
  ].map((value) => value.toLowerCase().trim()).filter((value) => value.length >= 4))];
}
