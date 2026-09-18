# Preview verification · P2

Historical P1 evidence for issue #4. Artifacts: foundation D1, boards B1, wireframes W1. This file distinguishes browser evidence from physical-device feedback.


## P2 / S1.4 selected-direction publication · issue #15

- The user-selected Sports Broadcast direction replaces the open-choice homepage. Historical boards and wireframes visibly link to the current mockups and label their old controls as superseded.
- Primary-session WebKit checks: overview, historical comparison and wireframe explorer at 390px, 320px and 844px widths. Fixed document overflow in the historical comparison and landscape explorer at 844px; oversized reference content now scrolls within its own region. Final affected checks passed with cache disabled.
- Primary-session Chrome / Pixel 7 at 412px: those same three entry points load without document overflow.
- Current overview capture: `output/playwright/preview-p2-webkit.png`. The supplied relative room plan was rendered in WebKit and visually inspected in `output/playwright/pub-layout-review.png`.
- An SVG-document-specific Playwright CLI automatic snapshot operation timed out. One bounded retry also failed; no pass was inferred. HTML navigation worked immediately, and explicit SVG navigation with `domcontentloaded` plus a screenshot succeeded. Diagnostic note: `output/playwright/selected-review-harness.txt`.
- The mockups remain static review states. They do not implement shot physics, spin physics, persistence, networking, sound playback, house rules, or a finished venue model.
- Primary-session WebKit selected mockups: 27 scene/orientation combinations (nine states at 390×844, 844×390 and 320×568) kept key overlays and buttons inside the viewport. All review controls measured at least 44px tall at 320px; no document overflow. Landscape spin was visually inspected in `output/playwright/selected-spin-webkit-review.png`. Companion M1 evidence is in `selected/README.md` and `output/playwright/selected/`.
- No physical iPhone Safari result is claimed. #4 and #8 retain that evidence requirement.

## P1 historical environment and scope

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

Issue #4 remains open until its direct iPhone Safari check is complete. Issue #5 is complete: the user explicitly selected Sports Broadcast for gameplay and personas. S1.2 records subsequent fullscreen, single-live-match, spin, knockabout, pub-layout and Betty feedback. The playable touch study remains separate work in #7; these mockups do not implement game physics or persistence.

## Final design review · M1.2 / C1 / A1

User approved the overall mockups and pixel group treatment. Added four individual generated avatar assets and corrected the entrance/toilets/long foyer. Final review and avatar mockup passed WebKit at 390×844, 844×390 and 320×568 with no missing images, horizontal document overflow or JavaScript errors. Captures: `output/playwright/selected/avatars-*-webkit.png` and `output/playwright/final-review-webkit.png`. Four generated portraits were visually inspected individually and in the compact persona screen. Final review is limited to recent changes; no app implementation started. Physical iPhone evidence remains outstanding, separately from this visual sign-off.

Final page also passed Chrome / Pixel 7 at 412px with all images decoded, no missing images and no horizontal overflow. Static verification: 12 HTML files, 116 local links/assets, zero missing targets; JavaScript syntax, SVG XML and whitespace checks pass. Final sign-off is tracked separately in #20; none is inferred.
