async (page) => {
  const results = [],
    recent = [],
    errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.setDefaultTimeout(3500);
  const check = (ok, name) => {
    if (!ok) throw new Error("GAME: " + name);
    results.push(name);
  };
  const observe = async () => {
    const o = await page.evaluate(() => window.touchStudy?.observe());
    if (!o || !Number.isFinite(o.frame))
      throw new Error("HARNESS: missing observation");
    recent.push(o);
    if (recent.length > 16) recent.shift();
    return o;
  };
  const waitGame = async (name, predicate, arg, timeout) => {
    try {
      await page.waitForFunction(predicate, arg, { timeout });
    } catch (original) {
      // A healthy, advancing observation stream lets us attribute a missed game deadline.
      try {
        const before = await observe();
        await page.waitForFunction(
          (f) => touchStudy.health().ok && touchStudy.observe().frame > f + 2,
          before.frame,
          { timeout: 1000 },
        );
        await observe();
      } catch (healthError) {
        throw new Error(
          "UNCERTAIN: " +
            name +
            " timed out; observation health could not be proved. " +
            String(original),
        );
      }
      throw new Error(
        "GAME: " + name + " did not complete within " + timeout + "ms",
      );
    }
  };
  const checkTargets = async (selector, label) => {
    const sizes = await page
      .locator(selector)
      .evaluateAll((es) =>
        es.map((e) => ({
          w: e.getBoundingClientRect().width,
          h: e.getBoundingClientRect().height,
        })),
      );
    check(
      sizes.length > 0 && sizes.every((r) => r.w >= 44 && r.h >= 44),
      label,
    );
  };
  const action = async (name, fn) => {
    recent.push({ action: name });
    return await fn();
  };
  const reset = async () => {
    await page.locator("#reset").click();
    return observe();
  };
  const down = async () => {
    const { cue } = await page.evaluate(() => touchStudy.geometry());
    const portrait =
      (await page.viewportSize()).height > (await page.viewportSize()).width;
    const start = {
      x: cue.x + (portrait ? 0 : -35),
      y: cue.y + (portrait ? -35 : 0),
    };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    return { cue, start, portrait };
  };
  const arm = async () => {
    const g = await down();
    await page.mouse.move(
      g.start.x + (g.portrait ? 0 : -85),
      g.start.y + (g.portrait ? -85 : 0),
      { steps: 6 },
    );
    return g;
  };
  try {
    await page.waitForFunction(
      () => window.touchStudy?.health().ok,
      {},
      { timeout: 4000 },
    );
    await observe();
    await page.waitForFunction(
      () => /^[a-f0-9]{40}$/.test(touchStudy.observe()?.revision),
      {},
      { timeout: 5000 },
    );
    const a = await observe();
    await page.waitForFunction(
      (f) => touchStudy.observe().frame > f + 2,
      a.frame,
      { timeout: 2000 },
    );
    const b = await observe();
    if (b.observedAt <= a.observedAt)
      throw new Error("HARNESS: stale observations");
    check(/^[a-f0-9]{40}$/.test(a.revision), "exact committed build identity");
    check(a.scenario === "two-ball-centre-v1", "scenario identity");
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "no document overflow",
    );
    const targets = await page.locator(".tools button").evaluateAll((es) =>
      es.map((e) => ({
        w: e.getBoundingClientRect().width,
        h: e.getBoundingClientRect().height,
      })),
    );
    check(
      targets.every((r) => r.w >= 44 && r.h >= 44),
      "44px primary controls",
    );
    const g = await action("aim and pull", arm);
    check((await observe()).phase === "armed", "armed after pull");
    await page.waitForFunction(
      () =>
        Number(getComputedStyle(document.querySelector(".tools")).opacity) <
        0.2,
      {},
      { timeout: 1000 },
    );
    await page.screenshot({
      path:
        "output/playwright/touch-study/armed-" +
        page.viewportSize().width +
        ".png",
    });
    await action("release", () => page.mouse.up());
    const moving = await observe();
    check(
      moving.shots === 1 && moving.phase === "rolling",
      "release exactly one shot",
    );
    await waitGame(
      "ball progress",
      (x) => Math.abs(touchStudy.observe().balls[0].x - x) > 3,
      moving.balls[0].x,
      1800,
    );
    const progressed = await observe();
    check(
      progressed.balls.some((b) => Math.hypot(b.vx, b.vy) > 0),
      "motion observation has velocity",
    );
    const match = await page.evaluate(() =>
      touchStudy.observe().balls.every((b) => {
        const e = document.getElementById("ball-" + b.id),
          p = new DOMPoint(b.x, b.y).matrixTransform(
            document.getElementById("world").getScreenCTM(),
          ),
          r = e.getBoundingClientRect();
        return (
          Math.abs(r.x + r.width / 2 - p.x) < 1 &&
          Math.abs(r.y + r.height / 2 - p.y) < 1 &&
          Math.abs(Number(e.getAttribute("cx")) - b.x) < 0.01
        );
      }),
    );
    check(match, "moving SVG positions match observations");
    await page.screenshot({
      path:
        "output/playwright/touch-study/motion-" +
        page.viewportSize().width +
        ".png",
    });
    await waitGame(
      "ball settling",
      () => touchStudy.observe().phase === "ready",
      {},
      7000,
    );
    check(
      (await observe()).balls.every((b) => b.vx === 0 && b.vy === 0),
      "motion settles within bound",
    );
    const first = await reset();
    check(
      first.shots === 0 && first.balls[0].x === 270 && first.balls[0].y === 250,
      "deterministic reset",
    );
    const abort = await arm();
    await page.mouse.move(abort.start.x, abort.start.y, { steps: 5 });
    check((await observe()).phase === "aiming", "inward return disarms");
    await page.mouse.up();
    check((await observe()).shots === 0, "same-finger abort releases no shot");
    for (const kind of [
      "pointercancel",
      "lostpointercapture",
      "blur",
      "background",
      "orientation",
    ]) {
      await reset();
      await arm();
      if (kind === "orientation") {
        const v = page.viewportSize();
        await page.setViewportSize({ width: v.height, height: v.width });
        await page.setViewportSize(v);
      } else
        await page.evaluate((kind) => {
          const table = document.getElementById("table"),
            id = touchStudy.observe().gesture.id;
          if (kind === "background") {
            Object.defineProperty(document, "hidden", {
              configurable: true,
              value: true,
            });
            document.dispatchEvent(new Event("visibilitychange"));
            delete document.hidden;
          } else if (kind === "blur") window.dispatchEvent(new Event("blur"));
          else table.dispatchEvent(new PointerEvent(kind, { pointerId: id }));
        }, kind);
      await page.mouse.up();
      const s = await observe();
      check(
        s.shots === 0 && s.phase === "ready" && !s.gesture,
        "interruption disarms: " + kind,
      );
    }
    await page.locator("#controls-open").click();
    await page.locator("#alternative summary").click();
    await checkTargets(
      "#controls button, #controls select, #controls input",
      "44px shot-sheet controls",
    );
    await page.locator("#scheduled-loss").click();
    await arm();
    await waitGame(
      "scheduled turn loss",
      () => !touchStudy.observe().owner,
      {},
      4000,
    );
    await page.mouse.up();
    check(
      (await observe()).shots === 0 && !(await observe()).gesture,
      "timed ownership loss during direct gesture",
    );
    await reset();
    await page.locator("#controls-open").click();
    await page.locator("#arm").click();
    check((await observe()).shotReady, "button alternative arms");
    await page.locator("#strength").fill("2.4");
    check(
      (await observe()).strength === 2.4 && !(await observe()).shotReady,
      "strength tuning disarms",
    );
    await page.locator("#arm").click();
    await page.locator("#ownership").click();
    check(
      !(await observe()).shotReady && !(await observe()).owner,
      "ownership loss disarms",
    );
    await page.locator("#ownership").click();
    await page.locator("#mapping").selectOption("gentle");
    check((await observe()).mapping === "gentle", "review mapping selector");
    await page.locator("#arm").click();
    await page.locator("#shoot").focus();
    await page.keyboard.press("Enter");
    check((await observe()).shots === 1, "keyboard release from armed");
    await reset();
    check(
      (await observe()).strength === 2.4,
      "reset preserves strength preference",
    );
    await page.locator("#spin-open").click();
    await checkTargets(
      "#spin button, #spin input",
      "44px contact-sheet controls",
    );
    await page.locator("#contact-y").fill("70");
    check(
      (await observe()).contact.y > 0.6 && (await observe()).shots === 0,
      "spin control is separate",
    );
    await page.locator("#contact-reset").click();
    check(
      (await observe()).contact.x === 0 && (await observe()).contact.y === 0,
      "centre contact reset",
    );
    await page.keyboard.press("Escape");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitGame(
      "reduced motion preference",
      () => touchStudy.observe().reducedMotion,
      {},
      2000,
    );
    check((await observe()).reducedMotion, "reduced motion preference");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await reset();
    await page.screenshot({
      path:
        "output/playwright/touch-study/ready-" +
        page.viewportSize().width +
        ".png",
    });
    check(errors.length === 0, "no browser errors");
    return {
      status: "PASS",
      revision: (await observe()).revision,
      viewport: page.viewportSize(),
      assertions: results.length,
      checks: results,
    };
  } catch (error) {
    const classification = String(error).includes("GAME:")
      ? "game-failure"
      : String(error).includes("UNCERTAIN:")
        ? "uncertain"
        : "harness-failure";
    const path = "output/playwright/touch-study/failure-" + Date.now() + ".png";
    try {
      await page.screenshot({ path, timeout: 2000 });
    } catch {}
    return {
      status: "FAIL",
      classification,
      error: String(error),
      diagnosticScreenshot: path,
      checks: results,
      recent,
      errors,
    };
  }
}
