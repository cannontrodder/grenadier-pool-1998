async (page) => {
  const harnessParameters = await page.evaluate(() =>
    Object.fromEntries(new URLSearchParams(location.search)),
  );
  const suite = harnessParameters.harnessCase || "interaction";
  const injectedFault = harnessParameters.harnessFault || null;
  let injectedFrozenObservation = null;
  let faultActive = false;
  const startedAt = Date.now();
  const bounds = { actionMs: 3500, observationMs: 2000, freshnessMs: 2000, faultProgressMs: 1500 };
  const checks = [];
  const history = [];
  const recentActions = [];
  const recentObservations = [];
  const errors = [];
  const screenshots = [];
  let identity = null;
  const pointerStartRadius = 18;
  const artifactPrefix = `output/playwright/practice/${suite}-${page.viewportSize().width}-${Date.now()}`;

  page.setDefaultTimeout(3500);
  const recordError = (message) => { errors.push(message); if (errors.length > 16) errors.shift(); };
  page.context().browser().on("disconnected", () => recordError("browser disconnected"));
  page.on("pageerror", (error) => recordError(`pageerror: ${String(error)}`));
  page.on("console", (message) => {
    if (message.type() === "error") recordError(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) =>
    recordError(`requestfailed: ${request.url()} ${request.failure()?.errorText || ""}`),
  );

  const persistJournal = async () => {
    if (!harnessParameters.harnessJournal) return;
    await page.request.post(harnessParameters.harnessJournal, {
      data: { identity, suite, injectedFault, faultActive, bounds, history, recentActions, recentObservations, errors, screenshots },
      timeout: 1000,
      failOnStatusCode: true,
    });
  };
  const remember = async (entry) => {
    const stamped = { at: Date.now(), ...entry };
    history.push(stamped);
    if (history.length > 16) history.shift();
    const recent = entry.kind === "action" ? recentActions : recentObservations;
    recent.push(stamped);
    if (recent.length > 16) recent.shift();
    await persistJournal();
  };
  const bounded = async (operation, timeout, label) => Promise.race([
    operation(),
    page.waitForTimeout(timeout).then(() => { throw new Error(`HARNESS: ${label} timed out within ${timeout}ms`); }),
  ]);
  const action = async (name, operation) => {
    await remember({ kind: "action", name });
    try {
      return await bounded(operation, bounds.actionMs, `action ${name}`);
    } catch (error) {
      throw new Error(`HARNESS: action ${name} failed: ${String(error)}`);
    }
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
      observation = await bounded(() => page.evaluate(() => window.practice?.observe()), bounds.observationMs, "browser observation");
      if (faultActive && injectedFault === "missing") observation = null;
      if (faultActive && injectedFault === "stale") {
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
    await remember({
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
      aimAngle: observation.aimAngle, tuning: observation.tuning, gesture: observation.gesture,
    });
    return observation;
  };
  const waitForFreshness = async (before, timeout = bounds.freshnessMs) => {
    const deadline = Date.now() + timeout;
    do {
      await page.waitForTimeout(50);
      const after = await observe();
      if (after.frame > before.frame + 1 && after.observedAt > before.observedAt) return after;
    } while (Date.now() < deadline);
    throw new Error(`HARNESS: stale observation stream within ${timeout}ms`);
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
  const ball = (observation, id) => observation.balls.find((item) => item.id === id);
  const closeEnough = (a, b, tolerance = 0.01) => Math.abs(a - b) <= tolerance;
  const sameFixture = (left, right) =>
    left.length === right.length &&
    left.every((expected) => {
      const actual = right.find((candidate) => candidate.id === expected.id);
      return (
        actual &&
        actual.status === expected.status &&
        closeEnough(actual.x, expected.x) &&
        closeEnough(actual.y, expected.y) &&
        actual.vx === 0 &&
        actual.vy === 0
      );
    });
  const normalizeAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
  const angleDistance = (left, right) => Math.abs(normalizeAngle(left - right));
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
  const gesture = async (angle, pullDistance, release = false, precise = false) => {
    const observation = await observe();
    const cue = observation.balls.find(
      (candidate) => candidate.role === "cue" && candidate.status === "live",
    );
    if (!cue) throw new Error("HARNESS: no live cue ball for pointer action");
    const matrix = observation.geometry?.matrix;
    if (!matrix) throw new Error("HARNESS: observation has no geometry matrix");
    const center = screenPoint(cue.x, cue.y, matrix);
    const direction = screenDirection(angle, matrix);
    let initialRadius = pointerStartRadius;
    let start = {
      x: center.x - direction.x * initialRadius,
      y: center.y - direction.y * initialRadius,
    };
    if (precise && page.context().browser().browserType().name() === 'webkit') {
      // WebKit rounds mouse coordinates to screen pixels. Choose a reachable
      // aiming point on the felt, allowing short radii when the white is near a rail.
      let best = Infinity;
      const viewport = page.viewportSize();
      for (let x = Math.max(1, Math.ceil(center.x - 110)); x <= Math.min(viewport.width - 1, center.x + 110); x++) {
        for (let y = Math.max(65, Math.ceil(center.y - 110)); y <= Math.min(viewport.height - 23, center.y + 110); y++) {
          const radius = Math.hypot(x - center.x, y - center.y);
          if (radius < 10 || radius > 110) continue;
          const alignment = ((center.x - x) * direction.x + (center.y - y) * direction.y) / radius;
          const det = matrix.a * matrix.d - matrix.b * matrix.c;
          const wx = (matrix.d * (x - matrix.e) - matrix.c * (y - matrix.f)) / det;
          const wy = (-matrix.b * (x - matrix.e) + matrix.a * (y - matrix.f)) / det;
          if (wx < 12 || wx > 988 || wy < 12 || wy > 488) continue;
          const error = 1 - alignment;
          if (error < best) { best = error; start = { x, y }; initialRadius = radius; }
        }
      }
      if (!Number.isFinite(best) || best > 0.000002) throw new Error('HARNESS: no sufficiently aligned reachable aiming point');
    }
    const end = {
      x: center.x + (start.x - center.x) * (initialRadius + pullDistance) / initialRadius,
      y: center.y + (start.y - center.y) * (initialRadius + pullDistance) / initialRadius,
    };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: precise ? 1 : 5 });
    if (release) await page.mouse.up();
    return { center, direction, start, end };
  };
  const reset = async () => {
    await action("Re-rack", () => page.locator("#reset").click());
    const result = await observe();
    check(result.phase === "ready", "Re-rack returns ready");
    return result;
  };
  const setStrength = async (value) => {
    await action(`set strength ${value}`, async () => {
      await page.locator("#menu-open").click();
      await page.locator("#strength").fill(String(value));
      await page.locator("#menu-close").click();
    });
    const observation = await observe();
    check(observation.strength === value, `strength is ${value.toFixed(1)}x`);
    check(
      !observation.gesture && observation.shotReady,
      "Menu change leaves the ready table disarmed",
    );
    return observation;
  };
  const waitForBuild = async (expected = null) => {
    await page.waitForFunction(expectedRevision => {
      const o = window.practice?.observe?.();
      return o?.health?.ok && typeof o.buildRevision === 'string' &&
        o.buildRevision !== 'local-unbuilt' && o.buildRevision.length > 0 &&
        (!expectedRevision || o.buildRevision === expectedRevision);
    }, expected, { timeout: bounds.observationMs });
  };
  const validateContract = async () => {
    await waitForBuild();
    identity = await page.evaluate(() => {
      const o = window.practice?.observe?.();
      return o ? { buildRevision: o.buildRevision, contractVersion: o.contractVersion,
        scenarioId: o.scenarioId, scenarioVersion: o.scenarioVersion, epoch: o.epoch } : null;
    });
    const first = await observe();
    const requiredNumbers = [
      "epoch",
      "tick",
      "stateRevision",
      "frame",
      "observedAt",
      "shotId",
      "strength",
      "aimAngle",
      "pull",
      "power",
      "potCount",
      "remaining",
    ];
    check(first.contractVersion === 1, "observation contract version 1");
    check(
      typeof first.buildRevision === "string" && first.buildRevision.length > 0,
      "build revision is reported",
    );
    check(
      typeof first.scenarioId === "string" &&
        first.scenarioId.length > 0 &&
        Number.isFinite(first.scenarioVersion),
      "scenario identity and version are reported",
    );
    check(
      requiredNumbers.every((field) => Number.isFinite(first[field])),
      "observation counters and shot values are finite",
    );
    check(
      ["ready", "aiming", "rolling", "placing-white", "cleared", "fault"].includes(
        first.phase,
      ),
      "phase belongs to the public contract",
    );
    check(
      first.health.ok === true &&
        typeof first.health.paused === "boolean" &&
        (first.health.fault === null || typeof first.health.fault === "string"),
      "healthy observation is explicit",
    );
    check(
      Array.isArray(first.balls) &&
        first.balls.length === 4 &&
        first.balls.every(
          (item) =>
            typeof item.id === "string" &&
            ["cue", "object"].includes(item.role) &&
            ["live", "potted"].includes(item.status) &&
            [item.x, item.y, item.vx, item.vy, item.r].every(Number.isFinite),
        ),
      "four versioned ball observations are complete",
    );
    check(
      first.geometry?.matrix &&
        ["a", "b", "c", "d", "e", "f"].every((key) =>
          Number.isFinite(first.geometry.matrix[key]),
        ) &&
        Array.isArray(first.geometry.rails) &&
        Array.isArray(first.geometry.jaws) &&
        Array.isArray(first.geometry.pockets) &&
        first.geometry.pockets.length === 6,
      "shared table and six-pocket geometry are observable",
    );
    const second = await waitForFreshness(first);
    check(second.tick === first.tick, "idle freshness advances without simulation ticks");
    check(second.frame > first.frame, "idle observation frames advance");
    const immutable = await page.evaluate(() => {
      const firstObservation = window.practice.observe();
      const original = firstObservation.balls[0].x;
      try {
        firstObservation.balls[0].x = original + 999;
        firstObservation.health.ok = false;
      } catch {}
      const secondObservation = window.practice.observe();
      return secondObservation.balls[0].x === original && secondObservation.health.ok;
    });
    check(immutable, "observations cannot mutate game state");
    return second;
  };
  const validateRenderedGeometry = async (observation) => {
    const match = await page.evaluate((before) => {
      // Capture the rendered observation and SVG atomically; journal I/O may
      // allow physics to advance after the caller's earlier observation.
      const expected = window.practice.observe();
      if (expected.epoch !== before.epoch || expected.frame < before.frame) return { ok: false, reason: 'observation epoch/frame changed unexpectedly' };
      const world = document.querySelector("#world");
      const actualMatrix = world?.getScreenCTM();
      if (!actualMatrix) return { ok: false, reason: "missing #world matrix" };
      const matrixKeys = ["a", "b", "c", "d", "e", "f"];
      const matrixDelta = Math.max(
        ...matrixKeys.map((key) => Math.abs(actualMatrix[key] - expected.geometry.matrix[key])),
      );
      const ballDeltas = expected.balls
        .filter((item) => item.status === "live")
        .map((item) => {
          const element = document.getElementById(`ball-${item.id}`);
          if (!element) return Infinity;
          const point = new DOMPoint(item.x, item.y).matrixTransform(actualMatrix);
          const bounds = element.getBoundingClientRect();
          return Math.hypot(
            point.x - (bounds.left + bounds.width / 2),
            point.y - (bounds.top + bounds.height / 2),
          );
        });
      const number = (element, attribute) => Number(element?.getAttribute(attribute));
      const railDeltas = expected.geometry.rails.map((rail) => {
        const element = document.getElementById(`rail-${rail.id}`);
        return Math.max(
          Math.abs(number(element, "x1") - rail.x1),
          Math.abs(number(element, "y1") - rail.y1),
          Math.abs(number(element, "x2") - rail.x2),
          Math.abs(number(element, "y2") - rail.y2),
        );
      });
      const jawDeltas = expected.geometry.jaws.map((jaw) => {
        const element = document.getElementById(`jaw-${jaw.id}`);
        return Math.max(
          Math.abs(number(element, "cx") - jaw.x),
          Math.abs(number(element, "cy") - jaw.y),
          Math.abs(number(element, "r") - jaw.r),
        );
      });
      const pocketDeltas = expected.geometry.pockets.map((pocket) => {
        const circle = document.getElementById(`pocket-${pocket.id}`);
        const mouth = document.getElementById(`mouth-${pocket.id}`);
        const { x, y, nx, ny, tx, ty, halfWidth } = pocket.mouth;
        const corners = [-1, 1].map((sign) => [
          x + sign * tx * halfWidth,
          y + sign * ty * halfWidth,
        ]);
        const back = corners.map(([px, py]) => [
          px + nx * pocket.captureDepth,
          py + ny * pocket.captureDepth,
        ]);
        const expectedPoints = [...corners, ...back.reverse()].flat();
        const actualPoints = (mouth?.getAttribute("points") || "")
          .trim()
          .split(/[ ,]+/)
          .filter(Boolean)
          .map(Number);
        const pointDelta =
          actualPoints.length === expectedPoints.length
            ? Math.max(
                ...expectedPoints.map((value, index) =>
                  Math.abs(actualPoints[index] - value),
                ),
              )
            : Infinity;
        return Math.max(
          Math.abs(number(circle, "cx") - pocket.x),
          Math.abs(number(circle, "cy") - pocket.y),
          Math.abs(number(circle, "r") - pocket.r),
          pointDelta,
        );
      });
      return {
        ok:
          matrixDelta < 0.01 &&
          ballDeltas.every((delta) => delta < 1) &&
          [...railDeltas, ...jawDeltas, ...pocketDeltas].every(
            (delta) => delta < 0.001,
          ),
        matrixDelta,
        maxBallDelta: Math.max(...ballDeltas),
        maxRailDelta: Math.max(...railDeltas),
        maxJawDelta: Math.max(...jawDeltas),
        maxPocketDelta: Math.max(...pocketDeltas),
      };
    }, { epoch: observation.epoch, frame: observation.frame });
    check(
      match.ok,
      "rendered balls, rails, jaws and pocket mouths match shared observations",
      JSON.stringify(match),
    );
  };

  const runInteraction = async (initial) => {
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "page does not scroll horizontally",
    );
    const targetSizes = await page
      .locator("#menu-open, #reset")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { width: bounds.width, height: bounds.height };
        }),
      );
    check(
      targetSizes.length === 2 &&
        targetSizes.every(({ width, height }) => width >= 44 && height >= 44),
      "primary controls have 44px targets",
    );
    await validateRenderedGeometry(initial);
    await screenshot("ready");

    for (const strength of [0.5, 1.8, 3]) {
      await reset();
      await setStrength(strength);
      // Browser mouse coordinates are quantized to device pixels. These two
      // probes tightly bracket the accepted 18.9 CSS-pixel arm boundary.
      await action(`probe ${strength}x arm threshold`, () => gesture(-Math.PI / 2, 18));
      let observation = await observe();
      check(
        observation.phase === "aiming" &&
          observation.gesture?.active === true &&
          observation.gesture.armed === false &&
          observation.shotReady === false,
        `18px remains unarmed at ${strength.toFixed(1)}x`,
      );
      const cue = ball(observation, "cue");
      const center = screenPoint(cue.x, cue.y, observation.geometry.matrix);
      const direction = screenDirection(-Math.PI / 2, observation.geometry.matrix);
      await page.mouse.move(
        center.x - direction.x * (pointerStartRadius + 19.8),
        center.y - direction.y * (pointerStartRadius + 19.8),
        { steps: 2 },
      );
      observation = await observe();
      check(
        observation.gesture?.armed === true && observation.shotReady === false,
        `19.8px arms while direct admission is reserved at ${strength.toFixed(1)}x`,
      );
      await page.mouse.move(
        center.x - direction.x * (pointerStartRadius + 128),
        center.y - direction.y * (pointerStartRadius + 128),
        { steps: 4 },
      );
      observation = await observe();
      check(
        closeEnough(observation.pull, 1, 0.01) && closeEnough(observation.power, 1, 0.01),
        `128px device-pixel probe saturates the 127px pull at ${strength.toFixed(1)}x`,
      );
      await page.mouse.move(
        center.x - direction.x * pointerStartRadius,
        center.y - direction.y * pointerStartRadius,
        { steps: 4 },
      );
      await page.mouse.up();
      observation = await observe();
      check(
        observation.shotId === 0 && !observation.gesture && observation.phase === "ready",
        `same-finger inward abort at ${strength.toFixed(1)}x`,
      );
    }

    await reset();
    await setStrength(1.8);
    await action("arm, abort and rearm in one gesture", async () => {
      const points = await gesture(-Math.PI / 2, 72);
      await page.mouse.move(points.start.x, points.start.y, { steps: 4 });
      let observation = await observe();
      check(!observation.gesture?.armed, "return inward disarms held gesture");
      await page.mouse.move(points.end.x, points.end.y, { steps: 4 });
      observation = await observe();
      check(observation.gesture?.armed, "same held gesture can rearm");
      await screenshot("rearmed");
      await page.mouse.up();
    });
    let rolling = await observe();
    check(
      rolling.shotId === 1 && rolling.phase === "rolling",
      "release commits exactly one primary-pointer shot",
    );
    const committedShot = rolling.shotId;
    await action("attempt second pointer shot while rolling", () =>
      gesture(Math.PI / 4, 80, true),
    );
    check((await observe()).shotId === committedShot, "shooting is denied while rolling");

    const beforeResetEpoch = rolling.epoch;
    const fixture = initial.balls;
    const afterMotionReset = await reset();
    check(afterMotionReset.epoch > beforeResetEpoch, "Re-rack advances scenario epoch");
    check(sameFixture(fixture, afterMotionReset.balls), "Re-rack restores exact fixture");
    check(afterMotionReset.strength === 1.8, "Re-rack retains strength");

    await action("open Menu during an armed gesture", async () => {
      await gesture(-Math.PI / 2, 60);
      await page.evaluate(() => document.querySelector("#menu-open").click());
      await page.mouse.up();
    });
    let observation = await observe();
    check(
      observation.phase === "ready" && !observation.gesture && observation.shotId === 0,
      "opening Menu consumes and disarms the active gesture",
    );
    await page.locator("#menu-close").click();

    for (const kind of ["pointercancel", "lostpointercapture", "blur", "pagehide"]) {
      await reset();
      await gesture(-Math.PI / 2, 60);
      await action(`dispatch ${kind}`, async () => {
        await page.evaluate((eventKind) => {
          const current = window.practice.observe();
          if (eventKind === "blur" || eventKind === "pagehide") {
            window.dispatchEvent(new Event(eventKind));
          } else {
            document.querySelector("#table").dispatchEvent(
              new PointerEvent(eventKind, {
                pointerId: current.gesture.pointerId,
                isPrimary: true,
              }),
            );
          }
        }, kind);
        await page.mouse.up();
      });
      observation = await observe();
      check(
        observation.phase === "ready" && !observation.gesture && observation.shotId === 0,
        `${kind} disarms without a shot`,
      );
      if (kind === "pagehide") {
        await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
        check((await observe()).health.paused === false, "pageshow resumes the table clock");
      }
    }

    await reset();
    await gesture(-Math.PI / 2, 60);
    const beforeRotation = await observe();
    const viewport = page.viewportSize();
    await action("rotate viewport during aim", async () => {
      await page.setViewportSize({ width: viewport.height, height: viewport.width });
      await page.waitForTimeout(100);
      await page.mouse.up();
    });
    observation = await observe();
    check(
      observation.phase === "ready" && !observation.gesture && observation.shotId === 0,
      "resize/orientation change disarms without a shot",
    );
    check(
      sameFixture(beforeRotation.balls, observation.balls),
      "orientation change preserves world positions",
    );
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100);
    await validateRenderedGeometry(await observe());

    await reset();
    await action("start motion before visibility pause", () =>
      gesture(-Math.PI / 2, 55, true),
    );
    await waitForGame(
      "shot motion",
      () => window.practice.observe().balls.some((item) => Math.hypot(item.vx, item.vy) > 1),
      {},
      1800,
    );
    await action("hide document during motion", () =>
      page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, value: true });
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          value: "hidden",
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }),
    );
    const pausedBefore = await observe();
    await page.waitForTimeout(300);
    const pausedAfter = await observe();
    check(
      pausedAfter.health.paused &&
        pausedAfter.tick === pausedBefore.tick &&
        pausedAfter.balls.every((item) => {
          const before = ball(pausedBefore, item.id);
          return closeEnough(item.x, before.x) && closeEnough(item.y, before.y);
        }),
      "hidden-page motion pauses without catch-up",
    );
    await action("restore visible document", () =>
      page.evaluate(() => {
        delete document.hidden;
        delete document.visibilityState;
        document.dispatchEvent(new Event("visibilitychange"));
      }),
    );
    await waitForGame(
      "motion resumes after visibility restore",
      (tick) => window.practice.observe().tick > tick,
      pausedAfter.tick,
      1800,
    );
    await reset();
  };

  const runPot = async () => {
    const journeys = [
      { name: "side", angle: -Math.PI / 2, pull: 58, expectedBall: "object-1" },
      {
        name: "corner",
        angle: Number(harnessParameters.cornerAngle || -2.5722794624891314),
        pull: Number(harnessParameters.cornerPull || 69.5),
        expectedBall: "object-2",
      },
    ];
    for (const journey of journeys) {
      await reset();
      await setStrength(1.8);
      const before = await observe();
      await action(`${journey.name} pocket primary gesture`, () =>
        gesture(journey.angle, journey.pull, false, true),
      );
      let observation = await observe();
      check(
        observation.phase === "aiming" && observation.gesture?.armed,
        `${journey.name} pocket gesture arms`,
      );
      check(
        angleDistance(observation.aimAngle, journey.angle) < 0.025,
        `${journey.name} aim angle follows pointer geometry`,
      );
      await screenshot(`${journey.name}-armed`);
      await page.mouse.up();
      observation = await observe();
      check(
        observation.phase === "rolling" && observation.shotId === 1,
        `${journey.name} release starts one shot`,
      );
      await waitForGame(
        `${journey.name} ball progress`,
        ({ cueX, cueY }) => {
          const cue = window.practice.observe().balls.find((item) => item.role === "cue");
          return Math.hypot(cue.x - cueX, cue.y - cueY) > 3;
        },
        { cueX: ball(before, "cue").x, cueY: ball(before, "cue").y },
        1800,
      );
      observation = await observe();
      check(
        observation.balls.some((item) => Math.hypot(item.vx, item.vy) > 0),
        `${journey.name} motion exposes velocity`,
      );
      await validateRenderedGeometry(observation);
      await screenshot(`${journey.name}-motion`);
      observation = await waitForGame(
        `${journey.name} visible pot feedback`,
        (targetId) => {
          const state = window.practice.observe();
          const target = state.balls.find((item) => item.id === targetId);
          return (
            target?.status === "potted" &&
            /ball potted/i.test(document.querySelector("#status")?.textContent || "")
          );
        },
        journey.expectedBall,
        5000,
      );
      check(
        ball(observation, journey.expectedBall)?.status === "potted",
        `${journey.name} pot has visible brief feedback`,
      );
      await screenshot(`${journey.name}-pot-feedback`);
      const settled = await waitForGame(
        `${journey.name} shot settling`,
        () => window.practice.observe().phase !== "rolling",
        {},
        8000,
      );
      check(
        settled.balls
          .filter((item) => item.status === "live")
          .every((item) => item.vx === 0 && item.vy === 0),
        `${journey.name} settling clamps live velocities to zero`,
      );
      const captured = ball(settled, journey.expectedBall);
      check(
        captured?.status === "potted" && typeof captured.pocketId === "string",
        `${journey.name} target is captured through a pocket`,
      );
      check(
        settled.geometry.pockets.some((pocket) => pocket.id === captured.pocketId),
        `${journey.name} capture reports a shared-geometry pocket`,
      );
      const captureEvents = settled.events.filter(
        (event) =>
          event.ballId === journey.expectedBall && /pot|captur/i.test(String(event.type)),
      );
      check(captureEvents.length === 1, `${journey.name} capture emits exactly one event`);
      check(
        settled.potCount === 1 && settled.remaining === 2,
        `${journey.name} pot count and remaining count agree`,
      );
      await screenshot(`${journey.name}-pot`);
    }
  };

  const runTuning = async (initial) => {
    check(initial.tuning.guideLength === 60 && initial.tuning.lockDistance === 28 && initial.tuning.pocketSize === 110 && initial.tuning.lockAim && initial.tuning.contactMarker, 'helpful defaults are observable');
    check(initial.guide.hit?.id === 'object-1' && closeEnough(initial.guide.y, 204), 'guide previews first cue-ball contact');
    await validateRenderedGeometry(initial);
    await page.locator('#menu-open').click();
    const limits = await page.locator('#strength, #guide-length, #lock-distance, #pocket-size').evaluateAll(els => els.map(e => [e.id, e.min, e.max, e.value]));
    check(JSON.stringify(limits) === JSON.stringify([['strength','0.5','3','1.8'],['guide-length','10','100','60'],['lock-distance','20','60','28'],['pocket-size','90','130','110']]), 'menu displays bounded defaults');
    check(await page.locator('#menu').evaluate(e => e.scrollWidth <= e.clientWidth), 'phone menu has no horizontal overflow');
    await screenshot('tuning-menu');
    await page.locator('#guide-length').fill('10');
    let o = await observe();
    check(o.guide.hit === null && closeEnough(o.guide.distance, 100), 'short guide respects selected length');
    await page.locator('#guide-length').fill('100');
    check((await observe()).guide.hit?.id === 'object-1', 'long guide stops at first contact');
    await page.locator('#contact-toggle').uncheck();
    check(await page.locator('#contact-marker').evaluate(e => e.style.display === 'none'), 'marker can be hidden');
    await page.locator('#contact-toggle').check();
    await page.locator('#lock-distance').fill('20');
    await page.locator('#menu-close').click();
    const pull = await gesture(-Math.PI / 2, 70);
    o = await observe();
    check(o.gesture.locked, 'pull beyond configured threshold locks aim');
    const lockedAngle = o.aimAngle;
    await page.mouse.move(pull.end.x + pull.direction.y * 10, pull.end.y - pull.direction.x * 10);
    o = await observe();
    check(angleDistance(o.aimAngle, lockedAngle) < 1e-9, 'sideways power drift cannot change locked aim');
    check(await page.locator('#aim').evaluate(e => e.classList.contains('locked')), 'lock is visibly indicated');
    await screenshot('locked-guide');
    await page.mouse.up();
    o = await observe();
    check(o.phase === 'rolling' && o.shotId === 1 && angleDistance(o.aimAngle, lockedAngle) < 1e-9, 'release preserves aim and shoots once');
    await reset();
    check((await observe()).tuning.guideLength === 100 && (await observe()).tuning.lockDistance === 20, 're-rack retains tuning');
    const nextPull = await gesture(-Math.PI / 2, 70);
    await page.mouse.move(nextPull.start.x, nextPull.start.y);
    o = await observe();
    check(!o.gesture.locked && !o.gesture.armed, 'neutral return unlocks and disarms');
    await page.mouse.move(nextPull.center.x - nextPull.direction.y * 18, nextPull.center.y + nextPull.direction.x * 18);
    o = await observe();
    check(angleDistance(o.aimAngle, lockedAngle) > 1, 'neutral contact can aim in a new direction');
    await page.mouse.up();
    check((await observe()).shotId === 0, 'inward release aborts after re-aim');
    await page.locator('#menu-open').click();
    await page.locator('#lock-aim').uncheck();
    check(await page.locator('#lock-distance').isDisabled(), 'lock-distance disabled when free aim selected');
    await page.locator('#menu-close').click();
    const freePull = await gesture(-Math.PI / 2, 70);
    const freeAngle = (await observe()).aimAngle;
    await page.mouse.move(freePull.end.x + freePull.direction.y * 15, freePull.end.y - freePull.direction.x * 15);
    o = await observe();
    check(!o.gesture.locked && angleDistance(o.aimAngle, freeAngle) > .05, 'free aim follows pointer while pulled');
    await page.mouse.move(freePull.start.x, freePull.start.y); await page.mouse.up();
    for (const size of [90, 130]) {
      const before = await observe();
      await page.locator('#menu-open').click();
      if (!(await page.locator('#pocket-settings').evaluate(e => e.open))) await page.locator('#pocket-settings summary').click();
      await page.locator('#pocket-size').fill(String(size));
      o = await observe();
      check(o.epoch === before.epoch && o.pocketScale === before.pocketScale, `pending ${size}% does not mutate the playing table`);
      await page.locator('#pocket-apply').click();
      o = await observe();
      check(o.epoch === before.epoch + 1 && o.pocketScale === size / 100 && o.tuning.pocketSize === size && o.shotReady, `apply ${size}% re-racks with matching tuning`);
      await validateRenderedGeometry(o);
      const middle = o.geometry.pockets.find(p => p.id === 'top-middle');
      check(closeEnough(middle.mouth.halfWidth, 34 * size / 100), `physical mouth scales to ${size}%`);
    }
    await page.locator('#menu-open').click();
    await page.locator('#pocket-size').fill('90');
    await page.locator('#menu-close').click(); await page.locator('#menu-open').click();
    check((await page.locator('#pocket-size').inputValue()) === '130', 'closing menu discards unapplied pocket preview');
    await page.locator('#defaults').click();
    o = await observe();
    check(o.shotReady && o.tuning.strength === 1.8 && o.tuning.guideLength === 60 && o.tuning.lockDistance === 28 && o.tuning.pocketSize === 110 && o.tuning.lockAim && o.tuning.contactMarker, 'restore defaults resets all tuning and re-racks');
    await validateRenderedGeometry(o);
    await screenshot('defaults-table');
    await page.locator('#menu-open').click(); await page.locator('#guide-length').fill('10'); await page.locator('#menu-close').click();
    await page.reload();
    await waitForBuild(initial.buildRevision);
    check((await observe()).tuning.guideLength === 60, 'reload returns to session defaults');
  };

  const runLayouts = async (initial) => {
    const layoutId = harnessParameters.layout || 'straight-pots';
    const journey = JSON.parse(harnessParameters.journey || 'null');
    if (!journey?.shots?.length) throw new Error('HARNESS: missing versioned layout journey');
    await page.locator('#menu-open').click();
    const layoutBounds = await page.locator('#practice-layout').boundingBox();
    check(layoutBounds?.height >= 44, 'layout selector provides a 44px touch target');
    await screenshot('layout-menu');
    const names = await page.locator('#practice-layout option').allTextContents();
    check(JSON.stringify(names) === JSON.stringify(['Straight pots', 'Cut pots', 'Cushion practice']), 'three named layouts are visible');
    await page.locator('#strength').fill('2.1');
    await page.locator('#practice-layout').selectOption(layoutId);
    if (await page.locator('#menu').evaluate(e => e.open)) await page.locator('#menu-close').click();
    let state = await observe();
    check(state.scenarioId === layoutId && state.scenarioVersion === journey.version, 'selected layout identity is versioned');
    check(state.strength === 2.1, 'layout selection preserves strength');
    const fixture = state.balls;
    check(state.remaining === 3 && state.potCount === 0 && state.shotReady, 'layout starts with three objects and a ready white');
    await validateRenderedGeometry(state);
    await screenshot('layout-ready');
    await setStrength(1.8);
    for (const [index, shot] of journey.shots.entries()) {
      state = await observe();
      const cue = ball(state, 'cue'), target = ball(state, shot.ball);
      let angle = shot.angle;
      if (shot.target) {
        const length = Math.hypot(shot.target.x - target.x, shot.target.y - target.y);
        const ghost = { x: target.x - 24 * (shot.target.x - target.x) / length,
          y: target.y - 24 * (shot.target.y - target.y) / length };
        angle = Math.atan2(ghost.y - cue.y, ghost.x - cue.x);
      }
      await action(`${layoutId} shot ${index + 1}`, () => gesture(angle, 12 + 115 * Math.sqrt(shot.power), false, true));
      const armed = await observe();
      check(armed.gesture?.armed, `shot ${index + 1} arms through primary pointer`);
      if (index === 0) await screenshot('layout-armed');
      await page.mouse.up();
      check((await observe()).shotId === index + 1, `shot ${index + 1} commits exactly once`);
      const settled = await waitForGame(`${layoutId} shot ${index + 1} settles`, () => window.practice.observe().phase !== 'rolling', {}, 10000);
      check(settled.health.ok, `shot ${index + 1} remains healthy`);
      check(ball(settled, shot.ball).status === 'potted', `shot ${index + 1} pots ${shot.ball}`);
      check(ball(settled, shot.ball).pocketId === shot.pocket, `shot ${index + 1} enters ${shot.pocket}`);
      check(settled.potCount === index + 1 && settled.remaining === 2 - index, `shot ${index + 1} count remains truthful`);
      check(await page.locator('#count').textContent() === `${index + 1}/3`, `shot ${index + 1} count is rendered`);
      check(settled.events.filter(e => e.type === 'pot').length === index + 1, 'one event per potted object');
      check(settled.balls.filter(b => b.status === 'live').every(b => b.vx === 0 && b.vy === 0), 'settling leaves zero velocities');
      if (index < journey.shots.length - 1) check(settled.shotReady, 'remaining balls continue from settled positions');
    }
    state = await observe();
    check(state.phase === 'cleared' && !state.shotReady, 'complete clear blocks another shot');
    check(await page.locator('#status').textContent() === 'Table cleared', 'Table cleared is visible');
    await validateRenderedGeometry(state);
    await screenshot('layout-cleared');
    await page.waitForTimeout(150);
    check((await observe()).phase === 'cleared', 'clear does not automatically reset');
    await gesture(0, 50, true);
    check((await observe()).shotId === 3, 'cleared table rejects pointer shots');
    const epoch = state.epoch;
    const reracked = await reset();
    check(reracked.epoch === epoch + 1 && sameFixture(fixture, reracked.balls), 'Re-rack after clear restores exact selected layout');
    check(reracked.events.length === 0 && reracked.potCount === 0 && reracked.shotId === 0, 'Re-rack clears counts and event history');
    await gesture(-Math.PI / 2, 55);
    await page.evaluate(() => document.querySelector('#reset').click());
    await page.mouse.up();
    state = await observe();
    check(state.shotId === 0 && !state.gesture && sameFixture(fixture, state.balls), 'Re-rack during aim consumes delayed release');
    await gesture(-Math.PI / 2, 55, true);
    check((await observe()).phase === 'rolling', 'ordinary shot starts motion before reset');
    await reset();
    state = await observe();
    check(state.shotId === 0 && state.events.length === 0 && sameFixture(fixture, state.balls), 'Re-rack during motion restores selected fixture');
    await gesture(-Math.PI / 2, 55);
    await page.evaluate(() => document.querySelector('#menu-open').click());
    const nextId = layoutId === 'cut-pots' ? 'cushion-practice' : 'cut-pots';
    await page.locator('#practice-layout').selectOption(nextId);
    await page.mouse.up();
    state = await observe();
    check(state.scenarioId === nextId && state.shotId === 0 && !state.gesture && state.events.length === 0, 'layout change during aim consumes delayed release');
    check(state.strength === 1.8, 'layout changes retain current strength');
    await setStrength(2.1);
    await gesture(0, 55, true);
    const movingEpoch = (await observe()).epoch;
    check((await observe()).phase === 'rolling', 'motion begins before layout selection');
    await page.locator('#menu-open').click();
    await page.locator('#practice-layout').selectOption(layoutId);
    state = await observe();
    check(state.epoch === movingEpoch + 1 && sameFixture(fixture, state.balls), 'layout selection during motion restores exact destination fixture in a fresh epoch');
    check(state.strength === 2.1 && state.shotId === 0 && state.potCount === 0 && state.events.length === 0 && state.aimAngle === -Math.PI / 2, 'layout selection resets shot/count/aim/events and retains nondefault strength');
    await page.waitForTimeout(250);
    state = await observe();
    check(state.shotId === 0 && state.events.length === 0 && sameFixture(fixture, state.balls), 'old motion cannot leak events into selected layout');
    await page.reload();
    await waitForBuild(initial.buildRevision);
    state = await observe();
    check(state.scenarioId === 'straight-pots' && state.strength === 1.8 && sameFixture(initial.balls, state.balls), 'reload restores default layout and strength');
  };

  const runKeyboard = async () => {
    await reset();
    await action("open keyboard shot controls", async () => {
      await page.locator("#menu-open").click();
      await page.getByText("Keyboard shot controls", { exact: true }).click();
    });
    const controlSizes = await page
      .locator("#angle, #keyboard-power, #shoot, #menu-close")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { width: bounds.width, height: bounds.height };
        }),
      );
    check(
      controlSizes.length === 4 &&
        controlSizes.every(({ width, height }) => width >= 44 && height >= 44),
      "keyboard controls have 44px targets",
    );
    await page.locator("#angle").fill("-90");
    await page.locator("#keyboard-power").fill("0.35");
    let observation = await observe();
    check(
      angleDistance(observation.aimAngle, -Math.PI / 2) < 0.001 &&
        (await page.locator("#keyboard-power").inputValue()) === "0.35",
      "keyboard controls expose angle and power",
    );
    await action("keyboard commits shot", async () => {
      await page.locator("#shoot").focus();
      await page.keyboard.press("Enter");
    });
    observation = await observe();
    check(
      observation.phase === "rolling" && observation.shotId === 1,
      "Enter on Shoot commits exactly one keyboard shot",
    );
    check(!observation.gesture, "keyboard shot does not forge a pointer gesture");
    await reset();
  };

  const runFault = async (initial) => {
    await remember({ kind: 'action', name: `inject ${injectedFault}` });
    faultActive = true;
    if (injectedFault === 'missing') await observe();
    else if (injectedFault === 'stale') {
      injectedFrozenObservation = initial;
      await waitForFreshness(initial);
    } else if (injectedFault === 'action-timeout') {
      // An actual blocked locator action exercises the ordinary action deadline.
      await page.locator('#reset').evaluate(element => { element.disabled = true; });
      await action('blocked Re-rack', () => page.locator('#reset').click());
    } else if (injectedFault === 'stalled-progress') {
      // Swallow a real release at the input boundary; the animation/observer stays live.
      await page.evaluate(() => window.addEventListener('pointerup', event => event.stopImmediatePropagation(), { capture: true, once: true }));
      await action('release shot with swallowed pointerup', () => gesture(-Math.PI / 2, 58, true));
      await waitForGame('released shot makes progress', () => window.practice.observe().shotId > 0, {}, bounds.faultProgressMs);
    } else if (injectedFault === 'disconnect') {
      // The CLI worker exits with the browser. Persist this checkpoint in the
      // outer runner before it actually disconnects and exercises its boundary.
      return { status: 'CHECKPOINT', identity, suite, injectedFault, faultActive, bounds,
        history, recentActions, recentObservations, errors, screenshots };
    } else throw new Error(`HARNESS: unknown injected fault ${injectedFault}`);
    throw new Error(`HARNESS: injected fault ${injectedFault} escaped detection`);
  };

  try {
    const initial = await validateContract();
    await screenshot("initial-checkpoint");
    if (injectedFault) {
      const checkpoint = await runFault(initial);
      if (checkpoint) return checkpoint;
    }
    else if (suite === "interaction") await runInteraction(initial);
    else if (suite === "pot") await runPot();
    else if (suite === "tuning") await runTuning(initial);
    else if (suite === "keyboard") await runKeyboard();
    else if (suite === "layouts") await runLayouts(initial);
    else throw new Error(`HARNESS: unknown browser suite ${suite}`);
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
    const classification = text.startsWith("Error: UNCERTAIN:")
      ? "uncertain"
      : text.startsWith("Error: GAME:") ? "game-failure" : "harness-failure";
    recordError(text);
    let diagnosticScreenshot = `${artifactPrefix}-failure.png`;
    try {
      await page.screenshot({ path: diagnosticScreenshot, timeout: 2000 });
    } catch (screenshotError) {
      recordError(`diagnostic screenshot: ${String(screenshotError)}`);
      diagnosticScreenshot = null;
    }
    return {
      status: "FAIL",
      identity,
      suite,
      injectedFault,
      faultActive,
      bounds,
      elapsedMs: Date.now() - startedAt,
      classification,
      error: text,
      diagnosticScreenshot,
      checks,
      history,
      recentActions,
      recentObservations,
      errors,
      screenshots,
    };
  }
}
