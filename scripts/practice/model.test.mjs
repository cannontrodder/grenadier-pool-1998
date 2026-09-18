import test from 'node:test';
import assert from 'node:assert/strict';
import { createPractice, DEFAULT_SCENARIO, PHYSICS, TABLE } from '../../practice/model.mjs';
import { nearestOnRail, pocketCoordinates } from '../../practice/geometry.mjs';

const ball = (id, x, y, extra = {}) => ({ id, role: id === 'cue' ? 'cue' : 'object', x, y, ...extra });
const fixture = balls => ({ id: 'test-fixture', version: 1, balls });
const energy = snapshot => snapshot.balls.reduce((sum, b) => sum + b.vx ** 2 + b.vy ** 2, 0);
function valid(snapshot) {
  assert.equal(snapshot.fault, null);
  const live = snapshot.balls.filter(b => b.status === 'live');
  for (const b of live) {
    assert.ok([b.x, b.y, b.vx, b.vy].every(Number.isFinite));
    assert.ok(b.x >= -50 && b.x <= 1050 && b.y >= -50 && b.y <= 550);
    for (const rail of TABLE.rails) {
      const p = nearestOnRail(b.x, b.y, rail);
      assert.ok(Math.hypot(b.x - p.x, b.y - p.y) >= b.r - 1e-5, `${b.id} penetrated ${rail.id}`);
    }
    for (const jaw of TABLE.jaws) assert.ok(Math.hypot(b.x - jaw.x, b.y - jaw.y) >= b.r + jaw.r - 1e-5);
  }
  for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) {
    assert.ok(Math.hypot(live[a].x - live[b].x, live[a].y - live[b].y) >= 24 - 1e-5, 'sustained ball overlap');
  }
}
function run(model, ticks = 1200) {
  let previous = model.snapshot();
  for (let n = 0; n < ticks && previous.phase === 'rolling'; n++) {
    const next = model.step(); valid(next);
    assert.ok(energy(next) <= energy(previous) + Math.max(1e-6, energy(previous) * 1e-9), 'energy increased');
    previous = next;
  }
  assert.notEqual(previous.phase, 'rolling', 'bounded settling');
  assert.ok(previous.balls.every(b => b.vx === 0 && b.vy === 0));
  return previous;
}
const maxShot = model => assert.equal(model.shoot({ angle: 0, power: 1, strength: 3 }), true);

test('public command admission, immutable snapshots, calibration and epoch invalidation', () => {
  const model = createPractice(); const original = model.snapshot();
  assert.ok(Object.isFrozen(original.balls[0]));
  assert.throws(() => { original.balls[0].x = 0; }, TypeError);
  assert.equal(model.placeWhite({ x: 100, y: 100 }), false);
  for (const params of [{ power: -1 }, { power: 2 }, { strength: 3.1 }, { angle: NaN }]) {
    assert.equal(model.shoot({ angle: 0, power: 1, strength: 1.8, ...params }), false);
  }
  for (const [strength, expected] of [[0.5, 710], [1.8, 2400], [3, 3960]]) {
    model.resetScenario(); assert.ok(model.shoot({ angle: 0, power: 1, strength }));
    assert.equal(model.snapshot().balls.find(b => b.role === 'cue').vx, expected);
    assert.equal(model.shoot({ angle: 0, power: 1, strength }), false);
    assert.equal(model.placeWhite({ x: 100, y: 100 }), false);
  }
  model.step(4); model.resetScenario();
  assert.deepEqual(model.snapshot().balls, original.balls);
  assert.equal(model.shoot({ angle: 0, power: 1, epoch: original.epoch }), false);
  assert.deepEqual(model.snapshot().events, []);
  assert.equal(model.snapshot().tick, 0);
  assert.equal(model.snapshot().shotId, 0);
  assert.equal(model.snapshot().potCount, 0);
  assert.throws(() => model.step(4000), RangeError);
});

