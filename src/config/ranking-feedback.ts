import { readJsonFile } from "../lib/file-system.ts";
import type { RankingFeedbackRule } from "../types.ts";

export const RANKING_FEEDBACK_PATH = "feedback/ranking-overrides.json";

export async function loadRankingFeedbackRules(): Promise<RankingFeedbackRule[]> {
  try {
    return await readJsonFile<RankingFeedbackRule[]>(RANKING_FEEDBACK_PATH);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
