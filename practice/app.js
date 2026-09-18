import { createPractice } from './model.mjs';
import { TABLE } from './geometry.mjs';
import { createGesture, clamp } from './input.mjs';

const $ = (id) => document.getElementById(id);
const table = $('table'), world = $('world'), game = $('game');
const simulation = createPractice(), gesture = createGesture();
let strength = 1.8, aimAngle = -Math.PI / 2;
let frame = 0, observedAt = performance.now(), buildRevision = 'local-unbuilt';
let previous = null, accumulator = 0, paused = document.hidden, fault = null;
let seenEvent = 0, feedbackUntil = performance.now() + 5000, feedback = null;
let observation;
const ballNodes = new Map();
const namespace = 'http://www.w3.org/2000/svg';
function node(tag, attrs, parent) {
  const element = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  parent.append(element);
  return element;
}
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
  if (active && table.hasPointerCapture(active.pointerId)) table.releasePointerCapture(active.pointerId);
}
function layout() {
  cancel();
  const portrait = innerHeight > innerWidth;
  table.setAttribute('viewBox', portrait ? '0 0 600 1100' : '0 0 1100 600');
  world.setAttribute('transform', portrait ? 'translate(550 50) rotate(90)' : 'translate(50 50)');
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
  for (const b of state.balls) {
    if (!ballNodes.has(b.id)) ballNodes.set(b.id, node('circle', { id: `ball-${b.id}`, r: b.r, fill: b.role === 'cue' ? 'url(#white-ball)' : 'url(#red-ball)', stroke: '#05231d', 'stroke-width': 1 }, $('balls')));
    const el = ballNodes.get(b.id);
    el.setAttribute('cx', b.x); el.setAttribute('cy', b.y);
    el.style.display = b.status === 'live' ? '' : 'none';
  }
  const cue = state.balls.find(b => b.role === 'cue'), dx = Math.cos(aimAngle), dy = Math.sin(aimAngle);
  const pull = active?.pull || 0;
  line('aim-line', cue.x, cue.y, cue.x + dx * 200, cue.y + dy * 200);
  line('cue', cue.x - dx * (28 + pull * 65), cue.y - dy * (28 + pull * 65), cue.x - dx * (180 + pull * 65), cue.y - dy * (180 + pull * 65));
  $('neutral').setAttribute('cx', cue.x); $('neutral').setAttribute('cy', cue.y);
  const m = matrix();
  $('neutral').setAttribute('r', active ? (active.startRadius + 18.9) / Math.hypot(m.a, m.b) : 0);
  $('aim').style.display = state.phase === 'ready' && !fault ? '' : 'none';
  $('neutral').style.display = active ? '' : 'none';
  $('count').textContent = `${state.potCount}/3`;
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
    ready: ['Straight pots', 'Drag away from the white · release to shoot'],
    rolling: ['Balls rolling', 'Wait for the table to settle'],
    'placing-white': ['White potted', 'Re-rack to continue practice'],
    cleared: ['Table cleared', 'Re-rack when you’re ready'],
    fault: ['Practice paused', 'The table could not progress safely. Re-rack to recover.'],
  };
  let [title, hint] = messages[phase] || messages.fault;
  if (paused) { title = 'Practice paused'; hint = 'Return to the table to continue'; }
  if (active) { title = active.armed ? `Release to shoot · ${Math.round(active.power * 100)}%` : 'Aim · pull to add power'; hint = 'Return inward and lift to abort'; }
  else if (feedback && performance.now() < feedbackUntil && phase === 'rolling') title = feedback;
  if ($('status').textContent !== title) $('status').textContent = title;
  if ($('hint').textContent !== hint) $('hint').textContent = hint;
  $('power').firstElementChild.style.width = `${(active?.power || 0) * 100}%`;
  game.classList.toggle('holding', !!active); game.classList.toggle('rolling', phase === 'rolling');
  game.classList.toggle('quiet', phase === 'ready' && !active && performance.now() > feedbackUntil);
  $('shoot').disabled = phase !== 'ready' || paused;
  observation = freeze({ ...state, contractVersion: 1, buildRevision, frame, observedAt,
    phase: fault ? 'fault' : active && state.phase === 'ready' ? 'aiming' : state.phase,
    shotReady: state.phase === 'ready' && !paused && !fault && !active,
    strength, aimAngle, pull: active?.pull || 0, power: active?.power || 0, gesture: active,
    paused, placement: null, health: { ok: !fault && state.phase !== 'fault', paused, fault: fault || state.fault || null },
    geometry: { matrix: m, width: TABLE.width, height: TABLE.height, ballRadius: TABLE.ballRadius, rails: TABLE.rails, jaws: TABLE.jaws, pockets: TABLE.pockets },
  });
}
table.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || $('menu').open || paused || fault || simulation.snapshot().phase !== 'ready') return;
  const p = worldPoint(event.clientX, event.clientY);
  if (p.x < 0 || p.x > TABLE.width || p.y < 0 || p.y > TABLE.height) return;
  const d = pointerData(event);
  if (gesture.begin(event.pointerId, d.radius, simulation.snapshot().epoch)) {
    table.setPointerCapture(event.pointerId);
    gesture.move(event.pointerId, d.radius, d.angle); aimAngle = d.angle;
    positionFeedback({ x: event.clientX, y: event.clientY }); render();
  }
});
table.addEventListener('pointermove', event => {
  if (gesture.snapshot()?.pointerId !== event.pointerId) return;
  const d = pointerData(event);
  gesture.move(event.pointerId, d.radius, d.angle); aimAngle = d.angle;
  positionFeedback({ x: event.clientX, y: event.clientY }); render();
});
table.addEventListener('pointerup', event => {
  if (gesture.snapshot()?.pointerId !== event.pointerId) return;
  const d = pointerData(event);
  gesture.move(event.pointerId, d.radius, d.angle); aimAngle = d.angle;
  const shot = gesture.release(event.pointerId, simulation.snapshot().epoch);
  if (table.hasPointerCapture(event.pointerId)) table.releasePointerCapture(event.pointerId);
  if (shot && !paused && !fault) { simulation.shoot({ ...shot, strength }); accumulator = 0; previous = null; }
  positionFeedback(); render();
});
for (const event of ['pointercancel', 'lostpointercapture']) table.addEventListener(event, e => {
  if (gesture.snapshot()?.pointerId === e.pointerId) { cancel(); render(); }
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
  cancel(); $('angle').value = String(Math.round(aimAngle * 180 / Math.PI * 1000) / 1000);
  $('menu').showModal(); positionFeedback(); render();
});
$('menu-close').addEventListener('click', () => $('menu').close());
$('menu').addEventListener('cancel', cancel);
$('menu').addEventListener('close', () => { cancel(); render(); });
$('strength').addEventListener('input', () => {
  cancel(); strength = clamp(Number($('strength').value), 0.5, 3);
  $('strength-value').textContent = `${strength.toFixed(1)}×`; render();
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
$('reset').addEventListener('click', () => {
  cancel(); simulation.resetScenario(); fault = null; previous = null; accumulator = 0;
  aimAngle = -Math.PI / 2; $('angle').value = '-90'; seenEvent = 0; feedback = null; feedbackUntil = performance.now() + 5000;
  positionFeedback(); render();
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
