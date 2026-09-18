# Preview verification · P1

Issue #4. Artifacts: foundation D1, boards B1, wireframes W1. This file distinguishes browser evidence from physical-device feedback.

## Environment and scope

- WebKit 26.6 through Playwright CLI, using the iPhone 13 emulation profile. Initial effective viewport 390 × 664 CSS pixels; also check narrow 320px and landscape 844 × 390 compositions.
- Chrome using the Pixel 7 emulation profile, 412 × 839 CSS pixels.
- Local HTTP server serves exactly `docs/design/`, the source directory copied unchanged into the configured `out/` publication directory. No external runtime assets are required.
- No connected physical iPhone was tested. `xcrun simctl` is unavailable, so there is no iOS Simulator result either. WebKit emulation is not physical iPhone Safari evidence.

## Evidence recorded so far

- Preview overview renders at 390px, 412px, and 320px widths without document-level horizontal overflow.
- Overview screenshots: `output/playwright/preview-iphone-webkit.png` and `output/playwright/preview-android-chrome.png` in the repository. The iPhone-sized screenshot was visually inspected.
- Chrome's initial missing-favicon request was fixed by adding a local SVG icon. No third-party image or font requests are required.

## Integrated visual boards

- B1 integrated from issue #2 in commit `062a725`.
- All five board HTML pages loaded successfully in WebKit at 390px with no document overflow and no broken images. HTTP 304 responses were valid local cache revalidation, not failures.
- The board agent checked each direction at 390px and 320px in Chromium, with no document overflow, and captured the 1440px comparison. See `output/playwright/boards/` in the repository.
- Primary-session visual review identified and corrected long-heading clipping and incorrect portrait-table side-pocket placement before acceptance. `output/playwright/board-pub-webkit.png` confirms the integrated gameplay view and correct long-side midpoint pockets.
- Table geometry is an illustrative visual study; no ball motion, rules, physics, or shot accuracy is claimed.

## Integrated wireframes and navigation

- W1 integrated in `602674e`, with a 44px update-action correction in `d14d3fa`.
- All 23 D1 stable state IDs plus three mapped variants are represented: 26 views in each of two layouts. The wireframe agent completed 52/52 rendered-state checks, tested script-failure fallback, and saved four captures under `output/playwright/wireframes/`.
- Primary-session WebKit checks exercised E01 → O01 → O02 → G01 → G02 → G03 → G04 through the visible controls, then the G05 → G01 feedback action. G04 is a deliberately static motion diagram, so the state selector advances to G05; this is not a simulated shot.
- Recovery checks passed R01 → R03·V discard confirmation → cancel → R03 and X02 → retry → U02. Both preserve the distinction between a design transition and implemented save behavior.
- WebKit at 844 × 390 confirmed the update button is 44px tall and the status band ends above the table (no overlap). Capture: `output/playwright/wireframe-update-webkit.png`.
- Chrome/Pixel 7 at 412 × 839 loaded the overview, board index, comparison, and wireframe explorer without document-level horizontal overflow. The landscape reference remains 844px wide inside a clearly labeled horizontal scroll region; controls are not scaled down.
- Static link check: **8 HTML files, 61 local href/src references, zero missing files**. Reference attribution links are external and do not load as runtime assets. The comparison uses local iframes; each board is also directly accessible.
- The accessible 404 page provides a route back to the overview. The root preview requires no JavaScript; the wireframe explorer includes static fallback content and document links.
- Source checks: `git diff --check` and the wireframe agent's `node --check` passed.

## Publication record

Hosting: owner-private Sites. The issue [#4 handoff](https://github.com/cannontrodder/grenadier-pool-1998/issues/4) records the exact published source commit, successful deployment identity, and returned URL after the native deployment reaches terminal success. Artifact revision: P1 / D1 / B1 / W1. See [deployment.md](deployment.md) for reproduction and redeployment.

All checks above used the local HTTP preview of the published static source. Hosted authentication and physical iPhone Safari interaction have not been manually tested.

## Remaining device review

Open the deployed preview in Safari on a physical iPhone while signed into the owning account. Inspect boards, compare both wireframe orientations, check browser chrome and safe areas, zoom text, and judge thumb reach and table legibility. Record the model, iOS/Safari version, viewport/orientation, exact preview revision, screenshots where useful, and the user's actual observations.

Issue #4 remains open until its direct iPhone Safari check is complete. Issue #5 requires the user's explicit direction/persona/layout feedback; no selection or approval has been inferred. Final mockups and the touch study remain downstream of that decision.
