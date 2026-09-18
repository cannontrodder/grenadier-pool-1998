async (page) => {
  const harnessParameters = await page.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)));
  const screenshots = [];
  const cdp = await page.context().newCDPSession(page);
  const checks = [];
  const history = [];
  const recentActions = [], recentObservations = [];
  const errors = [];
  let identity = null;
  const artifactPrefix = `output/playwright/practice/native-${page.viewportSize().width}-${Date.now()}`;
  page.setDefaultTimeout(3500);
  page.on("pageerror", (error) => errors.push(`pageerror: ${String(error)}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

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
    await page.request.post(harnessParameters.harnessJournal, { data: { identity, suite: 'native', history,
      recentActions, recentObservations,
      errors, screenshots }, timeout: 1000, failOnStatusCode: true });
  };
  const check = (condition, name) => {
    if (!condition) throw new Error(`GAME: ${name}`);
    checks.push(name);
  };
  const observe = async () => {
    let observation;
    try {
      observation = await bounded(() => page.evaluate(() => window.practice?.observe()), 2000, 'observation');
    } catch (error) {
      throw new Error(`HARNESS: browser observation failed: ${String(error)}`);
    }
    if (!observation || !Number.isFinite(observation.frame) || !observation.health) {
      throw new Error("HARNESS: missing or malformed observation");
    }
    identity = { buildRevision: observation.buildRevision, scenarioId: observation.scenarioId,
      scenarioVersion: observation.scenarioVersion, epoch: observation.epoch };
    remember({
      kind: "observation",
      frame: observation.frame,
      tick: observation.tick,
      epoch: observation.epoch,
      phase: observation.phase,
      shotId: observation.shotId,
      gesture: observation.gesture, balls: observation.balls, events: observation.events, health: observation.health,
    });
    await persistJournal();
    return observation;
  };
  const waitFresh = async (before) => {
    try {
      await page.waitForFunction(
        ({ frame, observedAt }) => {
          const next = window.practice?.observe?.();
          return next && next.frame > frame + 2 && next.observedAt > observedAt;
        },
        { frame: before.frame, observedAt: before.observedAt },
        { timeout: 2000 },
      );
    } catch (error) {
      throw new Error(`HARNESS: stale observation stream: ${String(error)}`);
    }
    return await observe();
  };
  // CDP touchEnd points identify contacts to release; [] releases all contacts.
  const dispatch = async (name, type, points) => {
    remember({ kind: "action", name, type, points });
    const before = await observe();
    await bounded(() => cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((point) => ({
        x: point.x,
        y: point.y,
        id: point.id,
        radiusX: 9,
        radiusY: 9,
        force: 1,
      })),
    }), 3500, name);
    return await waitFresh(before);
  };
  const screenPoint = (x, y, matrix) => ({
    x: matrix.a * x + matrix.c * y + matrix.e,
    y: matrix.b * x + matrix.d * y + matrix.f,
  });
  const screenDirection = (angle, matrix) => {
    const x = matrix.a * Math.cos(angle) + matrix.c * Math.sin(angle);
    const y = matrix.b * Math.cos(angle) + matrix.d * Math.sin(angle);
    const length = Math.hypot(x, y);
    return { x: x / length, y: y / length };
  };
  const pointsFor = async (angle = -Math.PI / 2) => {
    const observation = await observe();
    const cue = observation.balls.find(
      (candidate) => candidate.role === "cue" && candidate.status === "live",
    );
    if (!cue || !observation.geometry?.matrix) {
      throw new Error("HARNESS: cue or shared matrix unavailable");
    }
    const center = screenPoint(cue.x, cue.y, observation.geometry.matrix);
    const direction = screenDirection(angle, observation.geometry.matrix);
    const at = (radius, id = 0) => ({
      x: center.x - direction.x * radius,
      y: center.y - direction.y * radius,
      id,
    });
    return { center, direction, start: at(18), armed: at(18 + 75), full: at(18 + 127.2), at };
  };
  const reset = async () => {
    remember({ kind: "action", name: "Re-rack" });
    await page.locator("#reset").click();
    const observation = await observe();
    check(observation.phase === "ready", "native Re-rack returns ready");
    return observation;
  };

  try {
    await page.waitForFunction(
      () => window.practice?.observe?.()?.health?.ok,
      {},
      { timeout: 5000 },
    );
    await reset();
    const initialScreenshot = `${artifactPrefix}-initial.png`;
    await page.screenshot({ path: initialScreenshot, timeout: 2500 }); screenshots.push(initialScreenshot);
    await persistJournal();

    let points = await pointsFor();
    let observation = await dispatch("primary touch start", "touchStart", [points.start]);
    const owner = observation.gesture?.pointerId;
    check(observation.phase === "aiming" && owner != null, "native primary touch owns aim");
    for (const radians of [0, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2]) {
      const orbit = {
        x: points.center.x + Math.cos(radians) * 27,
        y: points.center.y + Math.sin(radians) * 27,
        id: 0,
      };
      observation = await dispatch(`unarmed orbit ${radians.toFixed(2)}`, "touchMove", [orbit]);
      check(
        observation.phase === "aiming" && observation.gesture?.armed === false,
        `native orbit remains unarmed at ${radians.toFixed(2)}`,
      );
    }
    observation = await dispatch("arm native primary touch", "touchMove", [points.armed]);
    check(observation.gesture?.armed === true, "native primary touch arms");
    observation = await dispatch("return native touch inward", "touchMove", [points.start]);
    check(observation.gesture?.armed === false, "native same-finger return aborts");
    observation = await dispatch("rearm native primary touch", "touchMove", [points.full]);
    check(observation.gesture?.armed === true, "native same-finger gesture rearms");
    observation = await dispatch("release native primary touch", "touchEnd", []);
    check(
      observation.shotId === 1 && observation.phase === "rolling",
      "native release commits exactly one shot",
    );

    await reset();
    points = await pointsFor();
    observation = await dispatch("touch start before cancellation", "touchStart", [points.start]);
    await dispatch("arm before cancellation", "touchMove", [points.armed]);
    observation = await dispatch("native touch cancellation", "touchCancel", []);
    check(
      observation.shotId === 0 && observation.phase === "ready" && !observation.gesture,
      "native touchcancel disarms without a shot",
    );

    await reset();
    points = await pointsFor();
    observation = await dispatch("owned primary start", "touchStart", [points.start]);
    const primaryPointer = observation.gesture?.pointerId;
    const angled = async (angle, radius, id = 0) => (await pointsFor(angle)).at(radius, id);
    let primary = points.armed;
    observation = await dispatch("wide primary aiming", "touchMove", [primary]);
    const firstAngle = observation.aimAngle;
    primary = await angled(-Math.PI / 2 + .3, 93);
    observation = await dispatch("rotate at wide radius", "touchMove", [primary]);
    const distance = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    check(!observation.gesture.locked && distance(observation.aimAngle, firstAngle) > .2,
      "native primary rotates freely at wide radius");
    let secondary = { x: points.center.x + 60, y: points.center.y - 40, id: 1 };
    observation = await dispatch("add angle-holding second touch", "touchStart", [primary, secondary]);
    const heldAngle = observation.aimAngle;
    const secondPointer = observation.gesture?.lockPointerId;
    const heldPower = observation.power;
    check(observation.gesture?.pointerId === primaryPointer && secondPointer != null && secondPointer !== primaryPointer && observation.gesture.locked,
      "second touch holds angle without taking primary ownership");
    primary = await angled(-Math.PI / 2 + .7, 125);
    secondary = { ...secondary, x: secondary.x + 15 };
    observation = await dispatch("change primary radius and move second touch", "touchMove", [primary, secondary]);
    check(distance(observation.aimAngle, heldAngle) < 1e-9 && observation.power > heldPower && observation.gesture.armed,
      "second touch freezes angle while primary radius changes power");
    secondary = { ...secondary, y: secondary.y + 25 };
    observation = await dispatch("move only second touch", "touchMove", [primary, secondary]);
    check(distance(observation.aimAngle, heldAngle) < 1e-9 && observation.gesture.pointerId === primaryPointer,
      "second-touch movement cannot rotate aim or steal ownership");
    const heldScreenshot = `${artifactPrefix}-second-finger-lock.png`;
    await page.screenshot({ path: heldScreenshot, timeout: 2500 }); screenshots.push(heldScreenshot);
    observation = await dispatch("lift second touch only", "touchEnd", [secondary]);
    check(observation.gesture?.lockPointerId === null && !observation.gesture.locked && observation.shotId === 0,
      "second lift releases angle hold without shooting");
    primary = await angled(-Math.PI / 2 + .5, 110);
    observation = await dispatch("resume wide aiming after second lift", "touchMove", [primary]);
    check(distance(observation.aimAngle, heldAngle) > .1 && observation.gesture.pointerId === primaryPointer,
      "original primary resumes free aiming after second lift");

    observation = await dispatch("restore second touch hold", "touchStart", [primary, secondary]);
    const trackedSecond = observation.gesture.lockPointerId;
    const third = { x: points.center.x - 60, y: points.center.y - 30, id: 2 };
    observation = await dispatch("introduce third touch", "touchStart", [primary, secondary, third]);
    check(observation.gesture.lockPointerId === trackedSecond && observation.gesture.pointerId === primaryPointer,
      "third touch cannot replace tracked angle-holding second touch");
    observation = await dispatch("lift third touch only", "touchEnd", [third]);
    check(observation.gesture.lockPointerId === trackedSecond && observation.gesture.locked,
      "third lift does not release second-touch hold");
    observation = await dispatch("release primary while second remains", "touchEnd", [primary]);
    check(observation.shotId === 1 && observation.phase === "rolling" && !observation.gesture,
      "primary-first release shoots exactly once and ends ownership");
    secondary = { ...secondary, x: secondary.x - 20 };
    observation = await dispatch("move remaining second touch", "touchMove", [secondary]);
    check(observation.shotId === 1 && !observation.gesture,
      "remaining second touch cannot inherit shot ownership");
    observation = await dispatch("lift remaining second touch", "touchEnd", []);
    check(observation.shotId === 1 && !observation.gesture,
      "remaining second-touch release cannot shoot again");

    await reset();
    points = await pointsFor();
    await dispatch("primary before capture lifecycle probe", "touchStart", [points.start]);
    primary = points.armed;
    await dispatch("arm primary before capture lifecycle probe", "touchMove", [primary]);
    secondary = { x: points.center.x + 60, y: points.center.y - 40, id: 1 };
    observation = await dispatch("second before capture lifecycle probe", "touchStart", [primary, secondary]);
    // Process pending second capture before explicitly losing an established capture.
    secondary = { ...secondary, y: secondary.y + 1 };
    observation = await dispatch("establish second capture with movement", "touchMove", [primary, secondary]);
    const captureOwner = observation.gesture.pointerId;
    const captureSecond = observation.gesture.lockPointerId;
    check(captureSecond != null, "second pointer is tracked before capture lifecycle probe");
    remember({ kind: "action", name: "DOM lifecycle probe: release second pointer capture", pointerId: captureSecond });
    await bounded(() => page.locator('#table').evaluate((table, id) => table.releasePointerCapture(id), captureSecond), 3500, 'release second capture');
    // A changed coordinate emits a native pointermove to process pending capture.
    secondary = { ...secondary, x: secondary.x + 1 };
    observation = await dispatch("process second capture loss", "touchMove", [primary, secondary]);
    check(observation.gesture?.pointerId === captureOwner && observation.gesture.lockPointerId === null && !observation.gesture.locked && observation.shotId === 0,
      "second lost-capture releases hold while primary continues");
    primary = await angled(-Math.PI / 2 + .4, 100);
    observation = await dispatch("rotate primary after second capture loss", "touchMove", [primary, secondary]);
    check(distance(observation.aimAngle, -Math.PI / 2) > .3,
      "primary can rotate after second lost-capture");
    observation = await dispatch("cancel remaining touch sequence", "touchCancel", []);
    check(!observation.gesture && observation.shotId === 0 && observation.phase === "ready",
      "native whole-sequence touchcancel safely cancels primary and second");

    // A second-finger hold is independent of the optional near-white protection.
    await page.locator('#menu-open').click();
    await page.locator('#lock-aim').uncheck();
    await page.locator('#menu-close').click();
    await dispatch("primary with near protection disabled", "touchStart", [points.start]);
    await dispatch("arm without near protection", "touchMove", [points.armed]);
    observation = await dispatch("hold without near protection", "touchStart", [points.armed, secondary]);
    check(!observation.tuning.lockAim && observation.gesture.locked && observation.gesture.lockPointerId != null,
      "second touch locks independently of near-white protection setting");
    await page.locator('#menu-open').click();
    observation = await observe();
    check(!observation.gesture && observation.shotId === 0,
      "Menu cancels primary ownership and second-touch hold");
    await dispatch("release touches cancelled by Menu", "touchEnd", []);
    await page.locator('#menu-close').click();
    check((await observe()).shotId === 0, "Menu-cancelled releases cannot shoot");
    await dispatch("primary before Re-rack cancellation", "touchStart", [points.start]);
    await dispatch("arm before Re-rack cancellation", "touchMove", [points.armed]);
    await dispatch("second before Re-rack cancellation", "touchStart", [points.armed, secondary]);
    observation = await reset();
    check(!observation.gesture && observation.shotId === 0,
      "Re-rack cancels primary ownership and second-touch hold");
    observation = await dispatch("release touches cancelled by Re-rack", "touchEnd", []);
    check(!observation.gesture && observation.shotId === 0,
      "Re-rack-cancelled contacts cannot commit a stale shot");
    check(errors.length === 0, "native journey emitted no browser errors");
    const finalObservation = await observe();
    return {
      status: "PASS",
      input: "Chromium native CDP touch events",
      buildRevision: finalObservation.buildRevision,
      viewport: page.viewportSize(),
      assertions: checks.length,
      checks,
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
      classification,
      error: text,
      diagnosticScreenshot,
      checks,
      history, recentActions, recentObservations,
      errors,
    };
  } finally {
    await cdp.detach().catch(() => {});
  }
}
