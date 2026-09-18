const states = [
  { id: "E01", title: "Entry", kind: "entry", note: "One-handed entry actions; existing save remains visible." },
  { id: "O01", title: "Opponent selection", kind: "opponents", note: "Persona choices use labeled media fallbacks and never imply a friend is online." },
  { id: "O02", title: "Persona introduction", kind: "intro", note: "A larger persona moment clearly names the computer-controlled counterpart." },
  { id: "G01", title: "Match ready / aim", kind: "match", mode: "ready", note: "The table stays unobstructed; turn and shot readiness sit outside play." },
  { id: "G02", title: "Aim adjustment", kind: "match", mode: "aim", note: "Aim can be adjusted by touch or buttons and cancelled before power." },
  { id: "G03", title: "Power / armed shot", kind: "match", mode: "power", note: "Power and explicit commit are separate; interruption disarms the shot." },
  { id: "G04", title: "Shot in motion", kind: "match", mode: "motion", note: "All shot inputs lock until balls settle; a committed shot is never replayed." },
  { id: "G05", title: "Turn feedback", kind: "match", mode: "feedback", note: "Reaction and next action stay outside the table and can be dismissed." },
  { id: "G06", title: "Foul feedback", kind: "match", mode: "foul", note: "Text explains the foul without assuming a final pool ruleset." },
  { id: "G06·V", title: "Foul · placement variant", kind: "match", mode: "placement", stableId: "G06", note: "Mapped G06 variant: a possible placement action is shown without selecting its rules." },
  { id: "P01", title: "Pause", kind: "overlay", overlay: "pause", note: "Resume returns to the previous safe match state; exit reports save status." },
  { id: "Z01", title: "Result", kind: "result", note: "Completed match and restorable active save are kept distinct." },
  { id: "U01", title: "Update available", kind: "match", mode: "update", note: "A compact notice preserves table visibility and offers Continue or Save & reload." },
  { id: "U01·V", title: "Update deferred during shot", kind: "match", mode: "update-deferred", stableId: "U01", note: "Mapped U01 variant: reload waits for a safe boundary after a committed shot." },
  { id: "U02", title: "Saving for update", kind: "overlay", overlay: "saving", note: "Reload remains unavailable until a durable checkpoint is confirmed." },
  { id: "R01", title: "Restore offered / loading", kind: "recovery", mode: "restore", note: "Opponent, turn, and version context let the player identify the save." },
  { id: "R02", title: "Restored confirmation", kind: "recovery", mode: "restored", note: "The confirmation states ownership and that no shot was repeated." },
  { id: "R03", title: "Restore unavailable", kind: "recovery", mode: "restore-failed", note: "The save is retained; retry and safe return remain visible." },
  { id: "R03·V", title: "Start-afresh confirmation", kind: "recovery", mode: "discard-confirm", stableId: "R03", note: "Mapped R03 variant: an explicit confirmation protects the retained save from accidental discard." },
  { id: "M01", title: "Friend multiplayer lobby", kind: "multiplayer", mode: "lobby", note: "Invite and join are concepts only; same-device play remains undecided." },
  { id: "M02", title: "Waiting / joining", kind: "multiplayer", mode: "waiting", note: "Waiting can be cancelled and join errors return to a retryable lobby." },
  { id: "M03", title: "Friend / counterpart turn", kind: "match", mode: "observe", note: "Shot controls are absent while another player or counterpart owns the turn." },
  { id: "M04", title: "Reconnecting", kind: "recovery", mode: "reconnect", note: "Bounded retry reconciles state before control returns; leaving preserves recovery." },
  { id: "M05", title: "Multiplayer version mismatch", kind: "recovery", mode: "mismatch", note: "Required update, lobby, and leave paths are explicit; incompatible shots are blocked." },
  { id: "X01", title: "App / asset load failure", kind: "failure", mode: "load", note: "Essential failure blocks Start; optional media fallback remains usable." },
  { id: "X02", title: "Save / storage failure", kind: "failure", mode: "save", note: "The current session remains open and reload risk is explained." }
];

