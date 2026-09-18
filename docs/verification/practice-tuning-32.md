# Practice tuning · #32

The friend-feedback menu adds bounded guide length, optional first-contact
marker, pull-triggered aim locking and real pocket size. Defaults and semantics
are in [practice/README.md](../../practice/README.md#friend-feedback-tuning--issue-32).
The power curve and primary-pointer admission/cancellation remain unchanged.
This does not complete the later layout/placement tickets or phone acceptance.

## Automated verification

- Node model/input/tuning suite: 45 tests passed.
- Extended model suite: 3,000 maximum-speed shots across 90%, 110% and 130%
  pockets passed with collision clearance, finite bounds, energy and settling
  checks at every tick. Longest 657 ticks (5.475 seconds). All six mouths tested
  for capture, jaw/rail rejection and widening a previously rejected shot.
- Local WebKit tuning: 43 assertions each at 390×844, 844×390 and 320×568.
- Local Chrome tuning: 43 assertions at 412×839.
- WebKit 390×844 regression: 64 interaction, 18 keyboard, 40 pot assertions.
- WebKit 844×390: 40 pot assertions. Chrome 412×839: 19 native-touch assertions.
- Total successful local browser assertions: 353. Tests drive ordinary DOM
  controls and pointer/touch input; the observation interface remains read-only.
- Targeted screenshots inspected for the menu, locked guide and default table.
  SVG rails, jaws, bowls and mouths match physical geometry at both size limits.
- Public build allowlist includes the two new modules: 11 total output files.

Evidence JSON starts `tune-` in [output/playwright/practice](../../output/playwright/practice/).
The extended model TAP is `tuning-pocket-3000.tap`; the integrated suite is
`tuning-unit-tests.tap`. Browser sessions have 50-second outer deadlines and
bounded per-action/observation waits, with original failures retained.

## Review and corrected failures

Independent review found that a white touching a cushion got a zero-length
preview even when aimed away. Restricting ray intersections to approaching
cushion faces fixes this; tests cover away/toward at all four cushions.

The first tuning harness run incorrectly used a screen direction identical to
the previous shot after portrait rotation. The re-aim assertion now uses the
screen-space perpendicular. The original failed JSON/screenshot is retained.

The original corner-pot gesture assumed subpixel pointer precision over a short
18-pixel radius. WebKit rounds mouse input to integer screen pixels, and the new
lock faithfully retained that imprecise direction. The pot journey now chooses
a reachable integer-pixel aiming point 60–110 pixels from the white, using only
observed geometry, then pulls and releases normally. It preserves an accurate
initial direction and tests the lock during a real corner pot. No game state is
injected; the old failed corner run remains in evidence. Ordinary short-radius
gestures continue to pass the interaction, tuning and native-touch suites.

## Deployment

Publication uses the existing GitHub Pages workflow after merge to main.
Hosted verification and the deployed revision are recorded below after publish.
