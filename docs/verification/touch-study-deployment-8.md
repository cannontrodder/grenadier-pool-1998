# Touch-study deployment · #8 · 18 September 2026

Phone link: **https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/touch-study/**. The existing owner-private audience is unchanged; the owner must sign in on the phone. The final design review remains available at `/selected/final-review.html` (hosted response 200).

Exact deployed application source: **d4f83f24786a089113ffce74a3f4525c6be609d5**, visible T1.1. Site version 5: `appgprj_6aad3e659eb881918044c10dc3336580~appgver_a841ac07c8bc81918a14289e31c41125`. Successful deployment: `appgdep_6aad671046e48191aeafd9df219ba903`, confirmed terminal succeeded by native deployment status. Archive content hash: `sha256:5758710a68f58562750649ab2e3fd5d22d1b61458bafd05ea8769b85839e6a13`. Exact source was pushed to both the retained prototype branch and the Site source repository before saving. Later branch commits contain review/evidence or harness-only changes, not a different deployed app.

## Hosted smoke results

- WebKit / iPhone 13 emulation / 390×844: **30 assertions passed** against source `d4f83f2`. Run `touch-webkit-390-1789749058304481000.json`.
- Chrome / Pixel 7 emulation / 412×839: **30 assertions passed**. Run `touch-chrome-412-1789749058944685000.json`.
- Chromium native browser touch: **9 assertions passed**. Run `touch-chrome-412-1789749074566926000.json`.
- Checks cover exact build/scenario identity, normal aim/pull/release, abort, interruption, timed ownership loss, deterministic scenario reset, menu strength, observation freshness, motion/render correlation, settling, accessibility targets, reduced motion and browser errors.
- Deliberately stale observations fail the two-second freshness bound; deliberately missing observations fail with `HARNESS: missing observation`. Original diagnostics and one bounded reload health result survive. Runs `touch-webkit-390-1789749175709533000.json` and `touch-webkit-390-1789749194038542000.json` contain the intended fault evidence. Neither failure is reported as a successful game run.
- Hosted fault injection now waits for the asynchronous build marker before corrupting observations; this prevents network timing from masquerading as the intended injected failure. The two-line harness-only correction was independently reviewed with no finding. Earlier diagnostic runs are retained and not counted as passing evidence.
- All artifacts live in `output/playwright/touch-study/`, including `hosted-power-menu.png`. The deployed menu screenshot was visually inspected: Gentle start selected, strength 1.8×, alternative controls collapsed, readable close/controls. Local portrait/landscape/narrow checks are in `touch-study-7.md`.
- Authenticated automated smoke used the Site's existing machine-access capability without creating/rotating a credential or changing audience. The normal owner-facing page was also opened in the app and visibly showed T1.1 / d4f83f2. No physical iPhone or Android was tested.

## Feedback received and remaining

The user preferred the nonlinear gentle-tap response and requested stronger full-power shots plus a menu tuning control, while retaining full travel. Those changes are delivered in T1.1 under #23. The feedback was from a local prototype review; physical device/browser identity and explicit final acceptance were not supplied.

Keep #8 open. Ask for the iPhone/iOS identity, preferred strength setting, any accidental releases or failed inward aborts, and portrait/landscape preference. Try both hands, soft taps, full pulls, orbit both ways, return-inward abort, background/return and rotation while holding. Confirm cue/shot visibility and feedback timing. Record the exact T1.1 build with that feedback; silence is not approval. #4 and #20 remain open. #9 planning is not started.

Simulation remains approximate: no potting, spin physics, audio, full match, persistence or networking. This deployment is the bounded touch experiment, not the later production table slice.
