import { createPractice } from './model.mjs';
import { PRACTICE_LAYOUTS } from './layouts.mjs';
import { TUNING, DEFAULT_TUNING, boundedSetting } from './tuning.mjs';
import { aimGuide } from './guide.mjs';
import { createGesture } from './input.mjs';

const $ = (id) => document.getElementById(id);
const table = $('table'), world = $('world'), game = $('game');
const settings = { ...DEFAULT_TUNING };
let selectedLayout = PRACTICE_LAYOUTS[0];
const simulation = createPractice({ scenario: selectedLayout, pocketScale: settings.pocketSize / 100 }), gesture = createGesture();
let TABLE = simulation.table;
let strength = settings.strength, aimAngle = -Math.PI / 2;
let frame = 0, observedAt = performance.now(), buildRevision = 'local-unbuilt';
let previous = null, accumulator = 0, paused = document.hidden, fault = null;
let seenEvent = 0, feedbackUntil = performance.now() + 5000, feedback = null;
let observation;
let placement = null, placementContact = null;
const ballNodes = new Map();
const namespace = 'http://www.w3.org/2000/svg';
function node(tag, attrs, parent) {
  const element = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  parent.append(element);
  return element;
}
function drawGeometry() {
  for (const id of ['pockets', 'rails', 'jaws']) $(id).replaceChildren();
  for (const p of TABLE.pockets) {
    const { x, y, nx, ny, tx, ty, halfWidth } = p.mouth;
    const corners = [-1, 1].map(sign => [x + sign * tx * halfWidth, y + sign * ty * halfWidth]);
    const back = corners.map(([px, py]) => [px + nx * p.captureDepth, py + ny * p.captureDepth]);
    node('polygon', { id: `mouth-${p.id}`, points: [...corners, ...back.reverse()].map(p => p.join(',')).join(' '), fill: '#020b0b' }, $('pockets'));
    node('circle', { id: `pocket-${p.id}`, cx: p.x, cy: p.y, r: p.r, fill: '#020b0b', stroke: '#9a753b', 'stroke-width': 2 }, $('pockets'));
  }
  for (const r of TABLE.rails) {
    const ox = r.x1 === r.x2 ? (r.x1 === 0 ? -12 : 12) : 0;
    const oy = r.y1 === r.y2 ? (r.y1 === 0 ? -12 : 12) : 0;
    node('polygon', { points: [[r.x1, r.y1], [r.x2, r.y2], [r.x2 + ox, r.y2 + oy], [r.x1 + ox, r.y1 + oy]].map(p => p.join(',')).join(' '), fill: '#063f30' }, $('rails'));
    node('line', { id: `rail-${r.id}`, x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2, stroke: '#2a8e6b', 'stroke-width': 1 }, $('rails'));
  }
  for (const j of TABLE.jaws) {
    node('circle', { id: `jaw-${j.id}`, cx: j.x, cy: j.y, r: j.r, fill: '#063f30' }, $('jaws'));
  }
}
drawGeometry();
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function matrix() {
  const m = world.getScreenCTM();
  return { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f };
}
function screenPoint(x, y) { return new DOMPoint(x, y).matrixTransform(world.getScreenCTM()); }
function worldPoint(x, y) { return new DOMPoint(x, y).matrixTransform(world.getScreenCTM().inverse()); }
function pointerData(event) {
  const cue = simulation.snapshot().balls.find(b => b.role === 'cue');
  const c = screenPoint(cue.x, cue.y), p = worldPoint(event.clientX, event.clientY);
  return { radius: Math.hypot(event.clientX - c.x, event.clientY - c.y), angle: Math.hypot(p.x - cue.x, p.y - cue.y) < 2 ? aimAngle : Math.atan2(cue.y - p.y, cue.x - p.x) };
}
function cancel() {
  const active = gesture.snapshot();
  gesture.cancel();
  const placing = placementContact; placementContact = null;
  if (placing && table.hasPointerCapture(placing.pointerId)) table.releasePointerCapture(placing.pointerId);
  if (active && table.hasPointerCapture(active.pointerId)) table.releasePointerCapture(active.pointerId);
}
function setPlacementCandidate(x, y) {
  const state = simulation.snapshot();
  placement = { pending: true, candidate: { x, y }, ...simulation.placementValidity({ x, y }),
    epoch: state.epoch, committed: null };
}
function preparePlacement(state) {
  if (placement?.epoch !== state.epoch) placement = null;
  if (state.phase !== 'placing-white') return;
  if (placement?.pending) return;
  // Centre first, then a bounded felt grid. Four balls cannot occupy every spot.
  const candidates = [{ x: 500, y: 250 }];
  for (let y = 50; y <= 450; y += 50) for (let x = 50; x <= 950; x += 50) candidates.push({ x, y });
  const candidate = candidates.find(p => simulation.placementValidity(p).valid) || candidates[0];
  setPlacementCandidate(candidate.x, candidate.y);
  syncPlacementControls();
}
function syncPlacementControls() {
  if (!placement?.pending) return;
  $('placement-x').value = placement.candidate.x.toFixed(2);
  $('placement-y').value = placement.candidate.y.toFixed(2);
}
function commitPlacement(epoch) {
  if (!placement?.pending || paused || fault || !simulation.placeWhite({ ...placement.candidate, epoch })) return false;
  placement = { ...placement, pending: false, committed: { ...placement.candidate, epoch }, valid: true, reason: null };
  feedbackUntil = performance.now() + 5000;
  return true;
}
function placementHint() {
  if (placement?.valid) return 'Clear spot · release to place · Menu for keyboard controls';
  return { occupied: 'Ball in the way · choose a clear spot', cushion: 'Too close to a cushion · move onto clear felt',
    pocket: 'Too close to a pocket · move onto clear felt', 'invalid-coordinate': 'Enter a position on the table' }[placement?.reason] || 'Choose clear felt';
}
function layout() {
  cancel();
  const portrait = innerHeight > innerWidth;
  table.setAttribute('viewBox', portrait ? '0 0 620 1120' : '0 0 1120 620');
  world.setAttribute('transform', portrait ? 'translate(560 60) rotate(90)' : 'translate(60 60)');
  render();
}
function positionFeedback(pointer) {
  const box = $('feedback');
  if (!pointer) { box.style.left = ''; box.style.top = ''; box.style.bottom = ''; return; }
  const width = Math.min(310, innerWidth - 24), height = box.offsetHeight || 80;
  const cue = simulation.snapshot().balls.find(b => b.role === 'cue');
  const cueScreen = screenPoint(cue.x, cue.y);
  const points = [pointer, cueScreen, screenPoint(cue.x + Math.cos(aimAngle) * 180, cue.y + Math.sin(aimAngle) * 180)];
  const candidates = [{ x: 12, y: 115 }, { x: innerWidth - width - 12, y: 115 }, { x: 12, y: innerHeight - height - 36 }, { x: innerWidth - width - 12, y: innerHeight - height - 36 }];
  const score = c => Math.min(...points.map(p => Math.hypot(Math.max(c.x - p.x, 0, p.x - c.x - width), Math.max(c.y - p.y, 0, p.y - c.y - height))));
  const best = candidates.sort((a, b) => score(b) - score(a))[0];
  box.style.left = `${best.x}px`; box.style.top = `${best.y}px`; box.style.bottom = 'auto';
}
function line(id, x1, y1, x2, y2) {
  for (const [key, value] of Object.entries({ x1, y1, x2, y2 })) $(id).setAttribute(key, value);
}
function render() {
  const state = simulation.snapshot(), active = gesture.snapshot();
  preparePlacement(state);
  const placing = state.phase === 'placing-white' && !fault;
  const visibleCandidate = placing && Number.isFinite(placement.candidate.x) && Number.isFinite(placement.candidate.y);
  $('placement-preview').style.display = visibleCandidate ? '' : 'none';
  if (visibleCandidate) {
    $('placement-preview').setAttribute('cx', placement.candidate.x);
    $('placement-preview').setAttribute('cy', placement.candidate.y);
    $('placement-preview').classList.toggle('invalid', !placement.valid);
  }
  $('placement-controls').hidden = !placing;
  $('placement-confirm').disabled = !placing || !placement.valid || paused;
  const keyboardPlacementHint = placement?.valid ? 'Clear spot · choose Place white to confirm' : placementHint();
  if (placing && $('placement-feedback').textContent !== keyboardPlacementHint) $('placement-feedback').textContent = keyboardPlacementHint;
  for (const b of state.balls) {
    if (!ballNodes.has(b.id)) ballNodes.set(b.id, node('circle', { id: `ball-${b.id}`, r: b.r, fill: b.role === 'cue' ? 'url(#white-ball)' : 'url(#red-ball)', stroke: '#05231d', 'stroke-width': 1 }, $('balls')));
    const el = ballNodes.get(b.id);
    el.setAttribute('cx', b.x); el.setAttribute('cy', b.y);
    el.style.display = b.status === 'live' ? '' : 'none';
  }
  const cue = state.balls.find(b => b.role === 'cue'), dx = Math.cos(aimAngle), dy = Math.sin(aimAngle);
  const pull = active?.pull || 0;
  const guide = aimGuide(cue, state.balls, TABLE, aimAngle, TABLE.width * settings.guideLength / 100);
  line('aim-line', cue.x, cue.y, guide.x, guide.y);
  $('contact-marker').setAttribute('cx', guide.x); $('contact-marker').setAttribute('cy', guide.y);
  $('contact-marker').setAttribute('r', cue.r);
  $('contact-marker').style.display = settings.contactMarker && guide.hit ? '' : 'none';
  $('aim').classList.toggle('locked', !!active?.locked);
  line('cue', cue.x - dx * (28 + pull * 65), cue.y - dy * (28 + pull * 65), cue.x - dx * (180 + pull * 65), cue.y - dy * (180 + pull * 65));
  $('neutral').setAttribute('cx', cue.x); $('neutral').setAttribute('cy', cue.y);
  const m = matrix();
  $('neutral').setAttribute('r', active ? (active.startRadius + 18.9) / Math.hypot(m.a, m.b) : 0);
  $('aim').style.display = state.phase === 'ready' && !fault ? '' : 'none';
  $('neutral').style.display = active ? '' : 'none';
  $('count').textContent = `${state.potCount}/3`;
  $('layout-name').textContent = selectedLayout.name;
  for (const event of state.events) {
    if (event.seq <= seenEvent) continue;
    seenEvent = event.seq;
    if (event.type === 'pot' || event.type === 'scratch') {
      feedback = event.type === 'scratch' ? 'White potted' : 'Ball potted';
      feedbackUntil = performance.now() + 2200;
    }
  }
  const phase = fault ? 'fault' : state.phase;
  const messages = {
    ready: [selectedLayout.name, 'Drag away from the white · release to shoot'],
    rolling: ['Balls rolling', 'Wait for the table to settle'],
    'placing-white': ['Place the white', placementHint()],
    cleared: ['Table cleared', 'Re-rack when you’re ready'],
    fault: ['Practice paused', 'The table could not progress safely. Re-rack to recover.'],
  };
  let [title, hint] = messages[phase] || messages.fault;
  if (paused) { title = 'Practice paused'; hint = 'Return to the table to continue'; }
  if (active) { title = active.armed ? `Release to shoot · ${Math.round(active.power * 100)}%` : 'Aim · pull to add power'; hint = active.locked ? 'Aim locked · return inward to re-aim or abort' : 'Aim freely · return inward and lift to abort'; }
  else if (feedback && performance.now() < feedbackUntil && phase === 'rolling') title = feedback;
  if ($('status').textContent !== title) $('status').textContent = title;
  if ($('hint').textContent !== hint) $('hint').textContent = hint;
  $('power').firstElementChild.style.width = `${(active?.power || 0) * 100}%`;
  game.classList.toggle('holding', !!active); game.classList.toggle('rolling', phase === 'rolling');
  game.classList.toggle('quiet', phase === 'ready' && !active && performance.now() > feedbackUntil);
  $('shoot').disabled = phase !== 'ready' || paused;
  observation = freeze({ ...state, contractVersion: 1, buildRevision, frame, observedAt,
    fault: fault || state.fault || null,
    phase: fault ? 'fault' : active && state.phase === 'ready' ? 'aiming' : state.phase,
    shotReady: state.phase === 'ready' && !paused && !fault && !active,
    strength, tuning: { ...settings }, guide, aimAngle, pull: active?.pull || 0, power: active?.power || 0, gesture: active,
    paused, placement: placement ? { ...placement, pointerId: placementContact?.pointerId ?? null } : null, health: { ok: !fault && state.phase !== 'fault', paused, fault: fault || state.fault || null },
    geometry: { matrix: m, width: TABLE.width, height: TABLE.height, ballRadius: TABLE.ballRadius, rails: TABLE.rails, jaws: TABLE.jaws, pockets: TABLE.pockets },
  });
}
table.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || $('menu').open || paused || fault) return;
  const state = simulation.snapshot();
  if (state.phase === 'placing-white') {
    if (placementContact) return;
    const p = worldPoint(event.clientX, event.clientY);
    placementContact = { pointerId: event.pointerId, epoch: state.epoch };
    setPlacementCandidate(p.x, p.y); syncPlacementControls();
    table.setPointerCapture(event.pointerId);
    positionFeedback({ x: event.clientX, y: event.clientY }); render(); return;
  }
  if (state.phase !== 'ready') return;
  const p = worldPoint(event.clientX, event.clientY);
  if (p.x < 0 || p.x > TABLE.width || p.y < 0 || p.y > TABLE.height) return;
  const d = pointerData(event);
  if (gesture.begin(event.pointerId, d.radius, simulation.snapshot().epoch, { ...settings, angle: d.angle })) {
    table.setPointerCapture(event.pointerId);
    gesture.move(event.pointerId, d.radius, d.angle); aimAngle = gesture.snapshot().angle;
    positionFeedback({ x: event.clientX, y: event.clientY }); render();
  }
});
table.addEventListener('pointermove', event => {
  if (placementContact?.pointerId === event.pointerId) {
    const p = worldPoint(event.clientX, event.clientY);
    setPlacementCandidate(p.x, p.y); syncPlacementControls();
    positionFeedback({ x: event.clientX, y: event.clientY }); render(); return;
  }
  if (gesture.snapshot()?.pointerId !== event.pointerId) return;
  const d = pointerData(event);
  gesture.move(event.pointerId, d.radius, d.angle); aimAngle = gesture.snapshot().angle;
  positionFeedback({ x: event.clientX, y: event.clientY }); render();
});
table.addEventListener('pointerup', event => {
  if (placementContact?.pointerId === event.pointerId) {
    const contact = placementContact; placementContact = null;
    const p = worldPoint(event.clientX, event.clientY);
    setPlacementCandidate(p.x, p.y); syncPlacementControls();
    commitPlacement(contact.epoch);
    if (table.hasPointerCapture(event.pointerId)) table.releasePointerCapture(event.pointerId);
    positionFeedback(); render(); return;
  }
  if (gesture.snapshot()?.pointerId !== event.pointerId) return;
  const d = pointerData(event);
  gesture.move(event.pointerId, d.radius, d.angle); aimAngle = gesture.snapshot().angle;
  const shot = gesture.release(event.pointerId, simulation.snapshot().epoch);
  if (table.hasPointerCapture(event.pointerId)) table.releasePointerCapture(event.pointerId);
  if (shot && !paused && !fault) { simulation.shoot({ ...shot, strength }); accumulator = 0; previous = null; }
  positionFeedback(); render();
});
for (const event of ['pointercancel', 'lostpointercapture']) table.addEventListener(event, e => {
  if (gesture.snapshot()?.pointerId === e.pointerId || placementContact?.pointerId === e.pointerId) { cancel(); render(); }
});
window.addEventListener('blur', () => { cancel(); render(); });
window.addEventListener('pagehide', () => { cancel(); paused = true; previous = null; accumulator = 0; render(); });
window.addEventListener('pageshow', () => { paused = document.hidden; previous = null; accumulator = 0; render(); });
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', layout);
document.addEventListener('visibilitychange', () => {
  cancel(); paused = document.hidden; previous = null; accumulator = 0; render();
});
$('menu-open').addEventListener('click', () => {
  cancel(); syncSettings(); syncPlacementControls(); $('angle').value = String(Math.round(aimAngle * 180 / Math.PI * 1000) / 1000);
  $('menu').showModal(); positionFeedback(); render();
});
$('menu-close').addEventListener('click', () => $('menu').close());
$('menu').addEventListener('cancel', cancel);
$('menu').addEventListener('close', () => { cancel(); render(); });
function syncSettings() {
  for (const [key, id, suffix] of [
    ['strength', 'strength', '×'], ['guideLength', 'guide-length', '%'],
    ['lockDistance', 'lock-distance', ' px'], ['pocketSize', 'pocket-size', '%'],
  ]) {
    const spec = TUNING[key];
    Object.assign($(id), { min: spec.min, max: spec.max, step: spec.step, value: settings[key] });
    $(`${id}-value`).textContent = `${key === 'strength' ? settings[key].toFixed(1) : settings[key]}${suffix}`;
  }
  $('lock-aim').checked = settings.lockAim; $('contact-toggle').checked = settings.contactMarker;
  $('lock-distance').disabled = !settings.lockAim;
  $('pocket-apply').disabled = true;
}
for (const [key, id, suffix] of [
  ['strength', 'strength', '×'], ['guideLength', 'guide-length', '%'], ['lockDistance', 'lock-distance', ' px'],
]) $(id).addEventListener('input', () => {
  cancel(); settings[key] = boundedSetting(key, Number($(id).value)); strength = settings.strength;
  $(`${id}-value`).textContent = `${key === 'strength' ? settings[key].toFixed(1) : settings[key]}${suffix}`;
  render();
});
for (const [key, id] of [['lockAim', 'lock-aim'], ['contactMarker', 'contact-toggle']]) $(id).addEventListener('change', () => {
  cancel(); settings[key] = $(id).checked; $('lock-distance').disabled = !settings.lockAim; render();
});
$('pocket-size').addEventListener('input', () => {
  cancel(); const size = boundedSetting('pocketSize', Number($('pocket-size').value));
  $('pocket-size-value').textContent = `${size}%`;
  $('pocket-apply').disabled = size === settings.pocketSize;
});
$('pocket-apply').addEventListener('click', () => {
  settings.pocketSize = boundedSetting('pocketSize', Number($('pocket-size').value));
  rerack(); syncSettings(); $('menu').close();
});
$('defaults').addEventListener('click', () => {
  Object.assign(settings, DEFAULT_TUNING); strength = settings.strength;
  rerack(); syncSettings(); $('menu').close();
});
syncSettings();
for (const id of ['placement-x', 'placement-y']) $(id).addEventListener('input', () => {
  cancel();
  if (simulation.snapshot().phase !== 'placing-white') return;
  setPlacementCandidate($('placement-x').valueAsNumber, $('placement-y').valueAsNumber); render();
});
$('placement-confirm').addEventListener('click', () => {
  cancel();
  if (commitPlacement(simulation.snapshot().epoch)) $('menu').close();
  positionFeedback(); render();
});
$('angle').addEventListener('input', () => {
  cancel(); if (Number.isFinite($('angle').valueAsNumber)) aimAngle = $('angle').valueAsNumber * Math.PI / 180;
  render();
});
$('keyboard-power').addEventListener('input', () => { cancel(); $('keyboard-power-value').textContent = `${Math.round(Number($('keyboard-power').value) * 100)}%`; render(); });
$('shoot').addEventListener('click', () => {
  cancel();
  if (!paused && !fault && simulation.shoot({ angle: aimAngle, power: Number($('keyboard-power').value), strength, epoch: simulation.snapshot().epoch })) {
    $('menu').close(); previous = null; accumulator = 0; render();
  }
});
function rerack() {
  cancel(); simulation.resetScenario(selectedLayout, { pocketScale: settings.pocketSize / 100 });
  TABLE = simulation.table; drawGeometry(); fault = null; previous = null; accumulator = 0;
  aimAngle = -Math.PI / 2; $('angle').value = '-90'; seenEvent = 0; feedback = null; feedbackUntil = performance.now() + 5000;
  positionFeedback(); render();
}
$('reset').addEventListener('click', rerack);
$('practice-layout').addEventListener('change', () => {
  selectedLayout = PRACTICE_LAYOUTS.find(layout => layout.id === $('practice-layout').value) || PRACTICE_LAYOUTS[0];
  rerack(); $('menu').close();
});
Object.defineProperty(window, 'practice', { value: Object.freeze({ observe: () => observation }), writable: false, configurable: false });
fetch('./revision.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(value => {
  if (value?.revision) { buildRevision = value.revision; $('build').textContent = `P1 · ${buildRevision.slice(0, 7)}`; render(); }
}).catch(() => {});
function animate(now) {
  frame++; observedAt = now;
  if (!paused && !fault && simulation.snapshot().phase === 'rolling') {
    const delta = previous === null ? 0 : (now - previous) / 1000;
    // Never discard elapsed physics time or silently make a large jump.
    if (delta > 0.5) { fault = 'frame-backlog'; cancel(); }
    else {
      accumulator += delta;
      let steps = 0;
      while (accumulator >= 1 / 120 && steps < 60) { simulation.step(); accumulator -= 1 / 120; steps++; }
    }
  } else accumulator = 0;
  previous = now; render(); requestAnimationFrame(animate);
}
layout(); requestAnimationFrame(animate);
