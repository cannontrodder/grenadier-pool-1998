import test from 'node:test';
import assert from 'node:assert/strict';
import { createPractice, DEFAULT_SCENARIO } from '../../practice/model.mjs';
import { PRACTICE_LAYOUTS } from '../../practice/layouts.mjs';

test('three named practice layouts reset deterministically and reject stale shots', () => {
  assert.deepEqual(PRACTICE_LAYOUTS.map(layout => [layout.id, layout.name]), [
    ['straight-pots', 'Straight pots'], ['cut-pots', 'Cut pots'], ['cushion-practice', 'Cushion practice'],
  ]);
  assert.deepEqual(PRACTICE_LAYOUTS[0].balls, DEFAULT_SCENARIO.balls);
  const game = createPractice();
  for (const layout of PRACTICE_LAYOUTS) {
    game.resetScenario(layout);
    const before = game.snapshot();
    assert.equal(before.phase, 'ready');
    assert.equal(before.balls.length, 4);
    assert.equal(before.remaining, 3);
    assert.ok(game.shoot({ angle: 0, power: 0.8, epoch: before.epoch }));
    game.step(10);
    game.resetScenario();
    const after = game.snapshot();
    assert.deepEqual(after.balls, before.balls);
    assert.equal(after.scenarioId, layout.id);
    assert.equal(after.scenarioVersion, layout.version);
    assert.equal(after.epoch, before.epoch + 1);
    assert.equal(after.shotId, 0);
    assert.equal(after.potCount, 0);
    assert.deepEqual(after.events, []);
    assert.equal(game.shoot({ angle: 0, power: 1, epoch: before.epoch }), false);
  }
});

const { default: journeys } = await import('./layout-journeys.json', { with: { type: 'json' } });
for (const layout of PRACTICE_LAYOUTS) test(`${layout.name} supports its named shot and a full clear`, () => {
  const game = createPractice({ scenario: layout, pocketScale: 1.1 });
  const initial = game.snapshot();
  const journey = journeys[layout.id];
  assert.equal(journey.version, initial.scenarioVersion);
  let bankObserved = false;
  for (const [index, shot] of journey.shots.entries()) {
    const before = game.snapshot();
    const cue = before.balls.find(b => b.role === 'cue');
    const target = before.balls.find(b => b.id === shot.ball);
    let angle = shot.angle;
    if (shot.target) {
      const dx = shot.target.x - target.x, dy = shot.target.y - target.y;
      const length = Math.hypot(dx, dy);
      angle = Math.atan2(target.y - 24 * dy / length - cue.y, target.x - 24 * dx / length - cue.x);
      if (index === 0 && layout.id === 'cut-pots') {
        assert.ok(Math.abs(Math.sin(angle - Math.atan2(dy, dx))) > 0.5, 'first shot requires a substantial cut');
      }
    }
    assert.ok(game.shoot({ angle, power: shot.power, strength: 1.8 }));
    let last = game.snapshot();
    for (let tick = 0; tick < 1200 && last.phase === 'rolling'; tick++) {
      const next = game.step();
      if (layout.id === 'cushion-practice' && index === 0) {
        const a = last.balls.find(b => b.id === shot.ball), b = next.balls.find(b => b.id === shot.ball);
        if (a.vy < 0 && b.vy > 0 && b.y < 20 && b.x > 550 && b.x < 800) bankObserved = true;
      }
      last = next;
    }
    assert.equal(last.fault, null);
    assert.equal(last.phase, index === 2 ? 'cleared' : 'ready');
    assert.equal(last.potCount, index + 1);
    assert.equal(last.remaining, 2 - index);
    assert.equal(last.events.length, index + 1);
    assert.equal(last.events[index].ballId, shot.ball);
    assert.equal(last.events[index].pocketId, shot.pocket);
    assert.ok(last.balls.filter(b => b.status === 'live').every(b => b.vx === 0 && b.vy === 0));
    assert.equal(game.placeWhite({ x: 400, y: 400 }), false);
  }
  if (layout.id === 'cushion-practice') assert.ok(bankObserved, 'first object rebounds from top cushion before its bottom-middle pot');
  assert.equal(game.shoot({ angle: 0, power: 0.2 }), false);
  const cleared = game.snapshot(); game.step(120);
  assert.deepEqual(game.snapshot(), cleared, 'clear waits for explicit Re-rack');
  game.resetScenario();
  assert.deepEqual(game.snapshot().balls, initial.balls);
});
