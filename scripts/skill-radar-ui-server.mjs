import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { access, readFile, readdir } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const uiDir = join(repoRoot, "ui");
const dailyDir = join(repoRoot, "reports", "daily");
const profilePath = process.env.SKILL_RADAR_PROFILE_PATH?.trim() || join(homedir(), ".agent-baseline", "skill-radar-profile.json");
const lenses = ["creator", "education", "business", "history", "gaming", "sports", "family"];

const state = {
  running: false,
  currentAction: "",
  status: "Ready",
  summary: [
    "Welcome.",
    "Choose an action and read the result here.",
  ],
  logs: [],
  profile: {
    selectedLenses: [],
    riskAppetite: "balanced",
    updatedAt: "",
  },
  digestPreview: null,
  lastUpdatedAt: new Date().toISOString(),
};

const requestedPort = Number.parseInt(process.env.SKILL_RADAR_UI_PORT ?? "0", 10);
const shouldOpenBrowser = process.env.SKILL_RADAR_UI_NO_OPEN !== "1";

function setStatus(text) {
  state.status = text;
  state.lastUpdatedAt = new Date().toISOString();
}

function setSummary(lines) {
  state.summary = lines.slice(0, 12);
  state.lastUpdatedAt = new Date().toISOString();
}

function appendLog(line) {
  const text = String(line);
  state.logs.push(text);
  if (state.logs.length > 900) {
    state.logs.splice(0, state.logs.length - 900);
  }
  state.lastUpdatedAt = new Date().toISOString();
}

function contentType(path) {
  const extension = extname(path).toLowerCase();
  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(body);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const value = Buffer.concat(chunks).toString("utf8").trim();
  if (!value) {
    return {};
  }
  return JSON.parse(value);
}

function splitLines(buffered, value) {
  const combined = buffered + value;
  const parts = combined.split(/\r?\n/);
  const tail = parts.pop() ?? "";
  return { lines: parts, tail };
}

function runCommand(actionLabel, executable, args) {
  return new Promise((resolveRun) => {
    appendLog("");
    appendLog(`>>> ${actionLabel}`);

    const commandOutput = [];
    const child = spawn(executable, args, {
      cwd: repoRoot,
      shell: false,
      windowsHide: true,
      env: process.env,
    });

    let stdoutRemainder = "";
    let stderrRemainder = "";

    child.stdout.on("data", (chunk) => {
      const decoded = chunk.toString("utf8");
      const { lines, tail } = splitLines(stdoutRemainder, decoded);
      stdoutRemainder = tail;
      for (const line of lines) {
        commandOutput.push(line);
        appendLog(line);
      }
    });

    child.stderr.on("data", (chunk) => {
      const decoded = chunk.toString("utf8");
      const { lines, tail } = splitLines(stderrRemainder, decoded);
      stderrRemainder = tail;
      for (const line of lines) {
        commandOutput.push(line);
        appendLog(line);
      }
    });

    child.on("close", (code) => {
      if (stdoutRemainder.length > 0) {
        commandOutput.push(stdoutRemainder);
        appendLog(stdoutRemainder);
      }
      if (stderrRemainder.length > 0) {
        commandOutput.push(stderrRemainder);
        appendLog(stderrRemainder);
      }
      resolveRun({
        code: code ?? 0,
        output: commandOutput,
      });
    });

    child.on("error", (error) => {
      appendLog(`ERROR: ${error.message}`);
      resolveRun({
        code: 1,
        output: [`ERROR: ${error.message}`],
      });
    });
  });
}

function findLastMatch(outputLines, pattern) {
  for (let index = outputLines.length - 1; index >= 0; index -= 1) {
    const match = outputLines[index].match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return "";
}

function sectionBullets(markdownLines, sectionTitle) {
  const headingPattern = new RegExp(`^###\\s+${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);
  const bullets = [];
  let collecting = false;

  for (const line of markdownLines) {
    if (headingPattern.test(line)) {
      collecting = true;
      continue;
    }
    if (collecting && /^###\s+/.test(line)) {
      break;
    }
    if (collecting) {
      const match = line.match(/^\-\s+(.*)$/);
      if (match) {
        bullets.push(match[1].trim());
      }
    }
  }

  return bullets;
}

async function latestDigestPath() {
  try {
    const entries = await readdir(dailyDir, { withFileTypes: true });
    const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
    if (markdownFiles.length === 0) {
      return "";
    }
    markdownFiles.sort((a, b) => b.name.localeCompare(a.name));
    return join(dailyDir, markdownFiles[0].name);
  } catch {
    return "";
  }
}

async function buildDigestPreview(path) {
  if (!path) {
    return null;
  }

  const content = await readFile(path, "utf8");
  const lines = content.split(/\r?\n/);
  const doToday = sectionBullets(lines, "Do Today");
  const saveThisWeek = sectionBullets(lines, "Save This Week");
  const ignoreForNow = sectionBullets(lines, "Ignore For Now");

  return {
    path,
    doToday,
    saveThisWeek,
    ignoreForNow,
  };
}

async function openFile(path) {
  if (!path) {
    return;
  }

  await new Promise((resolveOpen) => {
    const opener = spawn("powershell", [
      "-NoProfile",
      "-Command",
      `Start-Process -FilePath '${path.replace(/'/g, "''")}'`,
    ], {
      cwd: repoRoot,
      shell: false,
      windowsHide: true,
    });

    opener.on("close", () => resolveOpen());
    opener.on("error", () => resolveOpen());
  });
}