test('default fixture has normal side and corner object pots and continues after settling', () => {
  for (const [angle, power, pocketId, object] of [
    [-Math.PI / 2, 0.16, 'top-middle', 'object-1'],
    [Math.atan2(-320, -500), 0.25, 'top-left', 'object-2'],
  ]) {
    const model = createPractice(); assert.ok(model.shoot({ angle, power, strength: 1.8 }));
    const settled = run(model);
    assert.equal(settled.phase, 'ready'); assert.equal(settled.potCount, 1);
    assert.deepEqual(settled.events.map(e => [e.type, e.ballId, e.pocketId]), [['pot', object, pocketId]]);
    const event = settled.events[0]; assert.equal(event.seq, 1); assert.equal(event.shotId, 1); assert.equal(event.epoch, settled.epoch);
    model.step(1200); assert.deepEqual(model.snapshot().events, settled.events);
    assert.ok(model.shoot({ angle: 0, power: 0.01 }));
  }
});

test('full 3× head-on contact transfers velocity without tunnelling', () => {
  const model = createPractice({ scenario: fixture([ball('cue', 150, 250), ball('a', 205, 250)]) });
  maxShot(model); const after = model.step(2); valid(after);
  assert.ok(after.balls.find(b => b.id === 'a').vx > 3700);
  assert.ok(after.balls.find(b => b.id === 'cue').vx < 100);
  run(model);
});

test('full 3× grazing contact deflects and exchanges momentum', () => {
  const model = createPractice({ scenario: fixture([ball('cue', 150, 250), ball('a', 205, 271)]) });
  maxShot(model); const after = model.step(3); valid(after);
  const cue = after.balls.find(b => b.id === 'cue'), object = after.balls.find(b => b.id === 'a');
  assert.ok(cue.vy < -500); assert.ok(object.vy > 500); assert.ok(object.vx > 400);
  run(model);
});

for (const [name, balls] of [
  ['symmetric', [ball('cue', 150, 250), ball('a', 220, 238), ball('b', 220, 262)]],
  ['collinear touching', [ball('cue', 150, 250), ball('a', 220, 250), ball('b', 244, 250), ball('c', 268, 250)]],
]) test(`full 3× ${name} simultaneous contacts are stable and independent of storage order`, () => {
  let reference;
  for (const permutation of [balls, [...balls].reverse(), [...balls.slice(1), balls[0]]]) {
    const model = createPractice({ scenario: fixture(permutation) }); maxShot(model);
    const after = model.step(4); valid(after);
    if (name === 'symmetric') {
      const a = after.balls.find(b => b.id === 'a'), b = after.balls.find(b => b.id === 'b');
      assert.ok(Math.abs(a.vx - b.vx) < 1e-6);
      assert.ok(Math.abs(a.vy + b.vy) < 1e-6);
    }
    const settled = run(model);
    if (reference) assert.deepEqual(settled, reference); else reference = settled;
  }
});

for (const [name, x, y, angle, component, sign] of [
  ['top', 250, 30, -Math.PI / 2, 'vy', 1], ['bottom', 250, 470, Math.PI / 2, 'vy', -1],
  ['left', 30, 250, Math.PI, 'vx', 1], ['right', 970, 250, 0, 'vx', -1],
]) test(`full 3× ${name} cushion cannot be tunnelled`, () => {
  const model = createPractice({ scenario: fixture([ball('cue', x, y), ball('a', 750, 150)]) });
  assert.ok(model.shoot({ angle, power: 1, strength: 3 }));
  const after = model.step(); valid(after);
  assert.ok(after.balls.find(b => b.id === 'cue')[component] * sign > 3000);
  run(model);
});

for (const pocket of TABLE.pockets) test(`full 3× ${pocket.id} mouth offset matrix: capture / jaw / rail`, () => {
  for (const offset of [0, -(pocket.mouth.halfWidth - 3), pocket.mouth.halfWidth - 3,
    -(pocket.mouth.halfWidth + 25), pocket.mouth.halfWidth + 25]) {
    const { x, y, nx, ny, tx, ty } = pocket.mouth;
    const position = distance => ({ x: x - nx * distance + tx * offset, y: y - ny * distance + ty * offset });
    const cue = position(150), object = position(70);
    const model = createPractice({ scenario: fixture([ball('cue', cue.x, cue.y), ball('a', object.x, object.y)]) });
    model.shoot({ angle: Math.atan2(ny, nx), power: 1, strength: 3 });
    for (let n = 0; n < 20; n++) valid(model.step());
    const early = model.snapshot(), target = early.balls.find(b => b.id === 'a');
    if (offset === 0) {
      assert.equal(target.status, 'potted'); assert.equal(target.pocketId, pocket.id);
      assert.equal(early.events.length, 1); assert.equal(early.events[0].ballId, 'a');
      assert.ok(pocketCoordinates(target.x, target.y, pocket).depth >= pocket.captureDepth);
    } else {
      assert.equal(target.status, 'live', 'jaw / near miss does not capture');
      assert.ok(pocketCoordinates(target.x, target.y, pocket).depth < 0);
    }
    const settled = run(model);
    if (offset === 0) {
      assert.equal(settled.phase, 'cleared'); assert.equal(settled.remaining, 0);
      assert.equal(settled.events.filter(e => e.ballId === 'a').length, 1);
    }
  }
});

