# White placement after a scratch · #26

Implements [#26](https://github.com/cannontrodder/grenadier-pool-1998/issues/26) at
the agreed pure simulation and normal browser-input/read-only observation seams.
The tested source is this issue's application commit; browser build markers use
`371ad99fa95e0c944c011bedb1032fcef3c3c48f-dirty`, the isolated worktree's baseline
plus these changes. Integration review and the final deployed revision belong to
#27–#29.

## Behavior and evidence

After all motion settles, a scratch shows **Place the white** and a legal initial
candidate. A gold ghost previews clear felt; a red ghost and text explain object,
cushion or pocket rejection. A placement contact may move but cannot aim or fire.
Its release places a stationary white; only a fresh contact can take the next
shot. Menu provides labelled numeric X/Y inputs, arrow-key adjustment and a
separate confirmation button. Empty/invalid input cannot be confirmed.

The simulation reserves 0.01 world units of clearance from balls, cushion faces,
jaws and pocket exclusion boundaries. Pure public-interface checks probe both
sides of that tolerance and verify the placed white has zero velocity. Existing
model fixtures also prove waiting for remaining motion, rejecting stale epochs,
and scratch plus final-object capture resolving only to cleared.

| Check | Result |
| --- | --- |
| Full model/input/tuning suite | 46 tests passed |
| WebKit 390×844 | 23 pointer + 15 keyboard + 22 cancellation assertions passed |
| WebKit 844×390 | 23 pointer + 15 keyboard + 22 cancellation assertions passed |
| WebKit 320×568 | 23 pointer + 15 keyboard assertions passed |
| Chromium 412×839 | 23 pointer assertions passed |
| Chromium 412×839 native touch | 11 assertions passed |

Pointer journeys scratch via the accepted pull/release, reject occupied,
cushion and pocket locations, move a legal candidate, place without firing, and
shoot using a fresh gesture. Keyboard journeys reject empty/occupied and
near-boundary positions, adjust with an arrow key, confirm without firing and
then use the separate keyboard shot alternative. The native touch journey
covers primary ownership, an ignored secondary contact, cancellation and a
moving placement contact whose release never fires a shot.

Cancellation cases cover pointercancel, lost capture, blur, page exit,
visibility event, resize, orientation event, Menu, actual viewport rotation and
Re-rack. A delayed release cannot place or shoot; rotation preserves every ball's
world coordinates and reset clears the placement observation with a new epoch.
These event injections are cancellation checks, not physical iOS backgrounding
or physical-phone acceptance.

Preview and placed-white centers agree with observations within 1 CSS pixel.
Targeted portrait/landscape ready-to-place, invalid-pocket and placed-white
screenshots, plus the keyboard menu at 320×568, were visually inspected. JSON bundles include screenshots and exact
assertions under [`output/playwright/practice/`](../../output/playwright/practice/),
with final result filenames beginning `verify26-`. Cancellation runs finish in
the opposite viewport after exercising real rotation; their filename records the
starting viewport, and their result records the ending viewport.

## Reproduce

```sh
node --test scripts/practice/*.test.mjs
node --check practice/app.js
node --check scripts/practice/placement-check.js
python3 -m py_compile scripts/practice/run-browser.py
python3 scripts/build-design-preview.py
python3 -m http.server 8766 --bind 127.0.0.1 --directory out
```

Run each case separately (repeat the first three at 844×390):

```sh
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8766/practice/ --case placement --width 390 --height 844
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8766/practice/ --case placement-keyboard --width 390 --height 844
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8766/practice/ --case placement-cancel --width 390 --height 844
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8766/practice/ --case placement-native --browser chrome --width 412 --height 839
```

The CLI runner keeps its 50-second outer bound, 3.5-second action timeout,
2-second freshness deadline and one health-only reload probe. Settling is bounded
at 10 seconds, with a healthy observation stream required to distinguish a game
failure from uncertainty. Diagnostics retain the original failure, recent 16
actions/observations, build/scenario/epoch identity, errors and a screenshot.
The placement CLI file is standalone, like the existing browser and native
cases; shared diagnostic helper consolidation can be done with #27's broader
harness work. There are no privileged browser position or shot setters.

## Retained red checks

The initial model clearance test failed because a point only 0.005 units from a
cushion was accepted. The initial browser placement test failed at the missing
candidate. A keyboard empty-field test then found `cx="NaN"` being sent to SVG;
the corrected renderer hides nonfinite previews while preserving visible invalid
feedback and disabled confirmation. Original failed browser bundles and screenshots
remain alongside the final passing evidence. No failed run was relabelled as
passing. Physical-phone acceptance remains #29.
