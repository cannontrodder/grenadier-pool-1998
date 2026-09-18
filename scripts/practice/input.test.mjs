import test from 'node:test';
import assert from 'node:assert/strict';
import { pullAt, createGesture } from '../../practice/input.mjs';

test('CSS travel preserves arm/saturation and squared response', () => {
  for (const start of [0, 30, 200]) {
    assert.equal(pullAt(start + 18.89, start).armed, false);
    assert.equal(pullAt(start + 18.9, start).armed, true);
    assert.equal(pullAt(start + 127, start).power, 1);
    assert.equal(pullAt(start + 69.5, start).power, .25);
    assert.equal(pullAt(start - 10, start).power, 0);
  }
});
test('exclusive pointer ownership, abort/rearm and epoch invalidation', () => {
  const g = createGesture();
  assert.equal(g.begin(1, 30, 4), true);
  assert.equal(g.begin(2, 30, 4), false);
  assert.equal(g.move(2, 157, 1), false);
  assert.equal(g.release(2, 4), null);
  g.move(1, 157, 1); g.move(1, 30, 1);
  assert.equal(g.release(1, 4), null);
  g.begin(1, 30, 4); g.move(1, 157, 1); g.move(1, 30, 1); g.move(1, 157, 2);
  assert.deepEqual(g.release(1, 4), { angle: 2, power: 1, epoch: 4 });
  g.begin(1, 30, 4); g.move(1, 157, 1);
  assert.equal(g.release(1, 5), null);
  g.begin(1, 30, 5); g.move(1, 157, 1); g.cancel();
  assert.equal(g.release(1, 5), null);
});