test('dark-pocket overlap outside capture boundary is not a pot', () => {
  const model = createPractice({ scenario: fixture([ball('cue', 500, 4), ball('a', 700, 250)]) });
  assert.equal(model.snapshot().balls[0].status, 'live');
  assert.ok(model.shoot({ angle: Math.PI / 2, power: 0 }));
  const settled = run(model); assert.equal(settled.events.length, 0); assert.equal(settled.phase, 'ready');
});

test('free roll monotonically damps and settles for 30 fixed ticks with no five-second stop', () => {
  const model = createPractice({ scenario: fixture([ball('cue', 150, 250), ball('a', 800, 400)]) });
  assert.ok(model.shoot({ angle: 0, power: 0.03, strength: 0.5 }));
  let last = Infinity, firstQuiet = null;
  while (model.snapshot().phase === 'rolling') {
    const state = model.step(), cue = state.balls.find(b => b.id === 'cue');
    const velocity = Math.hypot(cue.vx, cue.vy);
    assert.ok(velocity <= last); last = velocity;
    if (velocity < PHYSICS.settleSpeed && firstQuiet === null) firstQuiet = state.tick;
    if (state.phase !== 'rolling') assert.equal(state.tick - firstQuiet + 1, PHYSICS.settleTicks);
    assert.ok(state.tick < 1200);
  }
  // Low restitution / table contacts may shorten a real shot; the model has no 600-tick branch.
  assert.ok(PHYSICS.maxShotTicks > 600);
});

test('scratch waits for all motion and only then allows legal placement', () => {
  const model = createPractice({ scenario: fixture([
    ball('cue', 500, 20, { vx: 0, vy: -1000 }), ball('a', 150, 300, { vx: 500, vy: 0 }),
  ]) });
  const mid = model.step(10); assert.equal(mid.phase, 'rolling');
  assert.equal(mid.events[0].type, 'scratch');
  assert.equal(model.shoot({ angle: 0, power: 1 }), false);
  assert.equal(model.placeWhite({ x: 500, y: 250 }), false);
  const settled = run(model); assert.equal(settled.phase, 'placing-white');
  assert.equal(model.shoot({ angle: 0, power: 1 }), false);
  const object = settled.balls.find(b => b.id === 'a');
  for (const point of [{ x: object.x, y: object.y }, { x: 5, y: 250 }, { x: 500, y: 0 }, { x: 15, y: 15 }, { x: NaN, y: 30 }]) {
    assert.equal(model.placementValidity(point).valid, false); assert.equal(model.placeWhite(point), false);
  }
  assert.equal(model.placeWhite({ x: 500, y: 250, epoch: settled.epoch - 1 }), false);
  assert.deepEqual(model.placementValidity({ x: 500, y: 250 }), { valid: true, reason: null });
  assert.equal(model.placeWhite({ x: 500, y: 250 }), true);
  assert.equal(model.snapshot().phase, 'ready'); assert.equal(model.snapshot().balls.find(b => b.id === 'cue').pocketId, null);
  assert.ok(model.shoot({ angle: 0, power: 0 }));
});

test('scratch and final pot in one rolling interval resolve only to cleared', () => {
  const model = createPractice({ scenario: fixture([
    ball('cue', 500, 20, { vy: -1000 }), ball('a', 500, 480, { vy: 1000 }),
  ]) });
  const settled = run(model);
  assert.equal(settled.phase, 'cleared'); assert.equal(settled.potCount, 1);
  assert.deepEqual(settled.events.map(e => e.seq), [1, 2]);
  assert.equal(model.placeWhite({ x: 500, y: 250 }), false);
  assert.equal(model.shoot({ angle: 0, power: 1 }), false);
});

