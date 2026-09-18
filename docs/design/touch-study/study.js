import {
  initial,
  begin,
  move,
  release,
  shoot,
  disarm,
  step,
  clamp,
  SCENARIO,
} from "./model.mjs";
const $ = (id) => document.getElementById(id),
  table = $("table"),
  world = $("world");
let state = initial(),
  frame = 0,
  previous = performance.now(),
  accumulator = 0,
  revision = "development",
  lossTimer = null,
  lastFeedback = "",
  feedbackAt = performance.now();
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
fetch("./revision.json", { cache: "no-store" })
  .then((r) => (r.ok ? r.json() : null))
  .then((v) => {
    if (v) {
      revision = v.revision;
      $("build").textContent = `T1 · ${revision.slice(0, 7)}`;
    }
  })
  .catch(() => {});
const ballNodes = state.balls.map((b) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  node.id = `ball-${b.id}`;
  node.setAttribute("r", b.r);
  node.setAttribute("fill", b.id === "cue" ? "#f4f0df" : "#d92e3d");
  node.setAttribute("stroke", "#061923");
  node.setAttribute("stroke-width", "2");
  $("balls").append(node);
  return node;
});
function screenPoint(x, y) {
  return new DOMPoint(x, y).matrixTransform(world.getScreenCTM());
}
function worldPoint(x, y) {
  return new DOMPoint(x, y).matrixTransform(world.getScreenCTM().inverse());
}
function pointerData(e) {
  const b = state.balls[0],
    p = worldPoint(e.clientX, e.clientY),
    c = screenPoint(b.x, b.y);
  return {
    radius: Math.hypot(e.clientX - c.x, e.clientY - c.y),
    angle:
      Math.hypot(p.x - b.x, p.y - b.y) < 2
        ? state.angle
        : Math.atan2(b.y - p.y, b.x - p.x),
  };
}
function layout() {
  disarm(state, "View changed · touch again");
  const portrait = innerHeight > innerWidth;
  table.setAttribute("viewBox", portrait ? "0 0 600 1100" : "0 0 1100 600");
  world.setAttribute(
    "transform",
    portrait ? "translate(550 50) rotate(90)" : "translate(50 50)",
  );
  positionStatus();
  render();
}
function positionStatus(pointer) {
  // Place status in a viewport corner that stays away from finger, cue and forward shot line.
  const box = $("status"),
    width = Math.min(330, innerWidth - 24),
    height = 58;
  const candidates = [
    { x: 12, y: 65 },
    { x: innerWidth - width - 12, y: 65 },
    { x: 12, y: innerHeight - 140 },
    { x: innerWidth - width - 12, y: innerHeight - 140 },
  ];
  const b = state.balls[0],
    points = [
      screenPoint(b.x, b.y),
      screenPoint(
        b.x + Math.cos(state.angle) * 180,
        b.y + Math.sin(state.angle) * 180,
      ),
    ];
  if (pointer) points.push({ x: pointer.clientX, y: pointer.clientY });
  const score = (c) =>
    Math.min(
      ...points.map((p) =>
        Math.hypot(
          Math.max(c.x - p.x, 0, p.x - c.x - width),
          Math.max(c.y - p.y, 0, p.y - c.y - height),
        ),
      ),
    );
  const best = pointer
    ? candidates.sort((a, b) => score(b) - score(a))[0]
    : { x: 12, y: 112 };
  box.style.left = `${best.x}px`;
  box.style.top = `${Math.max(8, best.y)}px`;
  $("power").style.left = `${best.x}px`;
  $("power").style.top = `${Math.max(8, best.y) + box.offsetHeight + 3}px`;
}
function setLine(id, x1, y1, x2, y2) {
  for (const [k, v] of Object.entries({ x1, y1, x2, y2 }))
    $(id).setAttribute(k, v);
}
function render() {
  state.balls.forEach((b, i) => {
    ballNodes[i].setAttribute("cx", b.x);
    ballNodes[i].setAttribute("cy", b.y);
  });
  const b = state.balls[0],
    dx = Math.cos(state.angle),
    dy = Math.sin(state.angle),
    pull = state.power * 65;
  setLine("aim-line", b.x, b.y, b.x + dx * 240, b.y + dy * 240);
  setLine(
    "cue",
    b.x - dx * (28 + pull),
    b.y - dy * (28 + pull),
    b.x - dx * (200 + pull),
    b.y - dy * (200 + pull),
  );
  $("neutral").setAttribute("cx", b.x);
  $("neutral").setAttribute("cy", b.y);
  const scale = Math.hypot(world.getScreenCTM().a, world.getScreenCTM().b);
  $("neutral").setAttribute(
    "r",
    state.gesture ? (state.gesture.startRadius + 18.9) / scale : 35,
  );
  $("neutral").style.display = state.gesture ? "" : "none";
  $("aim").style.display = state.phase === "rolling" ? "none" : "";
  $("game").classList.toggle("holding", !!state.gesture);
  $("game").classList.toggle("rolling", state.phase === "rolling");
  const text = !state.owner
    ? "TURN LOST · restore in Shot controls"
    : state.phase === "armed"
      ? `ARMED ${Math.round(state.power * 100)}% · return inward to abort`
      : state.phase === "aiming"
        ? "NOT ARMED · lift to abort"
        : state.last;
  if ($("status").textContent !== text) $("status").textContent = text;
  if (text !== lastFeedback) {
    lastFeedback = text;
    feedbackAt = performance.now();
  }
  $("game").classList.toggle(
    "quiet",
    state.phase === "ready" &&
      state.owner &&
      performance.now() - feedbackAt > 5000,
  );
  $("power").firstElementChild.style.width = `${state.power * 100}%`;
  $("shoot").disabled = state.phase !== "armed" || !state.owner;
  $("spin-open").disabled = !!state.gesture || state.phase === "rolling";
  $("arm").disabled = !state.owner || state.phase === "rolling";
}
function cancel(reason) {
  disarm(state, reason);
  recordEvent(reason);
  render();
}
function recordEvent(type) {
  events.push({ type, at: performance.now(), phase: state.phase });
  if (events.length > 30) events.shift();
}
const events = [];
table.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || !e.isPrimary) return;
  const p = worldPoint(e.clientX, e.clientY);
  if (p.x < 0 || p.x > 1000 || p.y < 0 || p.y > 500) return;
  const data = pointerData(e);
  if (begin(state, e.pointerId, data.radius)) {
    table.setPointerCapture(e.pointerId);
    move(state, e.pointerId, data.angle, data.radius);
    positionStatus(e);
    recordEvent("pointerdown");
    render();
  }
});
table.addEventListener("pointermove", (e) => {
  if (state.gesture?.id !== e.pointerId) return;
  const d = pointerData(e);
  move(state, e.pointerId, d.angle, d.radius);
  positionStatus(e);
  render();
});
table.addEventListener("pointerup", (e) => {
  if (state.gesture?.id !== e.pointerId) return;
  const d = pointerData(e);
  move(state, e.pointerId, d.angle, d.radius);
  release(state, e.pointerId);
  recordEvent("pointerup");
  render();
});
for (const event of ["pointercancel", "lostpointercapture"])
  table.addEventListener(event, (e) => {
    if (state.gesture?.id === e.pointerId) {
      cancel(`${event} · disarmed`);
      recordEvent(event);
    }
  });
