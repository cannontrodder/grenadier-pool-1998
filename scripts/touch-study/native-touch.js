async (page) => {
  const cdp = await page.context().newCDPSession(page),
    checks = [],
    recent = [];
  const check = (ok, name) => {
    if (!ok) throw new Error("GAME: " + name);
    checks.push(name);
  };
  const observe = async () => {
    const o = await page.evaluate(() => touchStudy.observe());
    recent.push(o);
    if (recent.length > 12) recent.shift();
    return o;
  };
  const touch = async (type, p) => {
    const frame = (await observe()).frame;
    await cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: p ? [{ x: p.x, y: p.y, id: 0, radiusX: 9, radiusY: 9 }] : [],
    });
    await page.waitForFunction(f => touchStudy.observe().frame > f + 2, frame, {timeout: 2000});
  };
  try {
    await page.locator("#reset").click();
    const c = (await page.evaluate(() => touchStudy.geometry())).cue;
    await touch("touchStart", { x: c.x, y: c.y - 40 });
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2]) {
      const p = { x: c.x + 40 * Math.cos(a), y: c.y + 40 * Math.sin(a) };
      await touch("touchMove", p);
      check(
        (await observe()).phase === "aiming",
        "orbit remains unarmed " + a.toFixed(2),
      );
    }
    await touch("touchMove", { x: c.x, y: c.y - 135 });
    check((await observe()).phase === "armed", "native touch arms");
    await touch("touchEnd");
    check((await observe()).shots === 1, "native touch release");
    await page.locator("#reset").click();
    await touch("touchStart", { x: c.x, y: c.y - 40 });
    await touch("touchMove", { x: c.x, y: c.y - 135 });
    await touch("touchMove", { x: c.x, y: c.y - 40 });
    await touch("touchEnd");
    check((await observe()).shots === 0, "native same-finger abort");
    await touch("touchStart", { x: c.x, y: c.y - 40 });
    await touch("touchMove", { x: c.x, y: c.y - 135 });
    await touch("touchCancel");
    check(
      (await observe()).shots === 0 && !(await observe()).gesture,
      "native touchcancel",
    );
    await page.locator("#reset").click();
    return {
      status: "PASS",
      input: "Chromium native CDP touch events",
      checks,
      revision: (await observe()).revision,
    };
  } catch (e) {
    const path =
      "output/playwright/touch-study/native-failure-" + Date.now() + ".png";
    await page.screenshot({ path });
    return { status: "FAIL", classification: String(e).includes("GAME:")?"game-failure":"harness-failure", error: String(e), recent, checks, path };
  } finally {
    await cdp.detach();
  }
}
