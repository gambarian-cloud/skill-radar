const statusPill = document.getElementById("statusPill");
const summaryLines = document.getElementById("summaryLines");
const digestPreview = document.getElementById("digestPreview");
const lookupInput = document.getElementById("lookupInput");
const riskSelect = document.getElementById("riskSelect");
const lensesGrid = document.getElementById("lensesGrid");
const showLogs = document.getElementById("showLogs");
const logBox = document.getElementById("logBox");
const actionButtons = [...document.querySelectorAll("button[data-action]")];

let appState = null;

function setStatus(statusText, running) {
  const text = statusText || "Ready";
  statusPill.textContent = text;
  statusPill.classList.remove("running", "done", "failed");
  if (running) {
    statusPill.classList.add("running");
    return;
  }
  if (/failed/i.test(text)) {
    statusPill.classList.add("failed");
    return;
  }
  if (/done/i.test(text)) {
    statusPill.classList.add("done");
  }
}

function renderSummary(lines) {
  summaryLines.innerHTML = "";
  const safeLines = Array.isArray(lines) && lines.length > 0
    ? lines
    : ["Choose an action to begin."];

  for (const line of safeLines) {
    const p = document.createElement("p");
    p.textContent = line;
    summaryLines.appendChild(p);
  }
}

function renderDigestPreview(preview) {
  if (!preview) {
    digestPreview.textContent = "No digest preview yet. Run Demo Digest or Auto Digest.";
    return;
  }

  const doToday = preview.doToday?.[0] || "No urgent actions.";
  const saveThisWeek = preview.saveThisWeek?.[0] || "No items.";
  const ignoreForNow = preview.ignoreForNow?.[0] || "No items.";
  digestPreview.textContent =
    `Do Today: ${doToday}\n` +
    `Save This Week: ${saveThisWeek}\n` +
    `Ignore For Now: ${ignoreForNow}`;
}

function renderLogs(lines) {
  logBox.textContent = Array.isArray(lines) ? lines.join("\n") : "";
  logBox.scrollTop = logBox.scrollHeight;
}

function selectedLenses() {
  return [...lensesGrid.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
}

function renderLensOptions(availableLenses, selected = []) {
  if (lensesGrid.childElementCount > 0) {
    for (const input of lensesGrid.querySelectorAll("input[type='checkbox']")) {
      input.checked = selected.includes(input.value);
    }
    return;
  }

  for (const lens of availableLenses) {
    const label = document.createElement("label");
    label.className = "lens";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = lens;
    checkbox.checked = selected.includes(lens);
    const text = document.createElement("span");
    text.textContent = lens;
    label.append(checkbox, text);
    lensesGrid.appendChild(label);
  }
}

function setBusy(running) {
  for (const button of actionButtons) {
    button.disabled = running;
  }
}

async function refreshState() {
  const response = await fetch("/api/state", { cache: "no-store" });
  const nextState = await response.json();
  appState = nextState;

  setStatus(nextState.status, nextState.running);
  renderSummary(nextState.summary);
  renderDigestPreview(nextState.digestPreview);
  renderLogs(nextState.logs);
  renderLensOptions(nextState.lenses || [], nextState.profile?.selectedLenses || []);
  riskSelect.value = nextState.profile?.riskAppetite || "balanced";
  setBusy(Boolean(nextState.running));
}

async function runAction(type, extra = {}) {
  const response = await fetch("/api/action", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      type,
      ...extra,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    await refreshState();
    window.alert(payload.error || "Action failed.");
    return;
  }
  await refreshState();
}

for (const button of actionButtons) {
  button.addEventListener("click", async () => {
    const action = button.dataset.action;
    if (!action) {
      return;
    }

    if (action === "lookup") {
      const query = lookupInput.value.trim();
      if (!query) {
        window.alert("Type a lookup question first.");
        return;
      }
      await runAction("lookup", { query });
      return;
    }

    if (action === "profile-save") {
      const lenses = selectedLenses();
      if (lenses.length === 0) {
        window.alert("Select at least one lens.");
        return;
      }
      await runAction("profile-save", {
        selectedLenses: lenses,
        risk: riskSelect.value,
      });
      return;
    }

    await runAction(action);
  });
}

showLogs.addEventListener("change", () => {
  logBox.classList.toggle("hidden", !showLogs.checked);
});

await refreshState();
setInterval(() => {
  refreshState().catch(() => {
    // keep silent between polls
  });
}, 1200);