const primaryFlow = ["E01", "O01", "O02", "G01", "G02", "G03", "G04", "G05", "G01"];
let layout = "portrait";
let currentIndex = 0;
let flowStep = -1;

const $ = (selector) => document.querySelector(selector);
const stateSelect = $("#state-select");
const phoneApp = $("#phone-app");
const wireframe = $("#wireframe");

function button(label, destination, secondary = false, detail = "") {
  return `<button type="button" class="action${secondary ? " action--secondary" : ""}" data-go="${destination}"><span>${label}</span>${detail ? `<small>${detail}</small>` : ""}</button>`;
}

function header(state, action = "•••") {
  return `<header class="screen__bar"><div class="screen__title"><strong>Grenadier Pool 1998</strong><span>${state.id} · wireframe</span></div><button type="button" class="mini-action" aria-label="Audio and settings">${action}</button></header>`;
}

function baseScreen(state, content, classes = "") {
  return `<section class="screen ${classes}" data-screen="${state.id}">${header(state)}${content}</section>`;
}

function portrait(label = "Friend photo placeholder", initials = "A") {
  return `<div class="portrait-placeholder"><div><span class="portrait-placeholder__mark">${initials}</span><strong>${label}</strong><span>Missing media fallback</span></div></div>`;
}

function table(mode = "ready") {
  const balls = [
    ["", 24, 65, "C"], ["ball--dark", 68, 40, "8"], ["ball--stripe", 73, 46, "3"],
    ["", 78, 40, "5"], ["ball--stripe", 73, 34, "9"], ["ball--dark", 46, 73, "2"]
  ].map(([klass,x,y,n]) => `<span class="ball ${klass}" style="left:${x}%;top:${y}%">${n}</span>`).join("");
  const aim = ["aim", "power", "placement"].includes(mode) ? `<span class="aim-line"></span><span class="cue"></span>` : "";
  const motion = mode === "motion" ? `<span class="motion-line"></span>` : "";
  const lock = ["motion", "observe", "update-deferred"].includes(mode) ? `<span class="table-lock">controls locked</span>` : "";
  return `<div class="table" aria-label="Illustrative top-down pool table; positions are not a rules or physics specification">
    ${Array.from({length:6},()=>'<i class="pocket"></i>').join("")}${balls}${aim}${motion}${lock}
  </div>`;
}

function controls(mode) {
  if (mode === "observe") return `<div class="control-deck"><span class="control-label">Control rail · observing</span><div class="reaction"><strong>Player B is lining up</strong><span>No shot controls during their turn.</span></div>${button("Pause locally", "P01", true)}</div>`;
  if (mode === "motion" || mode === "update-deferred") return `<div class="control-deck"><span class="control-label">Shot committed</span><button class="touch-control" disabled>Balls moving…</button><button class="touch-control" disabled>Controls locked</button><div class="commit-row"><button class="touch-control" disabled>Cancel unavailable</button><button class="touch-control" disabled>Wait for settle</button></div></div>`;
  if (mode === "feedback") return `<div class="control-deck"><div class="reaction"><strong>Good contact · turn complete</strong><span>Reaction placeholder · [ball contact caption]</span></div><div class="commit-row">${button("Dismiss", "G01", true)}${button("Next turn", "G01")}</div></div>`;
  if (mode === "foul") return `<div class="control-deck"><div class="reaction"><strong>Foul · turn passes</strong><span>Exact reason follows the future ruleset. Text never relies on colour or sound.</span></div><div class="commit-row">${button("Rules note", "G06·V", true)}${button("Continue", "M03")}</div></div>`;
  if (mode === "placement") return `<div class="control-deck"><span class="control-label">Possible rules-dependent variant</span><div class="aim-pad">Drag placement area<br><small>or use arrow buttons</small></div><div class="commit-row">${button("Cancel", "G06", true)}${button("Confirm place", "G01")}</div></div>`;
  if (mode === "ready" || mode === "update") return `<div class="control-deck"><span class="control-label">Ready · touch or buttons</span><div class="aim-pad">↔ Adjust aim</div><button type="button" class="touch-control touch-control--primary" data-go="G02">Aim shot</button><div class="commit-row"><button type="button" class="touch-control" data-go="P01">Pause</button><button type="button" class="touch-control" data-go="G02">Fine aim →</button></div></div>`;
  if (mode === "aim") return `<div class="control-deck"><span class="control-label">Aim · uncommitted</span><div class="aim-pad">↔ Drag to aim<br><small>−1° &nbsp; +1°</small></div><div class="commit-row"><button type="button" class="touch-control" data-go="G01">Cancel</button><button type="button" class="touch-control touch-control--primary" data-go="G03">Set power →</button></div></div>`;
  return `<div class="control-deck"><span class="control-label">Power · shot armed</span><div class="power"><span>LOW</span><div class="power__track"></div><span>58%</span></div><div class="commit-row"><button type="button" class="touch-control" data-go="G02">Cancel</button><button type="button" class="touch-control touch-control--primary" data-go="G04">Commit shot</button></div></div>`;
}

