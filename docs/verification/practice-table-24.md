# Working practice table · #24

This evidence covers the foundation issue, not completion or physical-device
acceptance of Phase 3. Three layouts, placement UI, integrated review and full-phase
deployment remain #25–#29.

Application revision tested: `f8e4f09ebc8fc2cbc28ba0d7e4318f24b1b5a369`.
The later diagnostic-only change adds build/scenario identity to failure
bundles; its missing/stale self-checks were rerun separately.

| Check | Result |
| --- | --- |
| Pure model + input | 28 tests passed |
| Full model sweep | 26 tests passed, including 1,000 maximum-strength angles |
| WebKit 390×844 | 64 interaction + 40 pot + 18 keyboard assertions passed |
| WebKit 844×390 | 64 interaction + 40 pot + 18 keyboard assertions passed |
| WebKit 320×568 | 64 interaction + 40 pot + 18 keyboard assertions passed |
| Chromium 412×839 | 64 interaction + 40 pot + 18 keyboard assertions passed |
| Chromium native touch | 19 assertions passed |
| Missing/stale observation self-checks | Expected harness failures; original FAIL retained after healthy recovery probes |

That is 507 browser assertions across the four viewports and native input.
Final-run JSON files begin `verify-` under
[`output/playwright/practice/`](../../output/playwright/practice/). They contain
the exact build marker, assertions and screenshot paths. Targeted ready, armed,
moving and pot screenshots were visually inspected. DOM centers correlate with
observations within 1 CSS pixel; mouth/jaw/rail nodes match shared geometry.

## Delivered behavior

`/practice/` provides one fixed four-ball setup, accepted single-finger aim,
squared pull and release, same-finger abort/rearm, adjustable Menu strength,
keyboard shot controls, ball/cushion/jaw contacts, real capture through six
pocket mouths, brief pot feedback and a remaining count. A scratch disables
shooting after settling; Re-rack is the recovery for this foundation. The model
already exposes the legal-placement and clear-state contracts needed by the
dependent tickets.

The [architecture/run guide](../../practice/README.md) documents the public
interface, observation version, coordinate transform and browser clock. The
[physics contract](../../practice/PHYSICS.md) documents geometry, restitution,
damping, collision safeguards, tolerances, settling and failure bounds.

## Repeatable checks

```sh
node --test scripts/practice/*.test.mjs
PRACTICE_SWEEP=1000 node --test scripts/practice/model.test.mjs
python3 scripts/build-design-preview.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory out
```

In another terminal, run bounded browser cases through the installed Playwright
CLI wrapper:

```sh
python3 scripts/practice/run-browser.py --browser webkit --width 390 --height 844 --case interaction
python3 scripts/practice/run-browser.py --browser webkit --width 390 --height 844 --case pot
python3 scripts/practice/run-browser.py --browser webkit --width 390 --height 844 --case keyboard
python3 scripts/practice/run-browser.py --browser chrome --width 412 --height 839 --case native
python3 scripts/practice/run-browser.py --case interaction --fault missing
python3 scripts/practice/run-browser.py --case interaction --fault stale
```

Repeat interaction/pot/keyboard at WebKit 844×390 and 320×568, plus Chromium
412×839. Each case has a 50-second outer deadline, 3.5-second ordinary action
deadline and 2-second freshness deadline. Original failure bundles are retained
before at most one health-only reload probe. Recovery never changes a failed
run to PASS. Missing/stale fault injection affects the harness reader; the
application's observation interface remains frozen and read-only.

## Numerical evidence and fixes

The maximum-strength risk matrix covers head-on, grazing, symmetric and
collinear simultaneous contacts, all four rail directions, and each pocket's
centered entry, positive/negative jaw offset and positive/negative near miss.
Checks examine finite state, ball/rail/jaw clearances, energy, capture order and
settling on each tick. Other public tests cover admission, white replacement,
scratch plus final pot precedence, reset epochs and varied tick batching.

The angle sweep found shallow corner entries that passed through the mouth but
missed a narrower capture gate. Capture now remembers legitimate mouth entry
and uses the plane behind the jaws. A touching chain of three object balls
required a larger, still bounded contact-iteration budget. Regression cases
retain both findings. The 1,000-angle full-strength sweep has no faults or
escapes; the longest settle is 656 ticks (5.47 seconds). A separate maximum
shot remains rolling at tick 600 and settles naturally afterward, proving that
there is no artificial five-second stop. Maximum accepted speed remains 3960.

The complete sweep is a model suite, with a calibrated 90-second total budget
and a 1,200-tick bound for each shot. An earlier whole-sweep 45-second budget
expired without completing all angles; that run was not counted as passing.
Routine tests use 32 angles plus the focused regression fixtures.

## Retained development failures

Original failed runs and screenshots are retained under
[`output/playwright/practice/development/`](../../output/playwright/practice/development/).
They remain failed records. The fixes included the shallow-corner capture
correction above and increasing the accessible numeric/range controls from
40px to 44px. Smaller viewports now reserve room for the header so controls
cannot obscure a pocket.

Harness corrections distinguished armed gesture power from the separate
keyboard power control, accounted for device-pixel rounding in pointer
dispatch, and waited for fresh frames after native touch events. Exact
18.9px/127px equations are asserted in pure input tests; browser probes bracket
the arming boundary and check full saturation beyond it. The native extra-touch
test checks ownership and a single committed shot; it does not claim selective
finger-lift coverage from a CDP command that ends the touch sequence.

## Evidence limits

Browser journeys use visible controls and real pointer/keyboard actions. Native
Chromium touch dispatch checks ownership, extra contacts and cancellation.
Visibility interruption is tested with a synthetic hidden-state event; this
does not claim physical iOS background/resume evidence. Browser emulation does
not substitute for the phone acceptance required by #29.

The focused foundation harness does not claim the complete three-layout clear,
white-placement journey or all diagnostic fault modes from #27. Those depend
on the next gameplay tickets. There are no saved games, match rules, opponents,
spin or network play in this slice.
