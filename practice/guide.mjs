/** Straight cue-ball travel to first contact. No rebound or pot prediction. */
export function aimGuide(cue, balls, table, angle, maxDistance) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  let distance = Math.max(0, maxDistance), hit = null;
  // An open pocket ends the drawn guide at the cloth edge, without inventing contact.
  for (const [position, velocity, extent] of [[cue.x, dx, table.width], [cue.y, dy, table.height]]) {
    if (Math.abs(velocity) > 1e-12) distance = Math.min(distance, Math.max(0, ((velocity > 0 ? extent : 0) - position) / velocity));
  }
  function accept(t, target) {
    if (t >= -1e-7 && t <= distance) { distance = Math.max(0, t); hit = target; }
  }
  function circle(x, y, radius, target) {
    const ox = cue.x - x, oy = cue.y - y;
    const b = ox * dx + oy * dy, c = ox * ox + oy * oy - radius * radius;
    const discriminant = b * b - c;
    // A touching ball only blocks travel towards it, never travel away.
    if (discriminant >= 0 && b < 0) accept(-b - Math.sqrt(discriminant), target);
  }
  for (const ball of balls) {
    if (ball.id !== cue.id && ball.status === 'live') circle(ball.x, ball.y, cue.r + ball.r, { type: 'ball', id: ball.id });
  }
  for (const jaw of table.jaws) circle(jaw.x, jaw.y, cue.r + jaw.r, { type: 'jaw', id: jaw.id });
  for (const rail of table.rails) {
    const horizontal = rail.y1 === rail.y2;
    const velocity = horizontal ? dy : dx;
    if (Math.abs(velocity) < 1e-12) continue;
    const origin = horizontal ? cue.y : cue.x, surface = horizontal ? rail.y1 : rail.x1;
    const lo = Math.min(horizontal ? rail.x1 : rail.y1, horizontal ? rail.x2 : rail.y2);
    const hi = Math.max(horizontal ? rail.x1 : rail.y1, horizontal ? rail.x2 : rail.y2);
    for (const sign of [-1, 1]) {
      if (sign * velocity >= 0) continue;
      const t = (surface + sign * cue.r - origin) / velocity;
      const along = horizontal ? cue.x + dx * t : cue.y + dy * t;
      if (along >= lo && along <= hi) accept(t, { type: 'rail', id: rail.id });
    }
  }
  return Object.freeze({ x: cue.x + dx * distance, y: cue.y + dy * distance, distance, hit: hit && Object.freeze(hit) });
}
