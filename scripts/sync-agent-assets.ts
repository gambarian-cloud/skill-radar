import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const WORKSPACE_ROOT = resolve(".");
const SOURCE_DIR = resolve("skills");
const TARGET_DIRS = [resolve(".agents", "skills"), resolve(".claude", "skills")];

interface SyncManifest {
  generatedAt: string;
  source: string;
  managedSkills: string[];
}

function isPermissionError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "EPERM");
}

function pushSkippedPath(skippedPaths: string[], path: string): void {
  const normalizedPath = relative(WORKSPACE_ROOT, path).replace(/\\/g, "/");

  if (!skippedPaths.includes(normalizedPath)) {
    skippedPaths.push(normalizedPath);
  }
}

function getSkippedSkillNames(targetLabel: string, skills: string[], skippedPaths: string[]): string[] {
  const skippedSkills = new Set<string>();

  for (const skillName of skills) {
    const skillPathPrefix = `${targetLabel}/${skillName}`;

    if (skippedPaths.some((path) => path === skillPathPrefix || path.startsWith(`${skillPathPrefix}/`))) {
      skippedSkills.add(skillName);
    }
  }

  return [...skippedSkills].sort();
}

async function isDirectory(path: string): Promise<boolean> {
  const info = await stat(path);
  return info.isDirectory();
}

async function syncFile(sourcePath: string, targetPath: string, skippedPaths: string[]): Promise<void> {
  const sourceContents = await readFile(sourcePath);

  try {
    const targetContents = await readFile(targetPath);
    if (sourceContents.equals(targetContents)) {
      return;
    }
  } catch {
    // The target file may not exist yet.
  }

  try {
    await writeFile(targetPath, sourceContents);
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      pushSkippedPath(skippedPaths, targetPath);
      return;
    }

    throw error;
  }
}

async function copyDirectory(sourceDir: string, targetDir: string, skippedPaths: string[]): Promise<boolean> {
  try {
    await mkdir(targetDir, { recursive: true });
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      pushSkippedPath(skippedPaths, targetDir);
      return false;
    }

    throw error;
  }

  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    const targetPath = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath, skippedPaths);
      continue;
    }

    await syncFile(sourcePath, targetPath, skippedPaths);
  }

  return true;
}

async function getManagedSkillDirs(): Promise<string[]> {
  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  const skillDirs: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillDir = join(SOURCE_DIR, entry.name);
    const skillFile = join(skillDir, "SKILL.md");

    try {
      const skillFileStats = await stat(skillFile);
      if (skillFileStats.isFile()) {
        skillDirs.push(entry.name);
      }
    } catch {
      // Ignore directories that are not skills.
    }
  }

  return skillDirs.sort();
}

async function readManifest(targetDir: string): Promise<SyncManifest | null> {
  const manifestPath = join(targetDir, ".signal-scout-sync.json");

  try {
    const contents = await readFile(manifestPath, "utf8");
    return JSON.parse(contents) as SyncManifest;
  } catch {
    return null;
  }
}

async function removeStaleManagedSkills(targetDir: string, currentSkills: string[], skippedPaths: string[]): Promise<void> {
  const previousManifest = await readManifest(targetDir);
  const previousSkills = previousManifest?.managedSkills ?? [];
  const staleSkills = previousSkills.filter((skill) => !currentSkills.includes(skill));

  for (const skill of staleSkills) {
    const targetPath = join(targetDir, skill);

    try {
      await rm(targetPath, { recursive: true, force: true });
    } catch (error: unknown) {
      if (isPermissionError(error)) {
        pushSkippedPath(skippedPaths, targetPath);
        continue;
      }

      throw error;
    }
  }
}

async function writeManifest(targetDir: string, skills: string[], skippedPaths: string[]): Promise<void> {
  const manifestPath = join(targetDir, ".signal-scout-sync.json");
  const payload: SyncManifest = {
    generatedAt: new Date().toISOString(),
    source: "skills/",
    managedSkills: skills,
  };

  try {
    await writeFile(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      pushSkippedPath(skippedPaths, manifestPath);
      return;
    }

    throw error;
  }
}

async function main(): Promise<void> {
  if (!(await isDirectory(SOURCE_DIR))) {
    throw new Error("Canonical skills directory does not exist.");
  }

  const skills = await getManagedSkillDirs();
  const skippedPaths: string[] = [];

  if (skills.length === 0) {
    throw new Error("No skill directories found under skills/.");
  }

  for (const targetDir of TARGET_DIRS) {
    const targetLabel = relative(WORKSPACE_ROOT, targetDir).replace(/\\/g, "/");
    const beforeCount = skippedPaths.length;

    try {
      await mkdir(targetDir, { recursive: true });
    } catch (error: unknown) {
      if (isPermissionError(error)) {
        pushSkippedPath(skippedPaths, targetDir);
        console.log(`${targetLabel}: SKIPPED (permission denied on directory)`);
        continue;
      }

      throw error;
    }

    await removeStaleManagedSkills(targetDir, skills, skippedPaths);

    for (const skillName of skills) {
      await copyDirectory(join(SOURCE_DIR, skillName), join(targetDir, skillName), skippedPaths);
    }

    await writeManifest(targetDir, skills, skippedPaths);

    const skippedInTarget = skippedPaths.slice(beforeCount);
    const skippedSkillNames = getSkippedSkillNames(targetLabel, skills, skippedInTarget);
    const syncedCount = skills.length - skippedSkillNames.length;
    const nonSkillSkipCount = skippedInTarget.length
      - skippedInTarget.filter((path) => skippedSkillNames.some((skillName) => {
        const skillPathPrefix = `${targetLabel}/${skillName}`;
        return path === skillPathPrefix || path.startsWith(`${skillPathPrefix}/`);
      })).length;

    if (skippedInTarget.length === 0) {
      console.log(`${targetLabel}: ${skills.length}/${skills.length} skills synced.`);
    } else {
      console.log(`${targetLabel}: ${syncedCount}/${skills.length} skills synced, ${skippedInTarget.length} path(s) skipped.`);
      if (skippedSkillNames.length > 0) {
        console.log(`${targetLabel}: blocked skills -> ${skippedSkillNames.join(", ")}`);
      }
      if (nonSkillSkipCount > 0) {
        console.log(`${targetLabel}: non-skill paths skipped -> ${nonSkillSkipCount}`);
      }
    }
  }

  console.log(`\nCanonical skills: ${skills.join(", ")}`);

  if (skippedPaths.length > 0) {
    console.log(`Skipped locked paths: ${skippedPaths.join(", ")}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Signal Scout sync failed: ${message}`);
  process.exitCode = 1;
});