function match(state) {
  const mode = state.mode;
  const owner = mode === "observe" ? "Player B" : "Player A";
  const subtitle = mode === "observe" ? "Their turn · observing" : mode === "motion" || mode === "update-deferred" ? "Shot committed · settling" : "Your turn · ready";
  const statusExtra = mode === "update" ? `<div class="update-inline"><span><strong>Update ready</strong></span><button data-go="U02">Save &amp; reload</button></div>` : mode === "update-deferred" ? `<div class="update-inline"><span><strong>Update after shot</strong></span><button data-go="G04">Dismiss</button></div>` : `<span class="sound-chip">♪ muted · captions on</span>`;
  return baseScreen(state, `<div class="screen__body"><div class="match-layout">
    <div class="match-status"><div class="turn-person"><span class="avatar">${owner.slice(-1)}</span><div><strong>${owner}</strong><span>${subtitle}</span></div></div>${statusExtra}</div>
    ${table(mode)}${controls(mode)}</div></div>`);
}

function renderEntry(state) {
  return baseScreen(state, `<div class="screen__body screen__body--split"><div class="hero-copy"><p class="eyebrow">Return to the Grenadier · 1998</p><h3>Who’s at the table?</h3><p>Choose a match. The controls will explain each shot before it is committed.</p><div class="inline-note">Saved match · Player A vs Placeholder counterpart · your turn</div></div><div class="action-stack">${button("Resume saved match", "R01")}${button("Play computer", "O01")}${button("Play a friend", "M01", true)}<button class="action action--secondary"><span>Audio &amp; captions</span><small>Muted · captions on</small></button></div></div>`);
}

function renderOpponents(state) {
  const people = [["A","Placeholder counterpart A","Example trait: cool"],["B","Placeholder counterpart B","Example trait: angry"],["?","Missing portrait example","Fallback remains selectable"]];
  return baseScreen(state, `<div class="screen__body"><div class="status-line"><span class="status-dot status-dot--solid"></span>Choose a computer counterpart</div><div class="persona-list">${people.map(([i,n,d])=>`<button class="persona" data-go="O02"><span class="persona__photo">${i}</span><span><strong>${n}</strong><p>${d} · computer controlled</p></span><span class="persona__chev">›</span></button>`).join("")}</div>${button("Back to entry", "E01", true)}</div>`);
}

function renderIntro(state) {
  return baseScreen(state, `<div class="screen__body screen__body--split">${portrait("Placeholder counterpart A", "A")}<div class="hero-copy"><p class="eyebrow">Computer counterpart</p><h3>Placeholder A</h3><p>Example trait: cool. This is an exaggerated computer-controlled persona, not the real friend online.</p><div class="action-stack">${button("Start match", "G01")}${button("Change opponent", "O01", true)}</div></div></div>`);
}

function modal(state, title, body, actions, extra = "") {
  return baseScreen(state, `<div class="screen__body"><div class="match-layout"><div class="match-status"><div class="turn-person"><span class="avatar">A</span><div><strong>Player A</strong><span>Safe match state</span></div></div></div>${table("ready")}${controls("ready")}</div></div><div class="modal-layer"><section class="sheet"><p class="eyebrow">${state.id} · recovery surface</p><h3>${title}</h3><p>${body}</p>${extra}<div class="action-stack">${actions}</div></section></div>`);
}

