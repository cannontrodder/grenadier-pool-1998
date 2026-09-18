async (page) => {
  const harnessParameters = await page.evaluate(() =>
    Object.fromEntries(new URLSearchParams(location.search)),
  );
  const suite = harnessParameters.harnessCase || "interaction";
  const injectedFault = harnessParameters.harnessFault || null;
  let injectedFrozenObservation = null;
  const checks = [];
  const history = [];
  const recentActions = [], recentObservations = [];
  const errors = [];
  const screenshots = [];
  let identity = null;
  const pointerStartRadius = 18;
  const artifactPrefix = `output/playwright/practice/${suite}-${page.viewportSize().width}-${Date.now()}`;

  page.setDefaultTimeout(3500);
  page.on("pageerror", (error) => errors.push(`pageerror: ${String(error)}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) =>
    errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ""}`),
  );

  const remember = (entry) => {
    history.push({ at: Date.now(), ...entry });
    if (history.length > 16) history.shift();
    const entries = entry.kind === 'action' ? recentActions : recentObservations;
    entries.push({ at: Date.now(), ...entry }); if (entries.length > 16) entries.shift();
  };
  const bounded = async (operation, timeout, label) => Promise.race([
    operation(), page.waitForTimeout(timeout).then(() => { throw new Error(`HARNESS: ${label} exceeded ${timeout}ms`); }),
  ]);
  const persistJournal = async () => {
    if (!harnessParameters.harnessJournal) return;
    await page.request.post(harnessParameters.harnessJournal, { data: { identity, suite, history,
      recentActions, recentObservations,
      errors, screenshots }, timeout: 1000, failOnStatusCode: true });
  };
  const action = async (name, operation) => {
    remember({ kind: "action", name });
    await persistJournal();
    return await bounded(operation, 3500, `action ${name}`);
  };
  const check = (condition, name, detail) => {
    if (!condition) {
      throw new Error(`GAME: ${name}${detail ? ` (${detail})` : ""}`);
    }
    checks.push(name);
  };
  const observe = async () => {
    let observation;
    try {
      observation = await bounded(() => page.evaluate(() => window.practice?.observe()), 2000, 'observation');
      if (injectedFault === "missing") observation = null;
      if (injectedFault === "stale") {
        if (!injectedFrozenObservation) injectedFrozenObservation = observation;
        observation = injectedFrozenObservation;
      }
    } catch (error) {
      throw new Error(`HARNESS: browser observation failed: ${String(error)}`);
    }
    if (
      !observation ||
      !Number.isFinite(observation.frame) ||
      !Number.isFinite(observation.observedAt) ||
      !observation.health
    ) {
      throw new Error("HARNESS: missing or malformed observation");
    }
    remember({
      kind: "observation",
      buildRevision: observation.buildRevision,
      scenarioId: observation.scenarioId,
      scenarioVersion: observation.scenarioVersion,
      frame: observation.frame,
      observedAt: observation.observedAt,
      epoch: observation.epoch,
      tick: observation.tick,
      stateRevision: observation.stateRevision,
      phase: observation.phase,
      shotId: observation.shotId,
      health: observation.health,
      balls: observation.balls?.map(({ id, status, x, y, vx, vy, pocketId }) => ({
        id,
        status,
        x,
        y,
        vx,
        vy,
        pocketId,
      })),
      events: observation.events,
      placement: observation.placement, aimAngle: observation.aimAngle, tuning: observation.tuning, gesture: observation.gesture,
    });
    await persistJournal();
    return observation;
  };
  const waitForFreshness = async (before, timeout = 2000) => {
    if (injectedFault === "stale") {
      await page.waitForTimeout(Math.min(timeout, 100));
      const after = await observe();
      if (after.frame <= before.frame || after.observedAt <= before.observedAt) {
        throw new Error("HARNESS: stale observation stream: injected frozen sample");
      }
      return after;
    }
    try {
      await page.waitForFunction(
        ({ frame, observedAt }) => {
          const next = window.practice?.observe?.();
          return next && next.frame > frame + 1 && next.observedAt > observedAt;
        },
        { frame: before.frame, observedAt: before.observedAt },
        { timeout },
      );
      return await observe();
    } catch (error) {
      throw new Error(`HARNESS: stale observation stream: ${String(error)}`);
    }
  };
  const waitForGame = async (name, predicate, argument, timeout = 5000) => {
    try {
      await page.waitForFunction(predicate, argument, { timeout });
      return await observe();
    } catch (original) {
      let before;
      try {
        before = await observe();
        const after = await waitForFreshness(before, 1200);
        if (!after.health.ok || after.health.fault) {
          throw new Error(`observer health=${JSON.stringify(after.health)}`);
        }
      } catch (healthError) {
        throw new Error(
          `UNCERTAIN: ${name} timed out and observer health could not be proved; ` +
            `${String(healthError)}; original=${String(original)}`,
        );
      }
      throw new Error(`GAME: ${name} did not complete within ${timeout}ms`);
    }
  };
  const screenshot = async (label) => {
    const path = `${artifactPrefix}-${label}.png`;
    await page.screenshot({ path, timeout: 2500 });
    screenshots.push(path);
    await persistJournal();
  };
  const screenPoint = (x, y, matrix) => ({
    x: matrix.a * x + matrix.c * y + matrix.e,
    y: matrix.b * x + matrix.d * y + matrix.f,
  });
  const screenDirection = (angle, matrix) => {
    const x = matrix.a * Math.cos(angle) + matrix.c * Math.sin(angle);
    const y = matrix.b * Math.cos(angle) + matrix.d * Math.sin(angle);
    const length = Math.hypot(x, y);
    if (!Number.isFinite(length) || length < 0.0001) {
      throw new Error("HARNESS: invalid world-to-screen matrix");
    }
    return { x: x / length, y: y / length };
  };
  const gesture = async (angle, pullDistance, release = false) => {
    const observation = await observe();
    const cue = observation.balls.find(
      (candidate) => candidate.role === "cue" && candidate.status === "live",
    );
    if (!cue) throw new Error("HARNESS: no live cue ball for pointer action");
    const matrix = observation.geometry?.matrix;
    if (!matrix) throw new Error("HARNESS: observation has no geometry matrix");
    const center = screenPoint(cue.x, cue.y, matrix);
    const direction = screenDirection(angle, matrix);
    const initialRadius = pointerStartRadius;
    const start = {
      x: center.x - direction.x * initialRadius,
      y: center.y - direction.y * initialRadius,
    };
    const end = {
      x: center.x + (start.x - center.x) * (initialRadius + pullDistance) / initialRadius,
      y: center.y + (start.y - center.y) * (initialRadius + pullDistance) / initialRadius,
    };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 5 });
    if (release) await page.mouse.up();
    return { center, direction, start, end };
  };
  const atWorld = async (x, y, operation = 'click') => {
    const o = await observe(), p = screenPoint(x, y, o.geometry.matrix);
    await action(`${operation} world ${x},${y}`, async () => {
      await page.mouse.move(p.x, p.y);
      if (operation === 'down') await page.mouse.down();
      if (operation === 'click') { await page.mouse.down(); await page.mouse.up(); }
    });
    return await observe();
  };
  const correlate = async (id, point) => {
    const o = await observe(), expected = screenPoint(point.x, point.y, o.geometry.matrix);
    const actual = await page.locator(id).evaluate(el => {
      const p = new DOMPoint(el.cx.baseVal.value, el.cy.baseVal.value).matrixTransform(el.getScreenCTM());
      return { x: p.x, y: p.y, visible: getComputedStyle(el).display !== 'none' };
    });
    check(actual.visible && Math.hypot(actual.x - expected.x, actual.y - expected.y) <= 1, `${id} center matches observation within 1 CSS px`);
  };
  const cdp = suite === 'placement-native' ? await page.context().newCDPSession(page) : null;
  const touch = async (type, points) => {
    const before = await observe();
    await action(type, () => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(p => ({ ...p, radiusX: 9, radiusY: 9, force: 1 })) }));
    return await waitForFreshness(before);
  };
  const nativeShot = async () => {
    const o = await observe(), cue = o.balls.find(b => b.role === 'cue');
    const center = screenPoint(cue.x, cue.y, o.geometry.matrix), d = screenDirection(Math.PI / 2, o.geometry.matrix);
    await touch('touchStart', [{ x: center.x - d.x * 18, y: center.y - d.y * 18, id: 1 }]);
    await touch('touchMove', [{ x: center.x - d.x * 76, y: center.y - d.y * 76, id: 1 }]);
    await touch('touchEnd', []);
  };
  const scratch = async () => {
    await action('scratch using the primary pull/release', () => cdp ? nativeShot() : gesture(Math.PI / 2, 58, true));
    return await waitForGame('scratch settles', () => window.practice.observe().phase === 'placing-white', null, 10000);
  };
  try {
    const initial = await observe();
    identity = { buildRevision: initial.buildRevision, scenarioId: initial.scenarioId, epoch: initial.epoch };
    await screenshot('initial');
    await waitForFreshness(initial);
    const placed = await scratch();
    check(placed.balls.find(b => b.role === 'cue').status === 'potted', 'white remains absent after scratch');
    check(placed.placement?.pending && placed.placement.valid, 'placement starts with a usable candidate');
    check(await page.locator('#status').textContent() === 'Place the white', 'placement prompt is visible');
    await correlate('#placement-preview', placed.placement.candidate);
    await screenshot('placement');
    if (suite === 'placement-native') {
      const p = { ...screenPoint(600, 250, placed.geometry.matrix), id: 1 };
      const other = { ...screenPoint(750, 300, placed.geometry.matrix), id: 2 };
      let o = await touch('touchStart', [p]);
      const owner = o.placement.pointerId, candidate = o.placement.candidate;
      check(owner !== null && !o.gesture, 'native placement owns contact without arming');
      o = await touch('touchStart', [p, other]);
      check(o.placement.pointerId === owner && JSON.stringify(o.placement.candidate) === JSON.stringify(candidate), 'secondary touch cannot own or move placement');
      o = await touch('touchCancel', []);
      check(o.phase === 'placing-white' && o.placement.pointerId === null && o.shotId === 1, 'native touch cancellation cannot commit placement');
      await touch('touchStart', [p]);
      o = await touch('touchMove', [{ ...p, x: p.x + 20 }]);
      check(!o.gesture && o.power === 0 && o.placement.valid, 'native placement drag never arms');
      o = await touch('touchEnd', []);
      check(o.phase === 'ready' && o.shotId === 1 && o.placement.committed, 'native placement release commits without shooting');
      await correlate('#ball-cue', o.placement.committed);
    } else if (suite === 'placement-keyboard') {
      await page.locator('#menu-open').click();
      check(await page.getByLabel('White position X (0–1000)').isVisible(), 'keyboard position controls are labelled');
      await page.locator('#placement-x').fill('');
      check((await observe()).placement.valid === false, 'empty keyboard position is invalid');
      check(await page.locator('#placement-confirm').isDisabled(), 'invalid keyboard position cannot be confirmed');
      await page.locator('#placement-x').fill('500');
      await page.locator('#placement-y').fill('180');
      check((await observe()).placement.reason === 'occupied', 'keyboard occupied candidate rejected');
      await page.locator('#placement-x').fill('200');
      await page.locator('#placement-y').fill('12.005');
      check(!(await observe()).placement.valid, 'keyboard near-cushion candidate lacks required clearance');
      await page.locator('#placement-y').fill('12.011');
      check((await observe()).placement.valid, 'keyboard candidate just beyond clearance is legal');
      await page.locator('#placement-x').fill('500');
      await page.locator('#placement-y').fill('250');
      await page.locator('#placement-y').press('ArrowUp');
      check((await observe()).placement.candidate.y === 251, 'arrow key positions the white');
      await screenshot('keyboard-placement');
      await page.locator('#placement-confirm').focus();
      await page.keyboard.press('Enter');
      let o = await observe();
      check(o.phase === 'ready' && o.shotId === 1 && o.placement.committed?.y === 251, 'keyboard confirm places without shooting');
      await correlate('#ball-cue', o.placement.committed);
      await page.locator('#menu-open').click();
      await page.locator('#keyboard-settings summary').click();
      await page.locator('#angle').fill('0');
      await page.locator('#keyboard-power').fill('0.01');
      await page.locator('#shoot').focus(); await page.keyboard.press('Enter');
      o = await observe(); check(o.shotId === 2 && o.phase === 'rolling', 'separate keyboard shot succeeds after placement');
    } else if (suite === 'placement-cancel') {
      for (const event of ['pointercancel', 'lostpointercapture', 'blur', 'pagehide', 'visibilitychange', 'resize', 'orientationchange']) {
        const before = await atWorld(600, 250, 'down');
        check(before.placement.pointerId !== null && !before.gesture, `${event}: placement owns contact only`);
        await action(event, () => page.evaluate(event => {
          const id = window.practice.observe().placement.pointerId;
          if (event.startsWith('pointer') || event === 'lostpointercapture') document.getElementById('table').dispatchEvent(new PointerEvent(event, { pointerId: id }));
          else if (event === 'visibilitychange') document.dispatchEvent(new Event(event));
          else window.dispatchEvent(new Event(event));
          if (event === 'pagehide') window.dispatchEvent(new Event('pageshow'));
        }, event));
        await page.mouse.up();
        const o = await observe();
        check(o.phase === 'placing-white' && o.shotId === 1 && o.placement.pointerId === null, `${event}: delayed release cannot place or shoot`);
      }
      await atWorld(600, 250, 'down');
      // Enter activates the genuine Menu button while the table still owns a contact.
      await page.locator('#menu-open').focus(); await page.keyboard.press('Enter');
      await page.mouse.up(); await page.locator('#menu-close').click();
      check((await observe()).phase === 'placing-white', 'Menu cancels pending placement');
      const beforeRotate = await atWorld(600, 250, 'down');
      const size = page.viewportSize(); await page.setViewportSize({ width: size.height, height: size.width });
      await page.mouse.up();
      const rotated = await observe();
      check(rotated.phase === 'placing-white' && JSON.stringify(rotated.balls) === JSON.stringify(beforeRotate.balls), 'rotation disarms placement and preserves world state');
      await atWorld(600, 250, 'down');
      await page.locator('#reset').focus(); await page.keyboard.press('Enter'); await page.mouse.up();
      const reset = await observe();
      check(reset.phase === 'ready' && reset.epoch > placed.epoch && reset.shotId === 0 && reset.placement === null, 'Re-rack cancels placement epoch and delayed release');
      const scratchedAgain = await scratch();
      await atWorld(600, 250, 'down');
      await page.locator('#menu-open').focus(); await page.keyboard.press('Enter');
      await page.locator('#strength').fill('2.2');
      await page.locator('#practice-layout').selectOption('cut-pots');
      await page.mouse.up();
      const changed = await observe();
      check(changed.phase === 'ready' && changed.scenarioId === 'cut-pots' && changed.epoch === scratchedAgain.epoch + 1, 'layout selection during placement starts the requested fresh epoch');
      check(changed.placement === null && changed.shotId === 0 && changed.events.length === 0 && changed.potCount === 0 && changed.strength === 2.2, 'layout reset clears placement and shot state while retaining strength');
      check(JSON.stringify(changed.balls.map(b => [b.id, b.x, b.y, b.status, b.vx, b.vy])) === JSON.stringify([
        ['cue',500,320,'live',0,0], ['object-1',550,180,'live',0,0],
        ['object-2',120,76.8,'live',0,0], ['object-3',880,417.14,'live',0,0],
      ]), 'placement reset restores exact Cut pots fixture');
      await page.waitForTimeout(250);
      const afterReset = await observe();
      check(afterReset.shotId === 0 && afterReset.placement === null && afterReset.events.length === 0, 'delayed placement contact cannot affect new layout');
    } else {
      for (const [name, x, y, reason] of [['occupied', 500, 180, 'occupied'], ['cushion', 200, 5, 'cushion'], ['pocket', 20, 20, 'pocket']]) {
        const o = await atWorld(x, y);
        check(o.phase === 'placing-white' && !o.placement.valid && o.placement.reason === reason, `${name} placement rejected`);
        check(o.shotId === 1 && !o.gesture && !o.placement.committed, `${name} release cannot shoot`);
        check((await page.locator('#hint').textContent()).includes(name === 'occupied' ? 'Ball in the way' : name), `${name} feedback visible`);
        await correlate('#placement-preview', o.placement.candidate);
      }
      await screenshot('invalid-pocket');
      await atWorld(550, 220, 'down');
      let o = await atWorld(700, 250, 'move');
      check(o.placement.valid && !o.gesture && o.power === 0 && o.phase === 'placing-white', 'moving placement contact cannot arm');
      await correlate('#placement-preview', o.placement.candidate);
      await page.mouse.up(); o = await observe();
      check(o.phase === 'ready' && o.shotId === 1 && o.placement.committed && !o.placement.pending, 'legal release commits exactly one placement without a shot');
      check(o.balls.find(b => b.role === 'cue').vx === 0 && o.balls.find(b => b.role === 'cue').vy === 0, 'placed white has zero velocity');
      await correlate('#ball-cue', o.placement.committed); await screenshot('placed');
      await action('fresh pull/release after placement', () => gesture(0, 35, true));
      o = await observe(); check(o.phase === 'rolling' && o.shotId === 2, 'only fresh gesture fires next shot');
    }
    check(errors.length === 0, "browser emitted no errors", errors.join("; "));
    const finalObservation = await observe();
    return {
      status: "PASS",
      suite,
      buildRevision: finalObservation.buildRevision,
      contractVersion: finalObservation.contractVersion,
      scenarioId: finalObservation.scenarioId,
      scenarioVersion: finalObservation.scenarioVersion,
      epoch: finalObservation.epoch,
      viewport: page.viewportSize(),
      assertions: checks.length,
      checks,
      screenshots,
    };
  } catch (error) {
    const text = String(error);
    const classification = text.includes("GAME:")
      ? "game-failure"
      : text.includes("UNCERTAIN:")
        ? "uncertain"
        : "harness-failure";
    const diagnosticScreenshot = `${artifactPrefix}-failure.png`;
    try {
      await page.screenshot({ path: diagnosticScreenshot, timeout: 2000 });
    } catch (screenshotError) {
      errors.push(`diagnostic screenshot: ${String(screenshotError)}`);
    }
    return {
      status: "FAIL",
      identity,
      suite,
      classification,
      error: text,
      diagnosticScreenshot,
      checks,
      history, recentActions, recentObservations,
      errors,
      screenshots,
    };
  }
}
