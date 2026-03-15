import {
  buildRadarProfile,
  getRadarProfilePath,
  loadRadarProfile,
  parseRiskAppetite,
  saveRadarProfile,
  type RadarRiskAppetite,
} from "./config/radar-profile.ts";
import { RADAR_DOMAIN_LENSES } from "./config/radar-presets.ts";

interface RadarProfileCliOptions {
  action: "show" | "init" | "set";
  lenses: string[];
  riskAppetite: RadarRiskAppetite;
}

function parseLensList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseArgs(argv: string[]): RadarProfileCliOptions {
  const options: RadarProfileCliOptions = {
    action: "show",
    lenses: [],
    riskAppetite: "balanced",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--show") {
      options.action = "show";
      continue;
    }

    if (arg === "--init") {
      options.action = "init";
      continue;
    }

    if (arg === "--set") {
      options.action = "set";
      continue;
    }

    if (arg === "--lenses" && next) {
      options.lenses = parseLensList(next);
      index += 1;
      continue;
    }

    if (arg === "--risk" && next) {
      options.riskAppetite = parseRiskAppetite(next);
      index += 1;
      continue;
    }
  }

  return options;
}

function renderAvailableLenses(): string {
  return RADAR_DOMAIN_LENSES.map((lens) => `- ${lens.id}: ${lens.label}`).join("\n");
}

function renderProfile(profile: Awaited<ReturnType<typeof loadRadarProfile>>): string {
  if (!profile) {
    return [
      "No saved Skill Radar profile yet.",
      `Profile path: ${getRadarProfilePath()}`,
      "Core capabilities stay on for everyone.",
      "To personalize, run:",
      "npm run radar:profile -- --init --lenses creator,education --risk balanced",
      "",
      "Available lenses:",
      renderAvailableLenses(),
    ].join("\n");
  }

  return [
    "Skill Radar profile is configured.",
    `Profile path: ${getRadarProfilePath()}`,
    `Active lenses: ${profile.selectedLenses.join(", ") || "none"}`,
    `Risk appetite: ${profile.riskAppetite}`,
    `Updated at: ${profile.updatedAt}`,
  ].join("\n");
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.action === "show") {
    console.log(renderProfile(await loadRadarProfile()));
    return;
  }

  if (options.lenses.length === 0) {
    throw new Error("Profile setup requires --lenses lens-a,lens-b.");
  }

  const profile = buildRadarProfile(options.lenses, options.riskAppetite);
  const path = await saveRadarProfile(profile);

  console.log([
    options.action === "init" ? "Initialized Skill Radar profile." : "Updated Skill Radar profile.",
    `Profile path: ${path}`,
    `Active lenses: ${profile.selectedLenses.join(", ") || "none"}`,
    `Risk appetite: ${profile.riskAppetite}`,
  ].join("\n"));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Skill Radar profile command failed: ${message}`);
  process.exitCode = 1;
});
