# Browser verification · W1

The captures in [`output/playwright/wireframes/`](../../../../output/playwright/wireframes/) verify layout at the two W1 reference viewports. They are browser automation evidence, not physical-device findings.

| Capture | Viewport | Check |
| --- | --- | --- |
| [`portrait-g03-390x844.png`](../../../../output/playwright/wireframes/portrait-g03-390x844.png) | 390 × 844 | Table visible; power, cancel, and explicit commit fit above bottom safe area. |
| [`landscape-g03-844x390.png`](../../../../output/playwright/wireframes/landscape-g03-844x390.png) | 844 × 390 | Table and 224px control rail fit side by side; side safe areas remain reserved. |
| [`portrait-x02-390x844.png`](../../../../output/playwright/wireframes/portrait-x02-390x844.png) | 390 × 844 | Save failure explains reload risk and retains Retry, Continue, and Pause actions. |
| [`landscape-m04-844x390.png`](../../../../output/playwright/wireframes/landscape-m04-844x390.png) | 844 × 390 | Reconnect surface exposes bounded retry and leave-with-recovery actions. |

## Automated browser review

Run on 18 September 2026 with the named Playwright CLI session `wireframes`:

- Rendered all 26 selector views at 390 × 844 and 844 × 390: **52/52 expected state IDs, zero viewport overflow failures, zero missing-action failures**.
- Exercised the in-phone primary controls: **E01 → O01 → O02 → G01 → G02 → G03 → G04**.
- Exercised the protected destructive route: **R01 → R03·V → Cancel → R03**.
- Aborted `app.js` deliberately and confirmed that the static fallback exposed state coverage, flow map, and Design preview links.
- Normal page loads and state sweeps produced **zero browser console errors or warnings**. The deliberate script-abort check produced the expected failed-resource error and was then removed.
- `node --check docs/design/wireframes/app.js` and `git diff --check` passed.

WebKit/iPhone and Chrome/Android emulation can support later preview integration; neither substitutes for a physical-phone review.
