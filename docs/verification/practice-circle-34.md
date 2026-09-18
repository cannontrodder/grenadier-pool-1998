# Optional precision locking circle · #34

The owner requested that the locking circle start completely off: entering it
puts the cue tip too close to the white for their preferred feel. Radius tuning
can be revisited later. This is a correction under #29, not final phone acceptance.

Fresh loads and Restore defaults now disable near-white angle protection and
hide the precision circle. Menu → Aiming help → Precision locking circle can
enable it; its existing 20–100 CSS-pixel radius remains disabled while off.
Second-finger angle hold remains available independently. The separate dashed
abort indicator and existing power/release behavior remain unchanged.

## Verification and review

- `node --test scripts/practice/*.test.mjs`: 52 passed.
- `python3 scripts/build-practice-preview.py`: built successfully.
- Existing bounded Playwright tuning journeys: WebKit 390×844 and 844×390,
  53 assertions each. Fresh near-white free aiming, hidden precision circle,
  inward abort, explicit opt-in, radius availability, Restore defaults and
  reload are covered, alongside existing guide/pocket/geometry checks.
- Chromium native touch at 412×839: 37 assertions, including independent
  second-finger hold/release and capture lifecycle behavior with the circle off.
- Total local browser coverage: 143 assertions, all passed first attempt.
  [Compact index](../../output/playwright/practice/circle34-local-summary.json)
  links full records, journals and screenshots. Menu and default aiming
  screenshots were inspected: unchecked option, disabled radius, no precision
  ring during aiming, and legible controls.
- Independent focused review found no material findings in runtime or harness
  changes. `git diff --check` passed.

## Publication

Published revision: `82a789f1ce31ff471da0cedb70dcd6a476b20ffc`.
[Successful deployment](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35403020231).
[Live table](https://cannontrodder.github.io/grenadier-pool-1998/).
CI passed all 52 tests. Hosted WebKit tuning passed 53 assertions and Chromium
native touch passed 37 on that exact revision: 90 hosted assertions total.
All 11 public application resources match the local build bytes, recorded in
`output/playwright/practice/hosted34-http.json`. The compact hosted index is
`output/playwright/practice/hosted34-summary.json`.
An initial ad hoc curl probe used the wrong marker filename and returned a
transport error; it is not counted as verification. The completed byte checks
use the correct `revision.json`, alongside browser-reported revision identity.

#34 is complete. #29 remains open for physical-phone feedback on this version.
The owner subsequently explicitly requested that #10 planning start in a forked
chat after this change reaches main, asking the agent to propose relaxed house
rules for old mates with “two shots” as the remembered convention. Planning may
therefore proceed under that new instruction; no phone acceptance is inferred.
