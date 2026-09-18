# Three practice layouts · #25

Candidate base: `371ad99fa95e0c944c011bedb1032fcef3c3c48f` plus the issue-scoped
layout changes. Browser bundles identify this source as `371ad99…-dirty`;
#27 rechecks the integrated committed source with white placement.

## Behavior and fixtures

Menu offers Straight pots (default), Cut pots and Cushion practice. Changing
layout starts it explicitly; Re-rack restores the selected versioned fixture.
Both reset motion, input, aim, counts and events with a new epoch and preserve
session tuning. Table cleared remains visible after the last ball settles;
only explicit Re-rack/layout selection starts over.

`practice/layouts.mjs` contains frozen version-1 coordinates. The existing
Straight pots coordinates remain unchanged. `scripts/practice/layout-journeys.json`
records a three-shot clear for each setup, with expected object/pocket pairs.
Cut begins with about a 40-degree cut. Cushion begins with a real top-cushion
bank into bottom-middle; a public model test checks the velocity reversal near
the cushion before capture.

## Verification

```sh
node --test scripts/practice/*.test.mjs
python3 scripts/build-design-preview.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory out
python3 scripts/practice/run-browser.py --case layouts --layout straight-pots
```

Repeat the browser case for `cut-pots` and `cushion-practice`, with WebKit at
390×844, 844×390 and 320×568; Chromium (`--browser chrome`) at 412×839.
Each case retains the existing 50-second process, 3.5-second action and 2-second
freshness bounds. Each of its three shots has a 10-second settle bound; the
nominal model journeys settle each shot in less than three seconds.

- Full model/input/tuning/layout suite: **49 tests passed**.
- Each browser case exercises primary pointer pull/release, all three pots,
  truthful visible count, unique events, settled zero velocities, explicit
  clear/re-rack and denied shots after clear.
- Re-rack during aim/motion and layout selection during aim/motion check epoch,
  destination coordinates, reset aim/events/counts and retained nondefault strength.
  Delayed release and old motion cannot leak into the new fixture.
- Targeted ready, armed and cleared screenshots were inspected at portrait,
  landscape and narrow phone sizes. The harness correlates live ball centers
  within 1 CSS pixel and rails/jaws/pockets against shared geometry.
- Reload restores Straight pots and strength 1.8.

Final browser bundles are `layout25-final-webkit-*` and
`layout25-chrome-fractional-*` under
[`output/playwright/practice/`](../../output/playwright/practice/).
The complete final matrix is 12 cases × 69 assertions = **828 assertions**.
These are emulated browser checks, not physical-phone acceptance.

## Review and retained failures

Separate Standards and Spec reviewers inspected the issue diff. Standards
reported no violations or actionable smells. Spec requested missing
layout-selection-during-motion evidence; that case was added and run across
the matrix. No confirmed gameplay defects or scope creep were found.

Two original failed browser runs remain retained. The first selected an
incorrect aiming point near a cushion because the harness required a 60-pixel
initial radius. The corrected search permits reachable shorter radii and fails
instead of silently accepting a badly aligned point. The second applied
WebKit's integer-coordinate workaround to Chromium's fractional geometry; the
workaround now applies only to WebKit. Neither failure was converted into a
pass; the latter retains its original failure and separate health-only recovery.
The corrected cases are independent passing runs. No production aiming or
physics was changed to compensate for harness mistakes.
