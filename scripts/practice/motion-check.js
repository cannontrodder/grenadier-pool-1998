async page => {
  const harnessParameters = await page.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)));
  page.setDefaultTimeout(3500);
  const checks = [], actions = [], observations = [], errors = [], screenshots = [];
  const prefix = `output/playwright/practice/motion27-${page.viewportSize().width}-${Date.now()}`;
  let identity;
  page.on('pageerror', e => errors.push(String(e)));
  const bounded = async (operation, timeout, label) => Promise.race([
    operation(), page.waitForTimeout(timeout).then(() => { throw new Error(`HARNESS: ${label} exceeded ${timeout}ms`); }),
  ]);
  const persistJournal = async () => {
    if (!harnessParameters.harnessJournal) return;
    await page.request.post(harnessParameters.harnessJournal, { data: { identity, suite: 'motion',
      recentActions: actions, recentObservations: observations, errors, screenshots }, timeout: 1000, failOnStatusCode: true });
  };
  const check = (ok, name) => { if (!ok) throw new Error(`GAME: ${name}`); checks.push(name); };
  const observe = async () => {
    const o = await bounded(() => page.evaluate(() => window.practice?.observe?.()), 2000, 'observation');
    if (!o?.health || !Number.isFinite(o.observedAt)) throw new Error('HARNESS: missing observation');
    identity = { buildRevision: o.buildRevision, scenarioId: o.scenarioId, scenarioVersion: o.scenarioVersion, epoch: o.epoch };
    const { balls, events, epoch, tick, frame, phase, observedAt, health } = o;
    observations.push({ balls, events, epoch, tick, frame, phase, observedAt, health }); if (observations.length > 16) observations.shift();
    await persistJournal();
    check(o.health.ok, 'observer reports healthy motion'); return o;
  };
  const wait = async (name, predicate, arg, timeout = 5000) => {
    actions.push({ name, at: Date.now() }); if (actions.length > 16) actions.shift();
    await persistJournal();
    try { await page.waitForFunction(predicate, arg, { timeout }); }
    catch (e) { throw new Error(`UNCERTAIN: ${name} deadline: ${String(e)}`); }
    return await observe();
  };
  const correlate = async () => {
    const result = await page.evaluate(() => {
      const o = window.practice.observe(), matrix = document.querySelector('#world').getScreenCTM();
      const deltas = o.balls.filter(b => b.status === 'live').map(b => {
        const e = document.getElementById(`ball-${b.id}`), bounds = e.getBoundingClientRect();
        const p = new DOMPoint(b.x, b.y).matrixTransform(matrix);
        return Math.hypot(p.x - bounds.x - bounds.width / 2, p.y - bounds.y - bounds.height / 2);
      });
      const jaw = o.geometry.jaws.find(j => j.id === 'bottom-right-a');
      const e = document.getElementById(`jaw-${jaw.id}`);
      return { maxBallDelta: Math.max(...deltas), jawDelta: Math.max(Math.abs(Number(e.getAttribute('cx')) - jaw.x), Math.abs(Number(e.getAttribute('cy')) - jaw.y), Math.abs(Number(e.getAttribute('r')) - jaw.r)) };
    });
    check(result.maxBallDelta <= 1 && result.jawDelta < .001, 'moving ball centers and jaw geometry agree with rendered state');
    return result;
  };
  const screenshot = async name => { const path = `${prefix}-${name}.png`; await page.screenshot({ path, timeout: 2500 }); screenshots.push(path); await persistJournal(); };
  try {
    const initial = await observe();
    await screenshot('initial');
    const jaw = initial.geometry.jaws.find(j => j.id === 'bottom-right-a');
    const cue = initial.balls.find(b => b.role === 'cue'), m = initial.geometry.matrix;
    const angle = Math.atan2(jaw.y - cue.y, jaw.x - cue.x);
    const length = Math.hypot(m.a * Math.cos(angle) + m.c * Math.sin(angle), m.b * Math.cos(angle) + m.d * Math.sin(angle));
    const d = { x: (m.a * Math.cos(angle) + m.c * Math.sin(angle)) / length, y: (m.b * Math.cos(angle) + m.d * Math.sin(angle)) / length };
    const c = { x: m.a * cue.x + m.c * cue.y + m.e, y: m.b * cue.x + m.d * cue.y + m.f };
    actions.push({ name: 'one-finger pull/release toward side-pocket jaw', angle, at: Date.now() });
    await persistJournal();
    await page.mouse.move(c.x - d.x * 35, c.y - d.y * 35); await page.mouse.down();
    const radius = 35 + 12 + 115 * Math.sqrt(.12);
    await page.mouse.move(c.x - d.x * radius, c.y - d.y * radius, { steps: 1 });
    check((await observe()).gesture?.armed, 'normal pointer arms jaw-directed shot');
    await page.mouse.up();
    const near = await wait('white approaches side-pocket jaw', j => {
      const b = window.practice.observe().balls.find(b => b.role === 'cue');
      return b.vy > 0 && Math.hypot(b.x - j.x, b.y - j.y) < 48;
    }, jaw);
    check(near.phase === 'rolling' && near.shotId === 1, 'approach exposes rolling velocities');
    await correlate(); await screenshot('jaw-approach');
    const rebound = await wait('white rebounds from jaw', () => {
      const b = window.practice.observe().balls.find(b => b.role === 'cue');
      return b.vy < -20;
    }, null, 3000);
    check(rebound.potCount === 0 && rebound.events.length === 0, 'jaw rebound is not reported as a pot');
    const white = rebound.balls.find(b => b.role === 'cue');
    check(white.status === 'live' && white.y < 500, 'jaw keeps the white on the playable side');
    await correlate(); await screenshot('jaw-rebound');
    await page.waitForTimeout(150);
    const later = await observe(), moved = later.balls.find(b => b.role === 'cue');
    check(later.tick > rebound.tick && moved.y < white.y - 1, 'timed observations confirm rebound away from mouth');
    const settled = await wait('jaw shot settles', () => window.practice.observe().phase !== 'rolling', null, 10000);
    check(settled.phase === 'ready' && settled.balls.every(b => b.vx === 0 && b.vy === 0), 'jaw rebound settles naturally and allows next shot');
    check(errors.length === 0, 'motion check has no browser errors');
    return { status: 'PASS', suite: 'motion', ...identity, viewport: page.viewportSize(), assertions: checks.length, checks, screenshots };
  } catch (error) {
    const path = `${prefix}-failure.png`;
    try { await page.screenshot({ path, timeout: 2000 }); screenshots.push(path); } catch (e) { errors.push(String(e)); }
    const message = String(error);
    return { status: 'FAIL', classification: message.includes('GAME:') ? 'game-failure' : message.includes('UNCERTAIN:') ? 'uncertain' : 'harness-failure', error: message, identity, checks, actions, observations, errors, screenshots };
  }
}
