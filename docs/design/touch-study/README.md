# PROTOTYPE · T1.1 touch study · issue #7

Question: can one captured finger orbit the cue, pull away for power, return inward to abort, and release reliably on a phone? This is the logic/state branch of the prototype workflow in a browser because the unresolved question is touch, not terminal behavior. Governing design: S1.4 / M1.2. The existing selected storyboard, tokens and final-review page remain the visual references; no new direction exercise is introduced.

## Run

From this branch's root: `python3 scripts/build-design-preview.py && python3 -m http.server 8127 --bind 127.0.0.1 --directory out`. Open `http://127.0.0.1:8127/touch-study/`. The build embeds the full source HEAD in `revision.json`; use a clean committed checkout for evidence or publication. No app dependencies or install step.

## Play and compare

Touch the felt behind the cue ball. Orbit around it with the same finger, pull farther to arm, then lift. To abort, move inward into the gold neutral ring and lift; “NOT ARMED” confirms it. Touch can start anywhere on the felt; initial distance becomes the neutral baseline. Returning to neutral may be followed by rearming before release. Lift from neutral aborts. A single tap never shoots.

Menu offers **A · Linear pull** and **B · Gentle start**. Both have the same physical arming threshold (18.9 CSS px past the starting radius); B squares the normalized pull for finer low power. Saturation is 127 px past the start. These are hypotheses, not accepted controls. No velocity-based mapping is implied. Following hands-on feedback in #23, Gentle start is the default. **Shot strength** ranges from 0.5× to 3× (default 1.8×), affects impulse rather than pull travel, and stays in memory across Reset. Speed is `60 + 1300 × power × strength`: a barely armed default tap is about 68 world units/s; full pull is 2400, versus 1080 in the initial prototype. Maximum setting reaches 3960. These values remain tunable hypotheses.

Contact opens a separate selector; use the pad or keyboard sliders, and Reset to centre. Menu’s expandable Button / keyboard alternative offers angle/power sliders, Arm shot, Play shot and Abort. Arrows change angle, Shift+arrows change power, Escape aborts. Enter activates the focused control; Play shot must be explicitly armed.

“Lose turn in 3 seconds” closes the sheet and lets you start a gesture before the simulated interruption. Restore the turn from Menu, or Reset. Pointer cancellation, capture loss, blur, backgrounding, page exit and viewport/orientation change disarm; delayed release cannot shoot.

## Observation/action contract

Read-only `window.touchStudy.observe()` returns T1.1 version/full revision, deterministic scenario, animation frame and sample timestamp, phase (`ready`, `aiming`, `armed`, `rolling`), captured gesture, angle in radians, normalized power, mapping, strength, contact point, readiness, turn ownership, shot count, last feedback, recent input events and each ball's world coordinates/velocities. Units: world table 1000×500, velocities world units/second. Portrait rotates that same world 90 degrees. `geometry()` returns cue/viewport screen coordinates; `health()` returns frame, revision/scenario and visibility.

Actions use ordinary DOM controls, Pointer Events or native browser touch; there is no privileged “shoot” test setter. Observation data and SVG attributes are sampled in the same browser task for correlation. Routine checks use compact assertions; targeted captures confirm the actual composition and motion checkpoints.

## Verification and harness safety

- `node --test scripts/touch-study/model.test.mjs`
- Open a named Playwright CLI session with the installed Playwright skill wrapper, e.g. `playwright_cli.sh -s=touch-webkit open http://127.0.0.1:8127/touch-study/ --browser webkit --device 'iPhone 13'`.
- `python3 scripts/touch-study/run-browser.py --session touch-webkit --width 390 --height 844`; also 844×390 and 320×568.
- On Chrome/Pixel 7, run the same harness, then `playwright_cli.sh -s=touch-chrome run-code --filename scripts/touch-study/native-touch.js` for native browser touch.
- Fault self-checks: `run-browser.py --fault stale` and `--fault missing` must stop as harness failures and retain the original diagnostic JSON/screenshot before one reload health check. Recovery never upgrades the failed run into a pass.

The runner bounds CLI processes to 50 seconds, actions to 3.5 seconds, observation freshness to 2 seconds and settling to 7 seconds. Original failures retain the last 16 observations/actions, error, scenario/revision, completed checks, and a targeted screenshot under `output/playwright/touch-study/`. A command/session failure retains output and is a harness failure; violated observed behavior is a game failure. A missed game deadline is a game failure only when a second health/freshness check proves observations are still advancing; otherwise it is explicitly uncertain. Actual touch/browser evidence must be distinguished from synthetic interruption-event coverage and physical iPhone evidence.

## Fidelity and review boundary

Two circles, fixed-step rolling with travel-bounded contact substeps, exponential drag, simple equal-mass contact and cushion reflection; deterministic reset. Six correctly located pocket mouths are visual only. No potting, spin physics, sound, AI, persistence, rules, multiplayer, full match, 2v2, knockabout or 3D room. The contact selector records intent only. Reduced motion removes overlay transitions; motion of the balls remains the subject of the test. No camera animation. No final persona imagery is needed for this isolated gesture task; the linked design review retains it.

This prototype stays on `prototype/touch-study-7`; #8 retains physical Safari review and explicit user acceptance. Do not infer a winning mapping or orientation from automated checks. #9 owns the next production slice.

## Focused phone review

Open the private link in Safari while signed into the owning account. Record the build, iPhone model and iOS/Safari version. In portrait, take three gentle and three hard shots with each mapping, orbit both ways, and try aborting near both rails with the same finger. Try accidental taps, background/return and rotate while holding. Repeat in landscape and with the other hand. Report: which curve feels easier; any accidental shot or failed abort; which orientation/grip keeps the cue, line and feedback visible. Technical success is not acceptance.

Reset restores the deterministic ball scenario, angle, contact and input state, while preserving the chosen mapping and strength as review preferences. Reload resets those preferences.
