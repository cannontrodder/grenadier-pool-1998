# Practice simulation — issue #24

`model.mjs` is a DOM-free four-circle simulation. `geometry.mjs` is the shared world description used by both model and SVG. The browser owns its clock, visibility pause, input and strength setting; the model owns contacts, admission, capture and post-settle precedence.

Run the public behavior checks with:

```sh
node --test scripts/practice/model.test.mjs
# Full deterministic angle sweep (maximum 1000 cases, 1200 ticks/case, 90s total sweep deadline):
PRACTICE_SWEEP=1000 node --test scripts/practice/model.test.mjs
```

## Interface and state

`createPractice({ scenario } = {})` returns `snapshot`, `shoot`, `step`, `resetScenario`, `placementValidity` and `placeWhite`. A scenario has `{ id, version, balls }`; ball fixtures have stable string IDs, role `cue` or `object`, and coordinates. The public model interface accepts explicit fixture velocities and potted state for model tests. The browser must never expose that fixture/command seam as an automation setter.

- `snapshot()` returns a recursively frozen copy, including scenario ID/version, reset epoch, fixed tick, revision, phase, shot ID, ball state, ordered events, count, remaining and fault. An event carries sequence, epoch, tick, shot ID, type (`pot` or `scratch`), ball ID and pocket ID. Potted balls have zero velocity and retain their capture coordinates/pocket.
- `shoot({ angle, power, strength = 1.8, epoch })` accepts radians, power `[0,1]` and strength `[0.5,3]`. It returns a boolean. Only `ready` admits shooting. The speed is exactly `60 + 1300 × power × strength`: full default 2400, full maximum 3960 world units/s. The browser computes squared pull; the model must not square power again.
- `step(ticks = 1)` advances whole 1/120-second ticks only while rolling and returns a snapshot. One call accepts at most 3360 ticks. Chunking those same ticks differently produces identical results. Idle simulation ticks stay fixed; browser observation/frame freshness must advance independently.
- `resetScenario(scenario)` validates/copies and selects a fixture, increments epoch, cancels motion and clears shot/event/count state. Omission restores the selected fixture. Strength lives in the browser and is unaffected. Stale explicit epochs are rejected by shooting and placement. Commands without an epoch apply to the current scenario, so asynchronous browser input must retain/check its starting epoch.
- `placementValidity({ x, y })` returns `{ valid, reason }` independently of phase for previews. `placeWhite({ x, y, epoch })` additionally requires `placing-white`. Legal placement keeps the white at least one radius inside the rectangular felt, outside mouth/jaw clearance and at least 0.01 units clear of object balls. The pointer-consumption/fresh-gesture rule belongs to the browser.

After sustained settling the only precedence is: no objects remaining → `cleared`; otherwise white potted → `placing-white`; otherwise → `ready`. Capture during motion leaves phase `rolling`. Reset is the foundation UI's scratch recovery; later placement UI consumes the existing placement contract.

The default `straight-pots` version 1 fixture is white `(500,320)`, object-1 `(500,180)`, object-2 `(220,140.8)`, object-3 `(790,355)`. Independently from reset, a side pot uses angle `-π/2`, power `.16`, strength `1.8`; a top-left corner pot uses angle `atan2(-320,-500)`, power `.25`, strength `1.8`. These correspond to pull fractions `.4` and `.5`. Object-1/2 pot through normal ball contact and the white remains available after settling. Three selectable layouts belong to #25.

## Shared geometry and real capture

The felt is 1000×500, every ball radius is 12. Rail segments are mathematical contact surfaces at x=0/1000 and y=0/500. Visible cushion thickness must extend outward from those surfaces. Corner openings end rails 42 units from each corner; side openings span x=466 through 534. Each segment endpoint has an explicit radius-6 circular jaw. A ball therefore clears a jaw only when its center stays at least 18 units away. Rail lines include endpoint distance; the larger jaw controls the final mouth shape.

`TABLE.pockets` supplies drawable bowl center/radius and `mouth: { x, y, nx, ny, tx, ty, halfWidth }`, with normal pointing into the pocket and tangent along its mouth. Corner mouths join `(0,42)` to `(42,0)` and their mirrored equivalents; side mouths lie on the cushion surface. The capture plane is 20 units behind corner mouths and 14 behind side mouths.

A ball must cross the mouth plane through its aperture, then cross its capture plane. Merely touching a dark bowl is insufficient. Mouth entry is forgotten on return to felt. Capture planes extend behind the jaws: an artificial narrow lateral capture gate would let legitimate shallow cuts escape outside the table. The model resolves jaw contacts before assessing mouth entry/capture. Capture removes the ball from subsequent collision work and emits one event. The bowl circle is artwork; mouth, jaws and capture plane define behavior.

