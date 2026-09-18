import { TABLE, nearestOnRail, pocketCoordinates } from './geometry.mjs';

export { TABLE } from './geometry.mjs';
export const PHYSICS = Object.freeze({ tickSeconds: 1 / 120, maxTravel: 0.75,
  ballRestitution: 0.96, cushionRestitution: 0.82,
  rollingDrag: 0.45, rollingFriction: 90, settleSpeed: 2, settleTicks: 30,
  maxSubsteps: 96, contactIterations: 128, maxShotTicks: 3360,
  positionTolerance: 1e-7, energyRelativeTolerance: 1e-9,
});
export const DEFAULT_SCENARIO = Object.freeze({ id: 'straight-pots', version: 1,
  balls: Object.freeze([
    Object.freeze({ id: 'cue', role: 'cue', x: 500, y: 320 }),
    Object.freeze({ id: 'object-1', role: 'object', x: 500, y: 180 }),
    Object.freeze({ id: 'object-2', role: 'object', x: 220, y: 140.8 }),
    Object.freeze({ id: 'object-3', role: 'object', x: 790, y: 355 }),
  ]),
});
const speed = ball => Math.hypot(ball.vx, ball.vy);
const energy = balls => balls.reduce((sum, ball) => sum + ball.vx ** 2 + ball.vy ** 2, 0);
const deepFreeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
};