function renderOverlay(state) {
  if (state.overlay === "pause") return modal(state, "Match paused", "Your safe match state is preserved. In a remote match this pauses local controls only; the other device may continue.", `${button("Resume match", "G01")}${button("Audio & captions", "P01", true)}${button("Save & exit", "E01", true)}`);
  return modal(state, "Saving checkpoint…", "The current version stays open until the saved match is confirmed durable. Closing now may prevent a safe reload.", `${button("Cancel and keep playing", "G01", true)}`, `<div class="progress" aria-label="Saving in progress"></div><div class="inline-note">Next when confirmed: reload → R01 Restore offered</div>`);
}

function renderResult(state) {
  return baseScreen(state, `<div class="screen__body screen__body--split">${portrait("Reaction placeholder", "A")}<div class="hero-copy"><p class="eyebrow">Match complete</p><h3>Player A wins</h3><p>Illustrative result only · rules and match format are undecided.</p><ul class="detail-list"><li><span>Completed match</span><strong>Not restorable</strong></li><li><span>[result sound]</span><strong>Captioned</strong></li></ul><div class="action-stack">${button("Rematch", "O02")}${button("Choose opponent", "O01", true)}${button("Home", "E01", true)}</div></div></div>`);
}

function renderRecovery(state) {
  const content = {
    restore: ["Resume saved match?", "Saved with an earlier app version. Review the context before restoration.", `${button("Restore match", "R02")}${button("Back to home", "E01", true)}${button("Start afresh…", "R03·V", true)}`, `<ul class="detail-list"><li><span>Opponent</span><strong>Placeholder A</strong></li><li><span>Turn</span><strong>Player A</strong></li><li><span>Saved</span><strong>After last settled shot</strong></li><li><span>Version</span><strong>0.1 → 0.2</strong></li></ul>`],
    restored: ["Match restored", "You are back at the last durable checkpoint. No committed shot was repeated.", `${button("Continue · your turn", "G01")}${button("View match details", "R02", true)}`, `<div class="inline-note">Restored ownership: Player A · balls settled · version 0.2</div>`],
    "restore-failed": ["Couldn’t restore yet", "The saved match is retained. Its format may be temporarily incompatible with this app version.", `${button("Retry restore", "R01")}${button("Return home", "E01", true)}${button("Start afresh…", "R03·V", true)}`, `<div class="warning">Starting afresh requires a separate discard confirmation. Nothing was deleted.</div>`],
    "discard-confirm": ["Discard saved match?", "Starting a new match will remove this restore point. Nothing changes until you confirm.", `${button("Keep save · cancel", "R03", true)}${button("Discard save & go home", "E01")}`, `<div class="warning">Illustrative confirmation only. This wireframe does not delete data.</div><ul class="detail-list"><li><span>Retained save</span><strong>Placeholder A</strong></li><li><span>Last safe state</span><strong>Player A · ready</strong></li></ul>`],
    reconnect: ["Connection interrupted", "Shot controls are disarmed while the match state is reconciled. Attempt 2 of 3.", `${button("Retry now", "M04")}${button("Leave · keep recoverable match", "E01", true)}`, `<div class="progress"></div><div class="inline-note">If a shot was committed, its identity is checked before control returns.</div>`],
    mismatch: ["Versions don’t match", "Both players need a compatible version before another shot can be accepted.", `${button("Save & update", "U01")}${button("Stay in lobby", "M01", true)}${button("Leave match", "E01", true)}`, `<ul class="detail-list"><li><span>This device</span><strong>0.1</strong></li><li><span>Other device</span><strong>0.2</strong></li></ul>`]
  }[state.mode];
  return baseScreen(state, `<div class="screen__body screen__body--split"><div>${portrait("Saved match context", "A")}<div class="status-line"><span class="status-dot"></span>Current session protected</div></div><div class="hero-copy"><p class="eyebrow">Recovery</p><h3>${content[0]}</h3><p>${content[1]}</p>${content[3]}<div class="action-stack">${content[2]}</div></div></div>`);
}

