// PROTOTYPE: pure, in-memory gesture loop; no match rules or production physics.
export const SCENARIO = "two-ball-centre-v1";
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function initial() {
  return {
    phase: "ready",
    angle: 0,
    power: 0,
    mapping: "gentle",
    strength: 1.8,
    contact: { x: 0, y: 0 },
    owner: true,
    gesture: null,
    shots: 0,
    time: 0,
    last: "Ready",
    balls: [
      { id: "cue", x: 270, y: 250, vx: 0, vy: 0, r: 12 },
      { id: "red", x: 690, y: 250, vx: 0, vy: 0, r: 12 },
    ],
  };
}
export function disarm(s, reason = "Aborted") {
  s.gesture = null;
  s.power = 0;
  if (s.phase !== "rolling") s.phase = "ready";
  s.last = reason;
}
export function begin(s, id, radius) {
  if (!s.owner || s.phase === "rolling" || s.gesture) return false;
  s.gesture = { id, startRadius: radius };
  s.phase = "aiming";
  s.power = 0;
  return true;
}
export function move(s, id, angle, radius) {
  if (s.gesture?.id !== id) return;
  s.angle = (angle + Math.PI * 2) % (Math.PI * 2);
  const pull = clamp((radius - s.gesture.startRadius - 12) / 115, 0, 1);
  s.power = s.mapping === "gentle" ? pull * pull : pull;
  s.phase = pull >= 0.06 ? "armed" : "aiming";
  s.last =
    s.phase === "armed"
      ? "Armed · release shoots"
      : "Not armed · lift to abort";
}
export function shoot(s) {
  if (s.phase !== "armed" || !s.owner) return false;
  s.gesture = null;
  s.phase = "rolling";
  s.shots++;
  s.time = 0;
  const speed = 60 + 1300 * s.power * s.strength;
  s.balls[0].vx = Math.cos(s.angle) * speed;
  s.balls[0].vy = Math.sin(s.angle) * speed;
  s.last = "Shot away";
  return true;
}
export function release(s, id) {
  if (s.gesture?.id !== id) return false;
  if (s.phase === "armed") return shoot(s);
  disarm(s);
  return false;
}
export function step(s, dt) {
  if (s.phase !== "rolling") return;
  // Keep relative travel small enough for this approximate contact model at maximum strength.
  const speed = s.balls.reduce(
    (sum, ball) => sum + Math.hypot(ball.vx, ball.vy),
    0,
  );
  const count = Math.max(1, Math.ceil((speed * dt) / 6));
  for (let i = 0; i < count; i++) advance(s, dt / count);
}
function advance(s, dt) {
  if (s.phase !== "rolling") return;
  s.time += dt;
  for (const b of s.balls) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const damping = Math.exp(-1.55 * dt);
    b.vx *= damping;
    b.vy *= damping;
    if (b.x < b.r || b.x > 1000 - b.r) {
      b.x = clamp(b.x, b.r, 1000 - b.r);
      b.vx *= -0.8;
    }
    if (b.y < b.r || b.y > 500 - b.r) {
      b.y = clamp(b.y, b.r, 500 - b.r);
      b.vy *= -0.8;
    }
  }
  const [a, b] = s.balls,
    dx = b.x - a.x,
    dy = b.y - a.y,
    d = Math.hypot(dx, dy),
    r = a.r + b.r;
  if (d > 0 && d < r) {
    const nx = dx / d,
      ny = dy / d,
      closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (closing > 0) {
      a.vx -= closing * nx;
      a.vy -= closing * ny;
      b.vx += closing * nx;
      b.vy += closing * ny;
    }
    const overlap = (r - d) / 2;
    a.x -= overlap * nx;
    a.y -= overlap * ny;
    b.x += overlap * nx;
    b.y += overlap * ny;
  }
  if (s.time > 5 || s.balls.every((b) => Math.hypot(b.vx, b.vy) < 8)) {
    for (const b of s.balls) {
      b.vx = 0;
      b.vy = 0;
    }
    s.phase = "ready";
    s.power = 0;
    s.last = "Settled · try again or Reset";
  }
}
