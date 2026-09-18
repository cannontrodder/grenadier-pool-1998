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

Publication evidence follows after the hosted revision is verified. #29 remains
open for physical-phone feedback on this version; #10 remains blocked.