function loadScenario(scenario) {
  if (!scenario || typeof scenario.id !== 'string' || !Number.isInteger(scenario.version) || !Array.isArray(scenario.balls)) {
    throw new TypeError('A scenario needs id, integer version and balls.');
  }
  const balls = scenario.balls.map(ball => ({ id: ball.id, role: ball.role,
    status: ball.status ?? 'live', x: ball.x, y: ball.y,
    vx: ball.vx ?? 0, vy: ball.vy ?? 0, r: TABLE.ballRadius, pocketId: ball.pocketId ?? null,
  })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  if (balls.length < 2 || balls.length > 4 || balls.filter(ball => ball.role === 'cue').length !== 1 ||
      new Set(balls.map(ball => ball.id)).size !== balls.length || balls.some(ball =>
        typeof ball.id !== 'string' || !['cue', 'object'].includes(ball.role) ||
        !['live', 'potted'].includes(ball.status) ||
        ![ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite) || speed(ball) > 3960 + 1e-8)) {
    throw new TypeError('Scenarios require one cue, one to three objects, unique IDs and finite bounded state.');
  }
  for (const ball of balls) if (ball.status === 'potted') ball.vx = ball.vy = 0;
  return { id: scenario.id, version: scenario.version, balls };
}

/** Pure, fixed-tick four-ball simulation. Explicit fixture velocities are model-test inputs only. */
export function createPractice({ scenario = DEFAULT_SCENARIO } = {}) {
  let fixture, balls, epoch = 0, tick, stateRevision = 0, phase, shotId, events, eventSequence;
  let quietTicks, shotTicks, fault, mouthEntries;
  const liveBalls = () => balls.filter(ball => ball.status === 'live');
  const remaining = () => balls.filter(ball => ball.role === 'object' && ball.status === 'live').length;
  const postSettle = () => remaining() === 0 ? 'cleared' :
    balls.find(ball => ball.role === 'cue').status === 'potted' ? 'placing-white' : 'ready';
  function fail(reason) { fault = reason; phase = 'fault'; stateRevision++; }
  function resetScenario(next = fixture) {
    const loaded = loadScenario(next);
    fixture = structuredClone(next);
    balls = loaded.balls;
    epoch++; tick = 0; stateRevision++; shotId = 0; events = []; eventSequence = 0;
    quietTicks = 0; shotTicks = 0; fault = null; mouthEntries = new Map();
    phase = liveBalls().some(ball => speed(ball) > 0) ? 'rolling' : postSettle();
    return true;
  }
  resetScenario(scenario);
  function snapshot() {
    return deepFreeze({ scenarioId: fixture.id, scenarioVersion: fixture.version, epoch,
      tick, stateRevision, phase, shotId, balls: balls.map(ball => ({ ...ball })),
      events: events.map(event => ({ ...event })),
      potCount: balls.filter(ball => ball.role === 'object' && ball.status === 'potted').length,
      remaining: remaining(), fault,
    });
  }
  function shoot({ angle, power, strength = 1.8, epoch: commandEpoch = epoch } = {}) {
    if (phase !== 'ready' || commandEpoch !== epoch || ![angle, power, strength].every(Number.isFinite) ||
        power < 0 || power > 1 || strength < 0.5 || strength > 3) return false;
    const cue = balls.find(ball => ball.role === 'cue');
    const impulse = 60 + 1300 * power * strength;
    cue.vx = Math.cos(angle) * impulse; cue.vy = Math.sin(angle) * impulse;
    shotId++; phase = 'rolling'; quietTicks = 0; shotTicks = 0; stateRevision++;
    return true;
  }
  function placementValidity({ x, y } = {}) {
    if (![x, y].every(Number.isFinite)) return { valid: false, reason: 'invalid-coordinate' };
    if (x < TABLE.ballRadius || x > TABLE.width - TABLE.ballRadius ||
        y < TABLE.ballRadius || y > TABLE.height - TABLE.ballRadius) return { valid: false, reason: 'cushion' };
    for (const pocket of TABLE.pockets) {
      const local = pocketCoordinates(x, y, pocket);
      if (local.depth > -TABLE.ballRadius && Math.abs(local.lateral) < pocket.mouth.halfWidth + TABLE.ballRadius) {
        return { valid: false, reason: 'pocket' };
      }
    }
    if (TABLE.jaws.some(jaw => Math.hypot(x - jaw.x, y - jaw.y) < TABLE.ballRadius + jaw.r)) {
      return { valid: false, reason: 'cushion' };
    }
    if (liveBalls().some(ball => ball.role !== 'cue' && Math.hypot(x - ball.x, y - ball.y) < 2 * TABLE.ballRadius + 0.01)) {
      return { valid: false, reason: 'occupied' };
    }
    return { valid: true, reason: null };
  }
  function placeWhite({ x, y, epoch: commandEpoch = epoch } = {}) {
    if (phase !== 'placing-white' || commandEpoch !== epoch || !placementValidity({ x, y }).valid) return false;
    Object.assign(balls.find(ball => ball.role === 'cue'), { x, y, vx: 0, vy: 0, status: 'live', pocketId: null });
    phase = 'ready'; stateRevision++;
    return true;
  }

  // Contact normals point from the fixed body / second ball toward the first ball.
  function contacts(active, slop = 0) {
    const result = [];
    for (let i = 0; i < active.length; i++) {
      const a = active[i];
      function add(b, x, y, separation, restitution, id) {
        const dx = a.x - x, dy = a.y - y, distance = Math.hypot(dx, dy);
        if (distance <= separation + slop) result.push({ a, b,
          nx: distance > 1e-12 ? dx / distance : 1, ny: distance > 1e-12 ? dy / distance : 0,
          overlap: separation - distance, restitution, id, impulse: 0 });
      }
      for (let j = i + 1; j < active.length; j++) {
        const b = active[j]; add(b, b.x, b.y, a.r + b.r, PHYSICS.ballRestitution, `ball:${a.id}:${b.id}`);
      }
      for (const rail of TABLE.rails) {
        const point = nearestOnRail(a.x, a.y, rail);
        add(null, point.x, point.y, a.r, PHYSICS.cushionRestitution, `rail:${a.id}:${rail.id}`);
      }
      for (const jaw of TABLE.jaws) add(null, jaw.x, jaw.y, a.r + jaw.r, PHYSICS.cushionRestitution, `jaw:${a.id}:${jaw.id}`);
    }
    return result.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  }
  function resolve(active) {
    const current = contacts(active, PHYSICS.positionTolerance);
    const before = energy(active);
    for (const contact of current) {
      const { a, b, nx, ny } = contact;
      const incoming = (a.vx - (b?.vx ?? 0)) * nx + (a.vy - (b?.vy ?? 0)) * ny;
      contact.target = incoming < 0 ? -incoming * contact.restitution : 0;
    }
    for (let iteration = 0; iteration < PHYSICS.contactIterations; iteration++) {
      let largest = 0;
      for (const contact of current) {
        const { a, b, nx, ny, target } = contact;
        const velocity = (a.vx - (b?.vx ?? 0)) * nx + (a.vy - (b?.vy ?? 0)) * ny;
        const next = Math.max(0, contact.impulse + (target - velocity) / (b ? 2 : 1));
        const delta = next - contact.impulse; contact.impulse = next;
        a.vx += delta * nx; a.vy += delta * ny;
        if (b) { b.vx -= delta * nx; b.vy -= delta * ny; }
        largest = Math.max(largest, Math.abs(delta));
      }
      if (largest < 1e-9) break;
    }
    const after = energy(active);
    if (after > before + Math.max(1e-7, before * PHYSICS.energyRelativeTolerance)) {
      fail('contact-energy-increase'); return;
    }
    // Separate penetration independently of velocities; bounded travel keeps corrections small.
    for (let iteration = 0; iteration < PHYSICS.contactIterations; iteration++) {
      const overlaps = contacts(active).filter(contact => contact.overlap > PHYSICS.positionTolerance);
      if (!overlaps.length) return;
      for (const { a, b, nx, ny, overlap } of overlaps) {
        const delta = overlap / (b ? 2 : 1);
        a.x += delta * nx; a.y += delta * ny;
        if (b) { b.x -= delta * nx; b.y -= delta * ny; }
      }
    }
    if (contacts(active).some(contact => contact.overlap > 1e-5)) fail('contact-position-iterations-exhausted');
  }
  function capture(ball, from) {
    for (const pocket of TABLE.pockets) {
      const previous = pocketCoordinates(from.x, from.y, pocket);
      const now = pocketCoordinates(ball.x, ball.y, pocket);
      // Remember entry through the aperture. Capture planes extend behind its jaws,
      // so a legitimate shallow cut cannot escape through an artificial lateral gap.
      const key = `${ball.id}:${pocket.id}`;
      if (now.depth < 0) mouthEntries.delete(key);
      if (previous.depth <= 0 && now.depth >= 0 && now.depth > previous.depth) {
        const fraction = -previous.depth / (now.depth - previous.depth);
        const lateral = previous.lateral + (now.lateral - previous.lateral) * fraction;
        if (Math.abs(lateral) <= pocket.mouth.halfWidth) mouthEntries.set(key, true);
      }
      if (mouthEntries.has(key) && now.depth >= pocket.captureDepth) {
        ball.status = 'potted'; ball.pocketId = pocket.id; ball.vx = ball.vy = 0;
        events.push({ seq: ++eventSequence, epoch, tick, shotId,
          type: ball.role === 'cue' ? 'scratch' : 'pot', ballId: ball.id, pocketId: pocket.id });
        return;
      }
    }
  }
  function advanceTick() {
    tick++; shotTicks++; stateRevision++;
    const count = Math.max(1, Math.ceil(Math.sqrt(energy(liveBalls())) * PHYSICS.tickSeconds / PHYSICS.maxTravel));
    if (count > PHYSICS.maxSubsteps) { fail('substep-budget-exceeded'); return; }
    const dt = PHYSICS.tickSeconds / count;
    for (let substep = 0; substep < count && phase === 'rolling'; substep++) {
      let active = liveBalls();
      const previous = new Map(active.map(ball => [ball.id, { x: ball.x, y: ball.y }]));
      for (const ball of active) {
        ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      }
      resolve(active);
      for (const ball of active) capture(ball, previous.get(ball.id));
      active = liveBalls();
      for (const ball of active) {
        const current = speed(ball);
        const next = Math.max(0, current * Math.exp(-PHYSICS.rollingDrag * dt) - PHYSICS.rollingFriction * dt);
        const scale = current > 0 ? next / current : 0;
        ball.vx *= scale; ball.vy *= scale;
        if (![ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite) ||
            ball.x < -50 || ball.x > TABLE.width + 50 || ball.y < -50 || ball.y > TABLE.height + 50) fail('invalid-or-escaped-ball');
      }
    }
    if (phase !== 'rolling') return;
    quietTicks = liveBalls().every(ball => speed(ball) < PHYSICS.settleSpeed) ? quietTicks + 1 : 0;
    if (quietTicks >= PHYSICS.settleTicks) {
      for (const ball of liveBalls()) ball.vx = ball.vy = 0;
      phase = postSettle();
    } else if (shotTicks >= PHYSICS.maxShotTicks) fail('shot-did-not-settle');
  }
  function step(ticks = 1) {
    if (!Number.isInteger(ticks) || ticks < 0 || ticks > PHYSICS.maxShotTicks) throw new RangeError('step requires 0–3360 fixed ticks.');
    for (let n = 0; n < ticks && phase === 'rolling'; n++) advanceTick();
    return snapshot();
  }
  return Object.freeze({ snapshot, shoot, step, resetScenario, placementValidity, placeWhite });
}