test('tick batching / repeat runs produce identical snapshots and event order', () => {
  const replay = chunks => {
    const model = createPractice(); model.shoot({ angle: Math.atan2(-320, -500), power: 1, strength: 3 });
    for (const chunk of chunks) model.step(chunk);
    return model.snapshot();
  };
  const expected = replay([1200]);
  assert.deepEqual(replay(Array(1200).fill(1)), expected);
  assert.deepEqual(replay(Array(60).fill(20)), expected);
  assert.deepEqual(replay([17, 43, 72, 68, 1000]), expected);
});

test('reset during motion restores fixture and clears old shot and event state', () => {
  const model = createPractice(); model.shoot({ angle: -Math.PI / 2, power: 0.16 }); model.step(140);
  assert.equal(model.snapshot().events.length, 1); const old = model.snapshot();
  model.resetScenario(); const reset = model.snapshot();
  assert.equal(reset.epoch, old.epoch + 1); assert.equal(reset.phase, 'ready');
  assert.deepEqual(reset.balls, createPractice().snapshot().balls);
  assert.deepEqual(reset.events, []); assert.equal(reset.shotId, 0);
  model.step(1000); assert.deepEqual(model.snapshot(), reset);
  assert.equal(model.shoot({ angle: 0, power: 1, epoch: old.epoch }), false);
});

test('shallow full-speed corner entries cannot escape behind a jaw', () => {
  for (const angle of [7, 43, 54].map(n => n * Math.PI * 2 / 1000)) {
    const model = createPractice(); model.shoot({ angle, power: 1, strength: 3 });
    const settled = run(model);
    assert.ok(settled.events.length > 0, 'shallow mouth entry reaches capture');
  }
});

test('unrecoverable invalid state reports a fault instead of readiness', () => {
  const model = createPractice({ scenario: fixture([
    ball('cue', 1100, 250, { vx: 100 }), ball('a', 500, 250),
  ]) });
  const state = model.step(); assert.equal(state.phase, 'fault');
  assert.equal(state.fault, 'invalid-or-escaped-ball');
  assert.equal(model.shoot({ angle: 0, power: 1 }), false);
  assert.equal(model.placeWhite({ x: 100, y: 100 }), false);
  model.step(100); assert.deepEqual(model.snapshot(), state);
  model.resetScenario(DEFAULT_SCENARIO); assert.equal(model.snapshot().phase, 'ready');
});

test('a real maximum shot remains rolling beyond five seconds and settles naturally', () => {
  const model = createPractice(); model.shoot({ angle: Math.PI / 4, power: 1, strength: 3 });
  const fiveSeconds = model.step(600);
  assert.equal(fiveSeconds.phase, 'rolling'); assert.ok(energy(fiveSeconds) > 0);
  const settled = run(model); assert.ok(settled.tick > 600); assert.ok(settled.tick < 720);
});

test('bounded full-speed angle sweep has no escape, fault or missed settle', t => {
  const count = Number(process.env.PRACTICE_SWEEP ?? 32);
  assert.ok(Number.isInteger(count) && count >= 1 && count <= 1000, 'PRACTICE_SWEEP must be 1–1000');
  const deadline = performance.now() + 90000;
  let longest = 0;
  for (let n = 0; n < count; n++) {
    assert.ok(performance.now() < deadline, `sweep wall-time bound at angle ${n}/${count}`);
    const model = createPractice(); model.shoot({ angle: n * Math.PI * 2 / count, power: 1, strength: 3 });
    // The focused matrix validates every public tick. The broad sweep batches a
    // bounded shot; runtime energy/finite/penetration guards still run every substep.
    const before = energy(model.snapshot());
    const settled = model.step(1200); valid(settled);
    assert.notEqual(settled.phase, 'rolling', `angle ${n}/${count} failed to settle`);
    assert.equal(energy(settled), 0); assert.ok(energy(settled) <= before);
    longest = Math.max(longest, settled.tick);
  }
  t.diagnostic(`${count} full-3960 shots; no faults/escapes/energy growth; maximum settle ${longest} ticks`);
});
