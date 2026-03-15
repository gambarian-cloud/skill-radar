import { loadEnvFiles } from "./lib/env.ts";
import { parseRunDate } from "./lib/time.ts";
import { runDailyDigest } from "./pipeline/run-daily.ts";
import type { SourceRunMode } from "./types.ts";

interface CliOptions {
  date?: string;
  windowHours: number;
  mode: SourceRunMode;
  source?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    windowHours: 24,
    mode: "auto",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--date" && next) {
      options.date = next;
      index += 1;
      continue;
    }

    if (arg === "--window-hours" && next) {
      options.windowHours = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--mode" && next) {
      if (next === "auto" || next === "mock" || next === "live") {
        options.mode = next;
      } else {
        throw new Error(`Unsupported mode "${next}". Use auto, mock, or live.`);
      }
      index += 1;
      continue;
    }

    if (arg === "--source" && next) {
      options.source = next;
      index += 1;
      continue;
    }
  }

  return options;
}

async function main(): Promise<void> {
  await loadEnvFiles();
  const options = parseArgs(process.argv.slice(2));
  const result = await runDailyDigest({
    runDate: parseRunDate(options.date),
    windowHours: options.windowHours,
    runMode: options.mode,
    sourceFilter: options.source,
  });

  console.log(`Signal Scout digest written to ${result.reportPath}`);
  console.log(`Processed ${result.posts.length} posts after cleanup.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Signal Scout failed: ${message}`);
  process.exitCode = 1;
});