async function loadProfileFromDisk() {
  try {
    await access(profilePath);
    const raw = await readFile(profilePath, "utf8");
    const parsed = JSON.parse(raw);
    const selected = Array.isArray(parsed.selectedLenses)
      ? parsed.selectedLenses.filter((lens) => lenses.includes(String(lens))).map((lens) => String(lens))
      : [];

    const risk = ["safe", "balanced", "experimental"].includes(parsed.riskAppetite)
      ? parsed.riskAppetite
      : "balanced";

    state.profile = {
      selectedLenses: selected,
      riskAppetite: risk,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    state.profile = {
      selectedLenses: [],
      riskAppetite: "balanced",
      updatedAt: "",
    };
  }
}

function markBusy(actionName) {
  state.running = true;
  state.currentAction = actionName;
  setStatus(`Running: ${actionName}`);
}

function markDone(ok = true) {
  state.running = false;
  state.currentAction = "";
  setStatus(ok ? "Done" : "Failed");
}

async function handleAction(payload) {
  const type = String(payload.type ?? "").trim();
  if (!type) {
    return { ok: false, error: "Action type is required." };
  }
  if (state.running) {
    return { ok: false, error: "Another action is still running." };
  }

  if (type === "open-digest") {
    const path = await latestDigestPath();
    if (!path) {
      setSummary(["No digest file found yet.", "Run Demo Digest or Auto Digest first."]);
      return { ok: false, error: "No digest found." };
    }
    await openFile(path);
    setSummary([
      "Digest opened.",
      path,
    ]);
    markDone(true);
    return { ok: true };
  }

  markBusy(type);

  try {
    if (type === "install") {
      const result = await runCommand("npm install", "npm", ["install"]);
      if (result.code !== 0) {
        setSummary(["Install failed.", "Open Technical Log to see details."]);
        markDone(false);
        return { ok: false, error: "Install failed." };
      }

      setSummary(["Dependencies are up to date.", "You can run Demo Digest now."]);
      markDone(true);
      return { ok: true };
    }

    if (type === "digest-demo" || type === "digest-auto") {
      const args = type === "digest-demo" ? ["run", "digest:demo"] : ["run", "digest"];
      const label = type === "digest-demo" ? "npm run digest:demo" : "npm run digest";
      const result = await runCommand(label, "npm", args);
      if (result.code !== 0) {
        setSummary(["Digest failed.", "Open Technical Log to see details."]);
        markDone(false);
        return { ok: false, error: "Digest failed." };
      }

      const outputPath = findLastMatch(result.output, /^Signal Scout digest written to\s+(.+)$/);
      const processed = findLastMatch(result.output, /^Processed\s+(\d+)\s+posts after cleanup\.$/);
      let digestPath = outputPath;
      if (digestPath && !/^[A-Za-z]:\\/.test(digestPath)) {
        digestPath = join(repoRoot, digestPath);
      }
      if (!digestPath) {
        digestPath = await latestDigestPath();
      }

      state.digestPreview = await buildDigestPreview(digestPath);

      const lines = [
        type === "digest-demo" ? "Demo digest is ready." : "Auto digest is ready.",
        processed ? `Posts reviewed: ${processed}` : "",
        digestPath ? `Saved to: ${digestPath}` : "",
      ].filter(Boolean);

      if (state.digestPreview) {
        const firstDoToday = state.digestPreview.doToday[0] ?? "No urgent actions.";
        const firstSave = state.digestPreview.saveThisWeek[0] ?? "No items.";
        const firstIgnore = state.digestPreview.ignoreForNow[0] ?? "No items.";
        lines.push(`Do Today: ${firstDoToday}`);
        lines.push(`Save This Week: ${firstSave}`);
        lines.push(`Ignore For Now: ${firstIgnore}`);
      }

      lines.push("Use the Open Digest button if you want full details.");
      setSummary(lines);
      await openFile(digestPath);
      markDone(true);
      return { ok: true };
    }

    if (type === "lookup") {
      const query = String(payload.query ?? "").trim();
      if (!query) {
        setSummary(["Lookup needs a question.", "Type your question first."]);
        markDone(false);
        return { ok: false, error: "Query is required." };
      }

      const result = await runCommand(`lookup: ${query}`, "npm", ["run", "lookup", "--", "--query", query]);
      if (result.code !== 0) {
        setSummary(["Lookup failed.", "Open Technical Log to see details."]);
        markDone(false);
        return { ok: false, error: "Lookup failed." };
      }

      const topSkill = findLastMatch(result.output, /^- ([^\(]+)\(score:/);
      setSummary([
        "Lookup complete.",
        `Question: ${query}`,
        topSkill ? `Top suggestion: ${topSkill}` : "See suggestions in Technical Log.",
      ]);
      markDone(true);
      return { ok: true };
    }

    if (type === "profile-show") {
      const result = await runCommand("npm run radar:profile -- --show", "npm", ["run", "radar:profile", "--", "--show"]);
      if (result.code !== 0) {
        setSummary(["Profile read failed.", "Open Technical Log to see details."]);
        markDone(false);
        return { ok: false, error: "Profile show failed." };
      }

      await loadProfileFromDisk();
      setSummary([
        "Profile loaded.",
        `Lenses: ${state.profile.selectedLenses.join(", ") || "none"}`,
        `Risk: ${state.profile.riskAppetite}`,
      ]);
      markDone(true);
      return { ok: true };
    }

    if (type === "profile-save") {
      const selected = Array.isArray(payload.selectedLenses)
        ? payload.selectedLenses.map((value) => String(value)).filter((value) => lenses.includes(value))
        : [];
      const risk = ["safe", "balanced", "experimental"].includes(payload.risk) ? payload.risk : "balanced";

      if (selected.length === 0) {
        setSummary(["Profile was not saved.", "Select at least one lens."]);
        markDone(false);
        return { ok: false, error: "At least one lens is required." };
      }

      const result = await runCommand(
        `npm run radar:profile -- --set --lenses ${selected.join(",")} --risk ${risk}`,
        "npm",
        ["run", "radar:profile", "--", "--set", "--lenses", selected.join(","), "--risk", risk],
      );

      if (result.code !== 0) {
        setSummary(["Profile save failed.", "Open Technical Log to see details."]);
        markDone(false);
        return { ok: false, error: "Profile save failed." };
      }

      await loadProfileFromDisk();
      setSummary([
        "Profile saved.",
        `Lenses: ${state.profile.selectedLenses.join(", ")}`,
        `Risk: ${state.profile.riskAppetite}`,
      ]);
      markDone(true);
      return { ok: true };
    }

    if (type === "health-check") {
      const testResult = await runCommand("npm test", "npm", ["test"]);
      if (testResult.code !== 0) {
        setSummary(["Health check failed at tests.", "Open Technical Log for details."]);
        markDone(false);
        return { ok: false, error: "Tests failed." };
      }

      const auditResult = await runCommand("npm run audit:baseline", "npm", ["run", "audit:baseline"]);
      if (auditResult.code !== 0) {
        setSummary(["Tests passed, but baseline audit failed.", "Open Technical Log for details."]);
        markDone(false);
        return { ok: false, error: "Baseline audit failed." };
      }

      const passCount = findLastMatch(testResult.output, /^\s*pass\s+(\d+)\s*$/);
      const adoptCount = findLastMatch(auditResult.output, /^Adopt-now checks:\s+(\d+).*$/);
      const missingCount = findLastMatch(auditResult.output, /^OK:\s+\d+,\s+partial:\s+\d+,\s+missing:\s+(\d+)$/);
      setSummary([
        "Health check complete.",
        passCount ? `Tests passed: ${passCount}` : "Tests passed.",
        adoptCount ? `Adopt-now checks: ${adoptCount}` : "",
        missingCount ? `Missing checks: ${missingCount}` : "",
      ].filter(Boolean));
      markDone(true);
      return { ok: true };
    }

    setSummary(["Unknown action.", `Type: ${type}`]);
    markDone(false);
    return { ok: false, error: "Unknown action." };
  } catch (error) {
    appendLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    setSummary(["Action failed unexpectedly.", "Open Technical Log to see details."]);
    markDone(false);
    return { ok: false, error: "Unexpected error." };
  }
}

async function serveStatic(requestPath, response) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const fullPath = join(uiDir, safePath.replace(/^\/+/, ""));
  if (!fullPath.startsWith(uiDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(fullPath);
    response.writeHead(200, {
      "content-type": contentType(fullPath),
      "cache-control": "no-store",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

function openBrowser(url) {
  const child = spawn("cmd", ["/c", "start", "", url], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

const server = createServer(async (request, response) => {
  const method = request.method ?? "GET";
  const rawUrl = request.url ?? "/";
  const url = new URL(rawUrl, "http://127.0.0.1");

  if (method === "GET" && url.pathname === "/api/state") {
    sendJson(response, 200, {
      ...state,
      lenses,
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/action") {
    try {
      const body = await readBody(request);
      const result = await handleAction(body);
      sendJson(response, result.ok ? 200 : 400, {
        ok: result.ok,
        error: result.error ?? "",
      });
      return;
    } catch (error) {
      sendJson(response, 400, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }
  }

  if (method === "GET") {
    await serveStatic(url.pathname, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

await loadProfileFromDisk();
state.digestPreview = await buildDigestPreview(await latestDigestPath());

server.listen(Number.isFinite(requestedPort) ? requestedPort : 0, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string") {
    return;
  }
  const appUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Signal Scout UI running at ${appUrl}`);
  console.log("Close this window to stop the UI server.");
  if (shouldOpenBrowser) {
    openBrowser(appUrl);
  }
});
