import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const DEFAULT_ENV_FILES = [".env.local", ".env"];

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

export async function loadEnvFiles(files: string[] = DEFAULT_ENV_FILES): Promise<void> {
  for (const file of files) {
    try {
      await access(file, constants.F_OK);
    } catch {
      continue;
    }

    const contents = await readFile(file, "utf8");
    for (const line of contents.split(/\r?\n/u)) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      const [key, value] = parsed;
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}
