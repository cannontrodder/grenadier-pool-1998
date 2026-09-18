import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  begin,
  move,
  release,
  disarm,
  shoot,
  step,
} from "../../docs/design/touch-study/model.mjs";
test("one pointer can orbit 360 degrees and fires exactly once", () => {
  const s = initial();
  begin(s, 1, 40);
  for (const a of [0, 0.5, Math.PI, 4.8, Math.PI * 2 - 0.01]) {
    move(s, 1, a, 40);
    assert.ok(Math.abs(s.angle - a) < 1e-9);
    assert.equal(s.phase, "aiming");
  }
  move(s, 1, 0, 130);
  assert.equal(s.phase, "armed");
  assert.equal(release(s, 1), true);
  assert.equal(release(s, 1), false);
  assert.equal(s.shots, 1);
  assert.equal(begin(s, 2, 40), false);
});
test("same-finger inward return and unarmed taps cannot shoot", () => {
  for (const radius of [40, 45, 52]) {
    const s = initial();
    begin(s, 1, 40);
    move(s, 1, 1, 160);
    move(s, 1, 1, radius);
    assert.equal(release(s, 1), false);
    assert.equal(s.shots, 0);
    assert.equal(s.phase, "ready");
  }
});
test("interruption then stale release cannot fire", () => {
  for (const reason of [
    "pointercancel",
    "lostpointercapture",
    "background",
    "orientation",
    "blur",
    "ownership",
  ])
    for (const armed of [false, true]) {
      const s = initial();
      begin(s, 1, 40);
      move(s, 1, 0, armed ? 140 : 40);
      if (reason === "ownership") s.owner = false;
      disarm(s, reason);
      assert.equal(release(s, 1), false);
      assert.equal(shoot(s), false);
      assert.equal(s.shots, 0);
      assert.ok(s.balls.every((b) => b.vx === 0 && b.vy === 0));
    }
});
test("second pointer cannot alter or release active shot", () => {
  const s = initial();
  begin(s, 1, 40);
  assert.equal(begin(s, 2, 40), false);
  move(s, 2, 1, 200);
  assert.equal(s.power, 0);
  assert.equal(release(s, 2), false);
  assert.equal(s.gesture.id, 1);
});
test("both curves are monotonic, clamped and distinct", () => {
  const values = [];
  for (const mapping of ["linear", "gentle"]) {
    const s = initial();
    s.mapping = mapping;
    begin(s, 1, 30);
    let last = 0;
    for (const r of [0, 30, 50, 80, 130, 300]) {
      move(s, 1, 0, r);
      assert.ok(s.power >= last && s.power <= 1);
      last = s.power;
      if (r === 80) values.push(s.power);
    }
    assert.equal(last, 1);
  }
  assert.ok(values[1] < values[0]);
});
test("bounded deterministic motion and reset", () => {
  function run() {
    const s = initial();
    begin(s, 1, 40);
    move(s, 1, 0, 150);
    release(s, 1);
    const start = s.balls[0].x;
    step(s, 1 / 120);
    assert.ok(s.balls[0].x > start);
    for (let i = 0; i < 700; i++) step(s, 1 / 120);
    assert.equal(s.phase, "ready");
    assert.ok(
      s.balls.every(
        (b) =>
          b.vx === 0 &&
          b.vy === 0 &&
          b.x >= b.r &&
          b.x <= 1000 - b.r &&
          b.y >= b.r &&
          b.y <= 500 - b.r,
      ),
    );
    return s.balls;
  }
  assert.deepEqual(run(), run());
  assert.deepEqual(initial(), initial());
});
