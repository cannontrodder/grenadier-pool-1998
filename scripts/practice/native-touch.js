async (page) => {
  const cdp = await page.context().newCDPSession(page);
  const checks = [];
  const history = [];
  const errors = [];
  const artifactPrefix = `output/playwright/practice/native-${page.viewportSize().width}-${Date.now()}`;
  page.setDefaultTimeout(3500);
  page.on("pageerror", (error) => errors.push(`pageerror: ${String(error)}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

  const remember = (entry) => {
    history.push({ at: Date.now(), ...entry });
    if (history.length > 16) history.shift();
  };
  const check = (condition, name) => {
    if (!condition) throw new Error(`GAME: ${name}`);
    checks.push(name);
  };
  const observe = async () => {
    let observation;
    try {
      observation = await page.evaluate(() => window.practice?.observe());
    } catch (error) {
      throw new Error(`HARNESS: browser observation failed: ${String(error)}`);
    }
    if (!observation || !Number.isFinite(observation.frame) || !observation.health) {
      throw new Error("HARNESS: missing or malformed observation");
    }
    remember({
      kind: "observation",
      frame: observation.frame,
      tick: observation.tick,
      epoch: observation.epoch,
      phase: observation.phase,
      shotId: observation.shotId,
      gesture: observation.gesture,
    });
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
  const dispatch = async (name, type, points) => {
    remember({ kind: "action", name, type, points });
    const before = await observe();
    await cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((point) => ({
        x: point.x,
        y: point.y,
        id: point.id,
        radiusX: 9,
        radiusY: 9,
        force: 1,
      })),
    });
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
    const secondary = { x: points.center.x + 80, y: points.center.y + 20, id: 1 };
    observation = await dispatch("add secondary contact", "touchStart", [points.start, secondary]);
    check(
      observation.gesture?.pointerId === primaryPointer && observation.shotId === 0,
      "secondary contact cannot steal gesture ownership",
    );
    observation = await dispatch("move primary with secondary present", "touchMove", [
      points.full,
      { ...secondary, x: secondary.x + 25 },
    ]);
    check(
      observation.gesture?.pointerId === primaryPointer && observation.gesture?.armed,
      "owned primary keeps aim while secondary moves",
    );
    observation = await dispatch("release contacts", "touchEnd", []);
    check(
      observation.shotId === 1,
      "extra contact is ignored and owned primary release shoots exactly once",
    );
    await reset();
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
      classification,
      error: text,
      diagnosticScreenshot,
      checks,
      history,
      errors,
    };
  } finally {
    await cdp.detach().catch(() => {});
  }
}
