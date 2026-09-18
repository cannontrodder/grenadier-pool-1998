import test from 'node:test';
import assert from 'node:assert/strict';
import { createPractice } from '../../practice/model.mjs';

const scratched = () => createPractice({ scenario: { id: 'placement', version: 1, balls: [
  { id: 'cue', role: 'cue', x: 500, y: -25, status: 'potted' },
  { id: 'red', role: 'object', x: 300, y: 250 },
] } });

test('placement requires 0.01 world units of clearance from cushions, pockets and balls', () => {
  const model = scratched();
  for (const [point, reason] of [
    [{ x: 200, y: 12.005 }, 'cushion'],
    [{ x: 500, y: 12.005 }, 'pocket'],
    [{ x: 324.005, y: 250 }, 'occupied'],
    [{ x: 466, y: 18.005 }, 'cushion'],
  ]) {
    assert.equal(model.placementValidity(point).valid, false, reason);
    assert.equal(model.placeWhite(point), false);
    assert.equal(model.snapshot().phase, 'placing-white');
  }
  for (const point of [{ x: 200, y: 12.011 }, { x: 500, y: 12.011 }, { x: 324.011, y: 250 }, { x: 466, y: 18.011 }]) {
    assert.equal(model.placementValidity(point).valid, true, JSON.stringify(point));
  }
  const epoch = model.snapshot().epoch;
  assert.equal(model.placeWhite({ x: 200, y: 12.011, epoch }), true);
  const cue = model.snapshot().balls.find(ball => ball.role === 'cue');
  assert.deepEqual([cue.x, cue.y, cue.vx, cue.vy, cue.status], [200, 12.011, 0, 0, 'live']);
  assert.equal(model.snapshot().shotId, 0);
  assert.equal(model.shoot({ angle: 0, power: 0.01, epoch }), true);
});
