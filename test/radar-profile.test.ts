import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  buildRadarProfile,
  loadRadarProfile,
  normalizeLensIds,
  parseRiskAppetite,
  saveRadarProfile,
  summarizeRadarProfile,
  summarizeRadarProfileFocus,
} from "../src/config/radar-profile.ts";

test("normalizeLensIds keeps only known unique lenses", () => {
  assert.deepEqual(
    normalizeLensIds(["creator", "education", "unknown", "creator"]),
    ["creator", "education"],
  );
});

test("parseRiskAppetite accepts numeric and text values and rejects invalid input", () => {
  assert.equal(parseRiskAppetite("1"), "safe");
  assert.equal(parseRiskAppetite("2"), "balanced");
  assert.equal(parseRiskAppetite("3"), "experimental");
  assert.equal(parseRiskAppetite("safe"), "safe");
  assert.equal(parseRiskAppetite("balanced"), "balanced");
  assert.equal(parseRiskAppetite("experimental"), "experimental");
  assert.equal(parseRiskAppetite(""), "balanced");
  assert.throws(
    () => parseRiskAppetite("risky"),
    /Unsupported risk appetite "risky"\. Use 1\/2\/3 or safe\/balanced\/experimental\./,
  );
});

test("saveRadarProfile and loadRadarProfile round-trip through the shared profile file", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "skill-radar-profile-"));
  const profilePath = join(tempRoot, "skill-radar-profile.json");
  const previous = process.env.SKILL_RADAR_PROFILE_PATH;
  process.env.SKILL_RADAR_PROFILE_PATH = profilePath;

  try {
    const profile = buildRadarProfile(["creator", "business"], "balanced", "2026-03-11T12:00:00.000Z");
    await saveRadarProfile(profile);
    const loaded = await loadRadarProfile();

    assert.deepEqual(loaded, profile);
  } finally {
    if (previous === undefined) {
      delete process.env.SKILL_RADAR_PROFILE_PATH;
    } else {
      process.env.SKILL_RADAR_PROFILE_PATH = previous;
    }
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("summaries explain both empty and active radar profiles", () => {
  assert.match(summarizeRadarProfile(null), /no domain lenses saved yet/i);
  assert.match(summarizeRadarProfileFocus(null), /core capabilities only/i);

  const profile = buildRadarProfile(["creator", "education"], "experimental", "2026-03-11T12:00:00.000Z");
  assert.match(summarizeRadarProfile(profile), /(Creator, Education|Education, Creator)/i);
  assert.match(summarizeRadarProfileFocus(profile), /Creator/i);
});