table.addEventListener("contextmenu", (e) => e.preventDefault());
addEventListener("blur", () => cancel("Input interrupted · disarmed"));
addEventListener("pagehide", () => cancel("Page left · disarmed"));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancel("Backgrounded · disarmed");
});
addEventListener("resize", layout);
screen.orientation?.addEventListener("change", layout);
$("reset").onclick = () => {
  clearTimeout(lossTimer);
  lossTimer = null;
  state = initial();
  $("mapping").value = "linear";
  $("angle").value = 0;
  $("alt-power").value = 40;
  syncAlternative();
  syncContact();
  $("ownership").textContent = "Simulate turn loss";
  $("owner-note").textContent = "You have the table.";
  state.last = "Reset · touch, orbit, pull away";
  recordEvent("reset");
  positionStatus();
  render();
};
function openDialog(id) {
  cancel("Controls open · disarmed");
  $(id).showModal();
}
$("controls-open").onclick = () => openDialog("controls");
$("spin-open").onclick = () => openDialog("spin");
for (const id of ["controls", "spin"]) {
  $(id).addEventListener("cancel", () => cancel("Aborted"));
  $(id).addEventListener("close", () => {
    if (state.phase !== "rolling" && state.last !== "Aborted")
      cancel("Ready · touch, orbit, pull away");
  });
}
$("mapping").onchange = () => {
  cancel("Power mapping changed");
  state.mapping = $("mapping").value;
};
function syncAlternative() {
  state.angle = (Number($("angle").value) * Math.PI) / 180;
  $("angle-value").textContent = `${$("angle").value}°`;
  $("alt-power-value").textContent = `${$("alt-power").value}%`;
}
for (const id of ["angle", "alt-power"])
  $(id).oninput = () => {
    cancel("Settings changed · arm again");
    syncAlternative();
    render();
  };