function renderMultiplayer(state) {
  if (state.mode === "lobby") return baseScreen(state, `<div class="screen__body screen__body--split"><div class="hero-copy"><p class="eyebrow">Friend multiplayer concept</p><h3>Share the table</h3><p>Connection method and same-device play remain open. This wireframe only tests the entry and recovery structure.</p><div class="inline-note">Invite code example · G98-TABLE</div></div><div class="action-stack">${button("Create invite", "M02")}${button("Join with code", "M02", true)}${button("Back to entry", "E01", true)}</div></div>`);
  return baseScreen(state, `<div class="screen__body screen__body--split"><div>${portrait("Friend photo placeholder", "B")}<div class="progress"></div></div><div class="hero-copy"><p class="eyebrow">Joining match</p><h3>Waiting for Player B</h3><p>Both devices must be ready and compatible before either player gets shot controls.</p><ul class="detail-list"><li><span>Player A</span><strong>Ready</strong></li><li><span>Player B</span><strong>Connecting…</strong></li></ul><div class="action-stack">${button("Simulate ready", "G01")}${button("Version mismatch", "M05", true)}${button("Cancel invite", "E01", true)}</div></div></div>`);
}

function renderFailure(state) {
  if (state.mode === "load") return baseScreen(state, `<div class="screen__body screen__body--split">${portrait("Optional portrait failed · fallback", "?")}<div class="hero-copy"><p class="eyebrow">Load problem</p><h3>Table failed to load</h3><p>An essential game asset is unavailable, so Start is disabled. Optional portraits and audio use labeled fallbacks.</p><div class="warning">Essential: table interface · unavailable<br>Optional: portrait · fallback active</div><div class="action-stack">${button("Retry load", "E01")}${button("Audio & diagnostics", "X01", true)}</div></div></div>`);
  return baseScreen(state, `<div class="screen__body screen__body--split"><div class="hero-copy"><p class="eyebrow">Storage problem</p><h3>Match isn’t saved yet</h3><p>Stay on this version while save is unconfirmed. Reloading now could lose the current session.</p><div class="warning">No automatic reload. Existing saved data has not been discarded.</div></div><div class="action-stack">${button("Retry save", "U02")}${button("Continue current session", "G01", true)}${button("Return to pause", "P01", true)}</div></div>`);
}

function renderState(state) {
  if (state.kind === "entry") return renderEntry(state);
  if (state.kind === "opponents") return renderOpponents(state);
  if (state.kind === "intro") return renderIntro(state);
  if (state.kind === "match") return match(state);
  if (state.kind === "overlay") return renderOverlay(state);
  if (state.kind === "result") return renderResult(state);
  if (state.kind === "recovery") return renderRecovery(state);
  if (state.kind === "multiplayer") return renderMultiplayer(state);
  return renderFailure(state);
}

function annotationsFor() {
  const common = layout === "portrait" ? [
    ["390 × 844 CSS px", "Representative modern iPhone viewport. Top and bottom safe-area bands remain reserved."],
    ["Thumb zone", "Aim, cancel, power, and commit live in the lower third. Primary targets are at least 44 × 44 CSS px."],
    ["Table first", "The table stays full width and unobscured. Notices and persona reactions occupy separate layers."]
  ] : [
    ["844 × 390 CSS px", "Representative phone landscape viewport. Side safe-area bands protect controls around cutouts and home indicators."],
    ["Right control rail", "A dedicated 224px rail separates shot input from the table and suits right-thumb reach; mirroring must be tested for left-handed use."],
    ["Wide table", "The table gets the largest region. Status and update notices avoid ball positions; overlays enter from the control edge."]
  ];
  common.push(["Android + accessibility", "Use dynamic viewport units and env(safe-area-inset-*). Keep 16px body text in implementation, visible focus, button alternatives, captions, reduced motion, and patterned balls."]);
  return common.map(([title,body])=>`<div class="annotation"><strong>${title}</strong><p>${body}</p></div>`).join("");
}