## Solver bounds and numerical contract

The solver uses adaptive substeps. Each tick's speed bound is `sqrt(sum(vx² + vy²))` over all live balls. Since contacts and damping cannot add energy, this bounds any individual speed for the entire tick, including transfers to previously slower balls. Dividing by the 0.75-unit maximum travel gives 44 substeps at a full 3960 shot. Relative travel is at most 1.5 units, small beside the 24-unit ball diameter and 18-unit expanded jaw radius. Four maximum-speed explicit test-fixture balls use at most 88 substeps; 96 is the hard budget. The accepted impulse is never reduced to satisfy it.

Contacts use canonical stable IDs. A projected normal-impulse solver iterates coupled contacts up to 128 times, followed by bounded position projection. Equal masses share penetration correction. Simultaneous symmetric and collinear contact fixtures are tested through the public interface; input-array permutations are sorted to exactly the same order. Position projection changes positions only and cannot create kinetic energy.

- Ball restitution: **0.96**. Cushion/jaw restitution: **0.82**. No spin, tangential friction, swerve or angular bodies.
- Velocity impulse convergence: absolute impulse update below **1e-9** or the 128-pass bound. A runtime contact-energy check faults if an impulse solve adds more than `max(1e-7, prior sum-speed-squared × 1e-9)`. There is no energy-clamping correction masking an unstable solve.
- Position projection target: **1e-7** world units. After exhausting passes, remaining penetration greater than **1e-5** is an explicit failure. Public tests check live ball/rail/jaw clearances within **1e-5** after every fixed tick.
- Rolling damping per substep `h`: `speed = max(0, speed × exp(-0.45h) − 90h)`. Direction is preserved. This approximates speed-dependent resistance plus rolling friction and decreases free-roll speed monotonically.
- Settling: every live ball below **2 units/s for 30 consecutive fixed ticks**, then all live velocities are clamped to zero. Individual speeds naturally reach zero earlier under rolling friction. Capture of the last moving ball still waits the sustained interval.
- A **3360-tick / 28-second** shot deadline reports `fault`, never a normal ready transition. Invalid/non-finite/escaped state, exceeded substep budget, contact energy increase and unresolved penetration also report explicit faults. A fault freezes subsequent steps until reset.

Repeatability tests require exact snapshots/event order in the same JavaScript runtime, including varied tick batching. The cross-browser contract is **1e-5 world units** for final positions/velocities and the same event order/phase; bitwise equality across engines is not promised. Browser/frame cadence never changes the fixed tick integration. This is a bounded gameplay approximation, not a full rigid-body engine or a claim of analytic time-of-impact accuracy. Contact timing/positions can differ from an exact swept solution by the substep travel bound; no ball should tunnel through the tested contact matrix. Extremely dense larger racks and spin require new evidence/tool evaluation.

## Evidence scope

The committed model checks exercise maximum-power head-on and grazing transfer, symmetric simultaneous and touching collinear contacts, all four rail directions, and all six pockets with centered capture, positive/negative jaw rebounds and positive/negative near misses. Each rolling tick checks finite state, energy, overlap and rail/jaw clearance. Checks also cover mouth/artwork distinction, oblique corner regression shots, immutable snapshots, calibrated speeds, admission, epoch invalidation, exactly-once capture, scratch/placement, final-object-plus-white precedence, resetting mid-shot, fixed-tick batching and explicit fault recovery.

Model fixtures are intentionally broader than the default player layout. They establish the solver contract but do not substitute for normal-input browser journeys, rendered geometry/motion correlation, cross-browser replay or physical-phone acceptance. Those integration results are recorded separately by the parent issue.

The routine suite includes 32 full-speed angles and specific shallow-entry regressions. The retained 1000-angle full-speed sweep completes with zero faults/escapes; the longest shot settles at 656 ticks (5.47 seconds). A committed π/4 shot remains rolling at tick 600 and settles naturally at tick 650, proving there is no artificial five-second stop. The pre-fix narrow lateral capture gate failed 42/1000 angles; the final mouth-entry/behind-jaw capture rule passes all 1000.

The broad sweep has a 90-second total wall-time bound; each angle still has a 1200-tick simulation bound. The initial 45-second total budget completed only 799/1000 cases on the development machine, so that incomplete harness run was not reported as a pass. The 90-second suite bound is separate from the browser harness’s per-scenario process deadline.

Final retained-command verification: **26/26 tests passed**, including all **1000** full-3960 sweep shots; sweep runtime **61.7 seconds**, total **63.3 seconds**, maximum settle **656 ticks**, with no faults/escapes/energy-growth failures. This is local Node model evidence, not browser or physical-device evidence.