$("arm").onclick = () => {
  if (!state.owner || state.phase === "rolling") return;
  syncAlternative();
  state.power = Number($("alt-power").value) / 100;
  state.phase = "armed";
  render();
};
$("shoot").onclick = () => {
  if (shoot(state)) {
    $("controls").close();
    state.last = "Shot away";
    render();
  }
};
$("abort").onclick = () => cancel("Aborted");
function changeOwnership(owned) {
  state.owner = owned;
  cancel(state.owner ? "Turn restored" : "Turn lost · disarmed");
  $("ownership").textContent = state.owner
    ? "Simulate turn loss"
    : "Restore my turn";
  $("owner-note").textContent = state.owner
    ? "You have the table."
    : "No shot can start until your turn returns.";
}
$("ownership").onclick = () => changeOwnership(!state.owner);
$("scheduled-loss").onclick = () => {
  clearTimeout(lossTimer);
  $("controls").close();
  state.last = "Turn will end in 3s · try a held shot";
  lossTimer = setTimeout(() => {
    lossTimer = null;
    changeOwnership(false);
  }, 3000);
  render();
};
$("controls").addEventListener("keydown", (e) => {
  if (e.key === "Escape") cancel("Aborted");
  if (
    !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) ||
    e.target.tagName === "SELECT"
  )
    return;
  e.preventDefault();
  const delta = ["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : -1;
  if (e.shiftKey)
    $("alt-power").value = clamp(
      Number($("alt-power").value) + delta * 5,
      5,
      100,
    );
  else $("angle").value = (Number($("angle").value) + delta * 5 + 360) % 360;
  cancel("Settings changed · arm again");
  syncAlternative();
  render();
});
function syncContact() {
  const { x, y } = state.contact;
  $("contact-x").value = Math.round(x * 100);
  $("contact-y").value = Math.round(y * 100);
  $("contact-dot").style.left = `${50 + x * 40}%`;
  $("contact-dot").style.top = `${50 + y * 40}%`;
  const label =
    [
      y < -0.1 ? "Topspin" : y > 0.1 ? "Backspin" : "",
      x < -0.1 ? "left" : x > 0.1 ? "right" : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Centre";
  $("contact-label").textContent = label;
  $("spin-open").textContent = `Contact · ${label.toLowerCase()}`;
}
function setContact(x, y) {
  const length = Math.max(1, Math.hypot(x, y));
  state.contact = { x: x / length, y: y / length };
  syncContact();
}
for (const id of ["contact-x", "contact-y"])
  $(id).oninput = () =>
    setContact(
      Number($("contact-x").value) / 100,
      Number($("contact-y").value) / 100,
    );
$("contact-reset").onclick = () => setContact(0, 0);
let contactPointer = null;
function contactInput(e) {
  const r = $("contact-pad").getBoundingClientRect();
  setContact(
    (e.clientX - r.left - r.width / 2) / (r.width * 0.4),
    (e.clientY - r.top - r.height / 2) / (r.height * 0.4),
  );
}
$("contact-pad").onpointerdown = (e) => {
  if (!e.isPrimary || e.button !== 0) return;
  contactPointer = e.pointerId;
  $("contact-pad").setPointerCapture(e.pointerId);
  contactInput(e);
};
$("contact-pad").onpointermove = (e) => {
  if (e.pointerId === contactPointer) contactInput(e);
};
for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
  $("contact-pad").addEventListener(name, () => {
    contactPointer = null;
  });
function tick(now) {
  const elapsed = Math.min((now - previous) / 1000, 0.05);
  previous = now;
  accumulator += elapsed;
  while (accumulator >= 1 / 120) {
    step(state, 1 / 120);
    accumulator -= 1 / 120;
  }
  frame++;
  render();
  requestAnimationFrame(tick);
}
window.touchStudy = Object.freeze({
  observe: () => ({
    version: "T1",
    revision,
    scenario: SCENARIO,
    frame,
    observedAt: performance.now(),
    phase: state.phase,
    gesture: state.gesture ? { ...state.gesture } : null,
    cueAngle: state.angle,
    power: state.power,
    mapping: state.mapping,
    contact: { ...state.contact },
    shotReady: state.phase === "armed" && state.owner,
    owner: state.owner,
    last: state.last,
    shots: state.shots,
    reducedMotion: reduced.matches,
    balls: state.balls.map((b) => ({ ...b })),
    events: events.slice(-8),
  }),
  geometry: () => ({
    cue: screenPoint(state.balls[0].x, state.balls[0].y).toJSON(),
    table: table.getBoundingClientRect().toJSON(),
  }),
  health: () => ({
    ok: document.visibilityState === "visible",
    frame,
    scenario: SCENARIO,
    revision,
  }),
});
layout();
state.last = "YOUR SHOT · touch, orbit, pull away";
render();
requestAnimationFrame(tick);
