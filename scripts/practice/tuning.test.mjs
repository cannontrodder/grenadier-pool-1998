import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TUNING, TUNING, boundedSetting } from '../../practice/tuning.mjs';
import { createGesture } from '../../practice/input.mjs';
import { aimGuide } from '../../practice/guide.mjs';
import { TABLE } from '../../practice/geometry.mjs';

test('menu defaults are bounded and invalid numeric settings fall back safely', () => {
  for (const [key, spec] of Object.entries(TUNING)) {
    assert.equal(boundedSetting(key, -100), spec.min);
    assert.equal(boundedSetting(key, 10000), spec.max);
    assert.equal(boundedSetting(key, NaN), spec.default);
    assert.equal(boundedSetting(key, Infinity), spec.default);
    assert.equal(DEFAULT_TUNING[key], spec.default);
  }
});
test('aim lock freezes pre-pull direction through sideways drift and release', () => {
  for (const lockDistance of [20, 28, 60]) {
    const g = createGesture();
    g.begin(1, 18, 2, { lockAim: true, lockDistance, angle: -1 });
    g.move(1, 18 + lockDistance - 1, -.9);
    assert.equal(g.snapshot().locked, false);
    g.move(1, 18 + lockDistance, -.8);
    assert.equal(g.snapshot().locked, true);
    g.move(1, 145, -.5);
    assert.deepEqual(g.release(1, 2), { angle: -.9, power: 1, epoch: 2 });
  }
});
test('neutral return unlocks for re-aim, abort, and rearm without stale lock', () => {
  const g = createGesture();
  g.begin(1, 30, 1, { lockAim: true, angle: 1 });
  g.move(1, 90, 2); assert.equal(g.snapshot().angle, 1);
  g.move(1, 42, 2); assert.equal(g.snapshot().locked, false);
  assert.equal(g.snapshot().angle, 2); assert.equal(g.snapshot().armed, false);
  g.move(1, 90, 3); assert.equal(g.snapshot().angle, 2);
  g.move(1, 30, 3); assert.equal(g.release(1, 1), null);
  g.begin(1, 30, 2, { lockAim: true, angle: -2 });
  g.move(1, 90, 2); g.cancel(); assert.equal(g.release(1, 2), null);
  g.begin(1, 30, 3, { lockAim: true, angle: -3 }); g.move(1, 90, 2);
  assert.equal(g.release(1, 2), null);
});
test('turning lock off preserves free aim even at maximum pull', () => {
  const g = createGesture(); g.begin(1, 30, 1, { lockAim: false });
  g.move(1, 157, 2); g.move(1, 157, 3);
  assert.equal(g.snapshot().locked, false);
  assert.equal(g.release(1, 1).angle, 3);
});
const cue = { id: 'cue', x: 500, y: 320, r: 12, status: 'live' };
const object = { id: 'object', x: 500, y: 180, r: 12, status: 'live' };
test('guide stops cue centre at first ball contact, skips potted balls, obeys length', () => {
  const g = aimGuide(cue, [cue, object], TABLE, -Math.PI / 2, 600);
  assert.equal(g.hit.id, 'object'); assert.equal(g.distance, 116); assert.equal(g.y, 204);
  assert.equal(aimGuide(cue, [object], TABLE, -Math.PI / 2, 100).hit, null);
  const clear = aimGuide(cue, [{ ...object, status: 'potted' }], TABLE, -Math.PI / 2, 200);
  assert.equal(clear.distance, 200); assert.equal(clear.hit, null);
  const touching = { ...object, y: 296 };
  assert.equal(aimGuide(cue, [touching], TABLE, -Math.PI / 2, 100).distance, 0);
  assert.equal(aimGuide(cue, [touching], TABLE, Math.PI / 2, 100).hit, null);
});
test('guide sees cushion faces and jaws while clear pocket mouths remain open', () => {
  const rail = aimGuide(cue, [], TABLE, 0, 1000);
  assert.deepEqual(rail.hit, { type: 'rail', id: 'right' }); assert.equal(rail.x, 988);
  const jawCue = { ...cue, x: 466 };
  assert.equal(aimGuide(jawCue, [], TABLE, -Math.PI / 2, 600).hit.type, 'jaw');
  assert.equal(aimGuide(cue, [], TABLE, -Math.PI / 2, 600).hit, null);
});

test('a cushion-touching cue can aim away, but towards the cushion contacts immediately', () => {
  for (const [x, y, away] of [[12, 250, 0], [988, 250, Math.PI], [250, 12, Math.PI / 2], [250, 488, -Math.PI / 2]]) {
    const touching = { ...cue, x, y };
    assert.ok(aimGuide(touching, [], TABLE, away, 100).distance > 99);
    assert.equal(aimGuide(touching, [], TABLE, away + Math.PI, 100).distance, 0);
  }
});
