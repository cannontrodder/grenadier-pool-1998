# Wide-radius aiming and second-touch hold · #33

The owner praised the deployed practice loop but requested a correction to aim
locking. The #32 outward-pull lock prevented precise rotation at a wider radius.
#33 replaces it with near-white protection and a momentary second-touch hold.
This records a requested correction under #29, not unconditional phone acceptance.
No device/browser metadata was supplied.

## Behavior and review

Outside the fixed precision circle, the original pointer can re-aim at any power.
Inside, it retains the last angle; starting inside inherits the displayed aim.
The circle defaults to 60 CSS pixels, adjustable 20–100, and can be disabled.
A second touch holds angle independently of that setting. The original finger
still changes power and releases the shot. Lifting the second restores free aim
outside the circle. A third contact cannot steal the hold; releasing the original
ends both captures and cannot hand off a shot. Cancellation/reset clears both.

Independent Standards and Spec reviewers found no material findings in
`3c74b80...2e7b399941ce24df715bc122482a445efb087a95`. Their review covered capture
reentrancy, sole shot ownership, lifecycle cleanup, fixed CSS-radius rendering,
placement isolation and the accepted behavior amendment. The pure gesture API
and normal browser input/read-only observation remain the agreed testing seams.

## Verification

Red/green tests first reproduced outward locking and missing second-touch hold.
All 52 model/input tests then passed. Red records and the final TAP are retained
under `output/playwright/practice/aim33-*.tap`.

WebKit 390×844 and 844×390 tuning checks passed 48 assertions each, including free
wide aiming, protected gentle shots, circle/abort-ring geometry, inner abort,
outer re-aim, disabled protection and unchanged defaults/reset semantics.
Portrait side/corner pots passed 40, white placement 23, and landscape interaction
and lifecycle cancellation 64. Targeted menu/near-protected screenshots were
inspected; the visible circle matches the observed 60 CSS-pixel radius.

## Retained diagnostic corrections

Three initial launches failed because the prior local HTTP server was no longer
running. They stopped as harness failures. A fresh server was checked before
replacement runs; original records remain retained.

The first native run sent `touchEnd [primary]` while intending to lift the second
contact. An independent pointer-event probe proved CDP's array identifies released
contacts, not remaining contacts. The resulting primary shot was legitimate;
the failure was in the test action. The original failed assertion remains
retained and is not counted as a passing test.

A cut-layout journey also exposed that the old precise pointer fixture selected
an accurate initial angle and relied on the removed outward lock to preserve it.
With free aiming, WebKit's rounded release coordinates matter. Its original
failed attempt is retained separately from corrected normal-input verification.


The corrected native suite passed 37 assertions on Chromium 412×839: wide aiming,
second-finger angle hold while changing power, second-only lift, both release
orders, ignored third contact, remaining-touch isolation, near-setting independence,
whole-sequence cancellation, Menu and Re-rack cancellation. The explicit DOM
capture-loss probe initially released pending capture before it had been
established; establishing capture first corrected the probe. Both failed probes
remain recorded. The passing record is
`aim33-native-capture-fixed-412x839-1789770442970216000.json`.

A separate Standards review of `2e7b399...1797b54` found no material harness
findings. CDP touch events are ordinary browser input; the labeled capture-loss
probe changes only DOM capture, not simulation state. All actions and observation
waits retain their declared bounds and durable journals.

The precise WebKit fixture now chooses integer release coordinates and a
reachable initial contact radius that supplies the requested power travel.
It uses ordinary mouse input and rejects a fixture before release if angle error
exceeds 0.002rad or power error exceeds 0.004. Three final layout runs passed 70
assertions each; index: `aim33-layout-release-summary.json`. Final successful
local coverage is nine cases / 470 assertions, excluding superseded attempts.
The runtime remains `2e7b399`; later commits change harness/evidence only.

The final endpoint fixture (`1797b54...26def42`) also received independent
Standards approval with zero findings: search bounds are finite, observations
remain read-only, and executed input is checked before release. The compact
final nine-case index is `aim33-final-index.json`.

## Publication

Published source: `9b60834be40a7686be80ae8b2717773f2c61617f`.
[Deployment workflow](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35401924110).
The runtime matches the independently reviewed/tested `2e7b399`; later changes
are harness, documentation and evidence. The established public link is
https://cannontrodder.github.io/grenadier-pool-1998/.

Momentary hold was the stated default for the optional clarification; no toggle
preference was supplied. #29 remains open for hands-on acceptance of this revised
feel. The owner’s previous positive response included this correction, so it
was not treated as unconditional phase acceptance.


Publication succeeded; CI passed all 52 tests. Hosted verification on exact
`9b60834` passed **155 assertions**: tuning 48, native multi-touch 37 and Cut pots
clear/re-rack 70. All 11 application resources match the public build bytes.
Evidence: `hosted33-*-summary.json`, linked journals/screenshots,
`hosted33-http.json` and `hosted33-deployment.json`. This closes implementation
issue #33; the phone-feedback gate remains #29.
