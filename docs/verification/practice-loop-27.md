# Integrated practice loop · #27

The full practice runtime is verified at
`aa9781ec9c248ba7c1c8b43125c93c344a31eb54`. Later commits in this issue change
harness code and retain evidence only; the runtime is byte-for-byte unchanged.
This completes automated phase checks, not physical-phone acceptance.

## Acceptance evidence

| Checks | Evidence |
| --- | --- |
| A1 / A5 | Three normal primary-pointer shots clear each named layout. Truthful counts, exactly-once events, settled continuation, clear lockout and explicit selected-layout re-rack pass at all four viewports. Reset/layout selection during aim and motion preserve tuning, restore exact coordinates, clear aim/events and invalidate delayed releases. |
| A2 | Browser soft/arm/full/abort/rearm probes at 0.5×, 1.8× and 3×; native Chromium contact ownership/cancellation; full-circle aiming, menu/settings and lifecycle interruptions. Pure input checks retain exact 18.9px arming and 127px saturation with squared power. |
| A3 / A4 | Maximum-speed head-on, grazing, simultaneous/multi-ball, four rails, jaws and six-pocket entry/near-miss matrices. Finite state, collision clearance and energy checks. 1,000 maximum-strength angles passed without faults or escapes; longest settle 656 ticks / 5.467s. Normal model suite also covers pocket sizes 0.9, 1.1 and 1.3. |
| A5 / A6 | All live velocities reach zero before readiness/placement/clear. Model scratch plus last-object pot resolves to clear; placement/shot admission and stale epochs reject invalid commands. Ordinary pointer scratch → invalid/legal placement → fresh shot, separate keyboard entry/confirm/shot, and native placement drag/cancel pass. |
| A7 | WebKit 390×844, 844×390, 320×568 and Chromium 412×839. Placement reset/layout selection and actual viewport rotation preserve world state and cancel stale contacts. Inspected ready/armed/moving/pot/placement/cleared and jaw approach/rebound screenshots. Atomic DOM/observation comparisons keep ball-center error ≤1 CSS px and check matching rail/jaw/pocket geometry. |
| A8 | Identical public-model shots with reordered storage and varied tick batching yield identical final snapshots/events. Browser normal versus alternate-frame rendering replays the same keyboard shot to identical balls, events and final tick. Missing/stale observer, action timeout, stalled progress and disconnect all stop with original failure evidence. |

Commands:

```sh
node --test scripts/practice/*.test.mjs
PRACTICE_SWEEP=1000 nice -n 15 node --test scripts/practice/model.test.mjs
python3 scripts/build-design-preview.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory out
python3 scripts/practice/run-browser.py --case interaction
python3 scripts/practice/run-browser.py --case pot
python3 scripts/practice/run-browser.py --case keyboard
python3 scripts/practice/run-browser.py --case tuning
python3 scripts/practice/run-browser.py --case layouts --layout straight-pots
python3 scripts/practice/run-browser.py --case placement
python3 scripts/practice/run-browser.py --case placement-keyboard
python3 scripts/practice/run-browser.py --case placement-cancel
python3 scripts/practice/run-browser.py --case motion
python3 scripts/practice/run-browser.py --browser chrome --case native
python3 scripts/practice/run-browser.py --browser chrome --case placement-native
```

Repeat the layout case for `cut-pots` and `cushion-practice`. Use `--width`,
`--height` and `--browser` for the matrix above. Every case has a 50-second outer
bound; routine actions have 3.5 seconds, observer reads/freshness 2 seconds,
normal progress 5 seconds and shot settling at most 10 seconds. The model's
28-second safety fault is never used to pretend a shot settled. The broad sweep
retains its 90-second process-local bound and 1,200-tick per-shot check.

## Results and retained records

Final evidence is under [`output/playwright/practice/`](../../output/playwright/practice/),
with prefixes `final27-` (including `final27-fixed-` after the correlation fix).
`final27-unit.tap` records **50/50 passing tests** at the integrated revision.
`integrated27-broad-model.tap` records **36/36 tests** including the completed
1,000-angle sweep on identical model/input sources. The earlier full integrated
browser matrix (`integrated27-*`) records 1,507 assertions before the selector
and diagnostic-journal improvements; it is retained separately.

The [fault report](practice-harness-faults-27.md) documents the five injections.
Final repetitions `final27-fault-*` use the exact integrated build and detect all
five failures in 4.1–7.5 seconds. A normal placement run was also externally
closed without injecting a fault flag; its original failure, real identity,
actions, observations and initial screenshot survived. Recovery cannot turn a
failed run into a pass. Scripts journal to a runner-owned, bounded loopback sink;
this does not change the game or its read-only browser observation interface.

## Regressions found and resolved

- WebKit's native select ignored the intended 44px height. The layout selector
  now uses consistent styling, an explicit dropdown indicator and inherited font.
  A direct target-size assertion first failed, then passed; the menu screenshot
  was inspected. No shot behavior changed.
- Awaiting the new durable journal allowed a rendering frame between an earlier
  observation and the later SVG comparison. A landscape pot run reported a
  5.1px moving-ball discrepancy while all static geometry matched. The check now
  captures the current observation and SVG atomically and verifies its epoch and
  frame against the earlier sample. The original failure is retained; the
  affected pot case passed with the corrected comparison. Physics was unchanged.

## Limits

Chromium native touch is CDP-dispatched browser touch, not a physical phone.
Background/resume uses a synthetic hidden-document lifecycle event to verify
pause and no catch-up; headless tab activation did not expose a real hidden
state and is not claimed as OS/iOS lifecycle evidence. The owner still needs to
try the deployed build on a physical phone in #29.

The exact model `shot-did-not-settle` safety branch at 3,360 ticks is inspected
rather than forced through a nonphysical test hook; bounded valid shots settle
much sooner. Invalid-state fault/freeze/recovery and externally stalled browser
progress are tested. Numeric repeatability is not a claim of cross-platform
bitwise equality; `practice/PHYSICS.md` retains the declared tolerances.

## Final matrix totals

- **29 normal cases / 1,519 assertions:** interaction, pot, keyboard, tuning and
  all three clears at each of the four required viewport/browser combinations,
  plus Chromium native touch. This includes the independently recorded atomic
  geometry replacement run; the original failed attempt remains failed.
- **17 placement/motion cases / 327 assertions:** pointer placement, keyboard
  placement, cancellation/layout-reset and jaw motion at all four combinations,
  plus native placement. **Two additional cadence replays / 50 assertions**
  cover WebKit and Chromium. Total final successful browser assertions: **1,896**.
- All report `aa9781ec9c248ba7c1c8b43125c93c344a31eb54`; subsequent changes are
  test harness/evidence only. All normal-matrix journals were checked for build
  identity, recent actions/observations and existing initial screenshots.
- All five expected fault outcomes and an unexpected normal-placement disconnect
  retained original FAIL records. Final node suite: 50/50. Broad pure-model
  suite: 36/36, including 1,000 maximum-strength angles.

Machine-readable indexes: `final27-matrix-index.json`,
`final27-placement-motion-index.json` and `final27-faults-index.json` in the
same evidence directory. No physical-phone result is inferred from these runs.