function setState(index, updateUrl = true) {
  currentIndex = (index + states.length) % states.length;
  const state = states[currentIndex];
  stateSelect.value = state.id;
  $("#state-count").textContent = `${currentIndex + 1} / ${states.length}`;
  $("#preview-title").textContent = `${state.id} · ${state.title}`;
  $("#preview-note").textContent = state.note;
  phoneApp.innerHTML = renderState(state);
  $("#annotations").innerHTML = annotationsFor();
  document.querySelectorAll("#flow-list button").forEach(el => el.classList.toggle("is-current", el.dataset.flow === state.id));
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("layout", layout);
    url.searchParams.set("state", state.id);
    history.replaceState({}, "", url);
  }
}

function resetWalkthrough() {
  flowStep = -1;
  $("#walk-flow").textContent = "Walk the flow";
  $("#flow-note").textContent = "Every step has a visible next action. Use “Walk the flow” to move through the states in order.";
}

function setLayout(next, updateUrl = true) {
  layout = next;
  wireframe.className = `device device--${layout}`;
  document.querySelectorAll("[data-layout]").forEach(el => {
    const active = el.dataset.layout === layout;
    el.classList.toggle("is-active", active);
    el.setAttribute("aria-pressed", String(active));
  });
  $("#preview-kicker").textContent = layout === "portrait" ? "Candidate A · Portrait" : "Candidate B · Landscape";
  const narrowPortrait = layout === "portrait" && window.innerWidth < 390;
  $("#landscape-hint").hidden = layout !== "landscape" && !narrowPortrait;
  $("#landscape-hint").textContent = layout === "landscape"
    ? "Landscape stays at its actual 844 × 390 CSS px reference size. Scroll sideways on a narrow portrait screen, or rotate the device."
    : "Portrait stays at its actual 390 × 844 CSS px reference size. Scroll sideways only if this viewport is narrower than the reference device.";
  $("#annotations").innerHTML = annotationsFor();
  if (updateUrl) setState(currentIndex);
}

states.forEach(state => stateSelect.insertAdjacentHTML("beforeend", `<option value="${state.id}">${state.id} · ${state.title}</option>`));
$("#flow-list").innerHTML = primaryFlow.map((id,index)=>`<li><button type="button" data-flow="${id}"><strong>${id}</strong><small>${index === 0 ? "Entry" : index === primaryFlow.length-1 ? "Ready" : states.find(s=>s.id===id).title.split(" /")[0]}</small></button></li>`).join("");

document.addEventListener("click", event => {
  const go = event.target.closest("[data-go]");
  if (go) {
    resetWalkthrough();
    const index = states.findIndex(state => state.id === go.dataset.go);
    if (index >= 0) setState(index);
  }
  const flow = event.target.closest("[data-flow]");
  if (flow) {
    resetWalkthrough();
    setState(states.findIndex(state => state.id === flow.dataset.flow));
  }
});
document.querySelectorAll("[data-layout]").forEach(el => el.addEventListener("click", () => { resetWalkthrough(); setLayout(el.dataset.layout); }));
stateSelect.addEventListener("change", () => { resetWalkthrough(); setState(states.findIndex(state => state.id === stateSelect.value)); });
$("#previous-state").addEventListener("click", () => { resetWalkthrough(); setState(currentIndex - 1); });
$("#next-state").addEventListener("click", () => { resetWalkthrough(); setState(currentIndex + 1); });
$("#walk-flow").addEventListener("click", () => {
  flowStep = (flowStep + 1) % primaryFlow.length;
  const id = primaryFlow[flowStep];
  setState(states.findIndex(state => state.id === id));
  $("#flow-note").textContent = `Step ${flowStep + 1} of ${primaryFlow.length}: ${id} · ${states.find(state=>state.id===id).title}`;
  $("#walk-flow").textContent = flowStep === primaryFlow.length - 1 ? "Restart flow" : "Next flow step";
});

const params = new URLSearchParams(location.search);
if (params.get("embed") === "1") document.body.classList.add("embed");
if (["portrait","landscape"].includes(params.get("layout"))) layout = params.get("layout");
const requestedIndex = states.findIndex(state => state.id === params.get("state"));
setLayout(layout, false);
setState(requestedIndex >= 0 ? requestedIndex : 0, false);
window.addEventListener("resize", () => setLayout(layout, false));
