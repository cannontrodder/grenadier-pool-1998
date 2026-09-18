# Phase 3 — First playable table

Planning owner: [#9](https://github.com/cannontrodder/grenadier-pool-1998/issues/9). Status: agreed scope; #24 implements and verifies the first working table foundation. Layout completion, placement UI, integrated verification/review and phase delivery remain #25–#29.

## Problem and agreed direction

The accepted touch study makes aiming and taking a shot feel right on a physical device, but its pockets are artwork and it cannot support a continuing potting practice session. This phase makes a small complete practice loop: aim, shoot, watch credible motion, pot balls, recover the white, and re-rack.

Decision record: the user selected “Three-ball practice layouts” and “Place the white ball yourself”, then instructed that everything be created ready to start work on issues. This finalizes the planning package below.

The user selected **three object balls plus the white**, in repeatable practice layouts, and **manual placement of the white after a scratch**. The touch study is accepted; device metadata is not a new gate. Keep its nonlinear power, full pull range, same-finger abort and adjustable strength. Planning ends with this agreed spec and actionable issues committed and pushed; gameplay implementation and deployment happen in those issues.

## Player experience

- One fullscreen, top-down table with six working pockets, the selected Sports Broadcast treatment, and both portrait and landscape layouts. Keep feedback brief and controls clear of the active finger.
- Three named, fixed layouts: **Straight pots**, **Cut pots**, and **Cushion practice**. Each starts with the white and three object balls. Straight pots is the default. Freeze and version coordinates during implementation; each layout must support its named shot and clearing all three balls through normal play. No random rack or opening break.
- Aim through a full circle, pull for power and release to shoot. A short pull gives a gentle tap; full pull at the default strength has the accepted energetic response. Strength changes impulse, not travel. A simple direction guide suffices; predicted multi-ball/rebound paths are outside this phase.
- Balls collide, rebound off cushions and pocket jaws, roll to rest, and enter pockets through their mouths. Potted object balls stay down. Show a brief pot indication and a simple `0/3` through `3/3` count, without competitive scoring.
- While balls move, another shot cannot begin. Once all live balls settle, play continues from their positions. Potting all three object balls shows **Table cleared** and an explicit **Re-rack** action; it does not silently restart.
- Potting the white is a **scratch**, with no foul penalty or turn rules. Wait until other balls settle, then show **Place the white**. Tap/release on clear playable felt to place it. Preview validity; an occupied spot, cushion or pocket region is invalid and keeps placement active. The placement contact is consumed: a fresh contact must begin aiming. Provide an accessible keyboard positioning/confirm alternative.
- If the white and final object ball are potted in the same shot, wait for settling and show Table cleared; do not require pointless replacement. Re-rack restores the selected layout. Layout selection also explicitly starts a fresh layout.
- Re-rack/layout changes cancel pending input and motion, clear events/counts and reset the white, aim and balls deterministically. Preserve the current strength within the page; reload restores the default layout and strength. This temporary practice session has no saved game.
- Keep alternative aim/power/shoot controls available inside Menu for keyboard accessibility. Do not make them the primary shot flow. Menu controls must never start a table gesture; opening the menu or changing a setting disarms any active gesture. No nonfunctional spin selector.

## User stories

1. As a player, I can choose a repeatable three-ball layout to practise a specific shot.
2. As a phone player, I can aim, pull and release with one finger using the accepted feel.
3. As a player, I can tap gently or hit hard without losing the full pull range.
4. As a player, I can tune shot strength in Menu without changing the power curve or pull distance.
5. As a player, I can return inward and lift to abort, including rearming before release in the same gesture.
6. As a player, I can trust interruptions and screen rotation never to produce an unintended shot.
7. As a player, I can distinguish a pot from a jaw rebound or a near miss and continue from settled positions.
8. As a player, I can place a scratched white on clear felt without that placement firing a shot.
9. As a player, I can clear the table and explicitly re-rack the chosen layout.
10. As a keyboard user, I can take shots, choose layouts, tune strength and replace the white using named controls.
11. As a tester, I can play through normal UI actions and verify positions, motion, pocket outcomes and readiness from concise observations.
12. As a tester, I receive a bounded diagnostic failure when the game or harness stops progressing, rather than a false pass.
13. As the product owner, I can open a tested shareable phone link and accept or correct this phase on a physical device.

## Accepted interaction contract

Use T1.1 as the behavioral reference, not as a production implementation to merge wholesale. Its application revision is `d4f83f24786a089113ffce74a3f4525c6be609d5`; later evidence/harness fixes are preserved at `059a7e8212999c966da0e8bacfc445acc6502c5d` on `prototype/touch-study-7`.

The following decision-rich equations come from that prototype. Distances are CSS pixels measured outward from the initial finger radius around the white:

```text
pull = clamp((radius - startRadius - 12) / 115, 0, 1)
power = pull²
armed = pull >= 0.06
speed = 60 + 1300 × power × strength
strength ∈ [0.5, 3], initially 1.8
```

Arming therefore begins at 18.9px beyond the initial radius and full power at 127px. Default maximum speed is 2400 world units/s; maximum tuning gives 3960. Preserve the prototype's 1000×500 world and radius-12 balls for this calibration. There is no linear-mode choice in the phase UI. Browser viewport scale and orientation do not shorten physical pull travel.

The active pointer exclusively owns the gesture. Returning to neutral and lifting aborts; `pointercancel`, lost capture, focus loss, hidden page, page exit, resize and orientation change disarm it. Ignore delayed releases and secondary contacts. During motion, a hidden page pauses simulation; resume from that state with no accumulated wall-clock jump and no armed gesture. Re-rack creates a new scenario epoch so stale actions/events cannot affect the new layout.

## Implementation decisions and test seam

Use the existing ES-module and SVG approach as the baseline. A pure practice simulation owns world geometry, balls, admission of shots, fixed simulation steps, contacts, pots, settling and placement validity. A small interface accepts gameplay commands, advances explicit ticks and returns immutable snapshots/events. It has no DOM or browser-clock dependency. This is the main model-test seam; test public behavior, not collision-helper internals.

The input adapter owns browser pointer capture, CSS-to-world mapping, the accepted pull curve and accessible controls. The renderer projects snapshots and shared table geometry. Portrait rotates the view of the same world; it never rotates or resets simulation state. Representative pot, scratch → placement → fresh shot, and clear/re-rack browser journeys must use the accepted one-finger pull/release path. Test the keyboard alternative separately. Browser tests act through normal visible controls and pointer/keyboard input; the exposed observation is read-only. Browser tests must not teleport balls, set velocities or invoke privileged shot/pot commands. Pure model tests may supply explicit fixtures to the public simulation interface.

Keep a circle-specific solver for this bounded four-ball world, with stable contact ordering and either swept collision timing or conservatively bounded adaptive substeps. The prototype's two-ball assumptions and five-second forced stop are not production contracts. At maximum tuning, one 1/120-second tick covers 33 world units, so an unguarded overlap-only solver is insufficient. Show evidence for head-on, grazing, simultaneous ball contacts, rails and jaws at maximum power. Do not silently weaken maximum strength to make collision tests pass. If this matrix exposes a solver limitation, compare a bounded engine spike before changing the tool choice; record evidence and preserve the experience contract.

Cushions end at pocket mouths; explicit jaws and capture boundaries are shared with rendering. A pot requires entering the capture region through the mouth, not merely overlapping dark artwork. Capture removes the ball from table collisions and emits one sequenced event. Document ball/rail restitution and rolling damping; collision resolution must not create kinetic energy beyond declared numerical tolerance, and free-roll damping must reduce speed monotonically. Resolve all motion before deciding readiness, placement or clear state. The foundation owns the sole post-settle precedence: cleared if no object balls remain; otherwise placing-white if the white is absent; otherwise ready. Scratch is a capture event/condition during rolling, not a competing phase. Only a ready simulation admits a shot; only placing-white admits placement. The input adapter may project ready plus an active gesture as aiming in observations; this does not bypass shot admission. Settling requires all live balls below a documented small speed threshold for a sustained fixed-tick interval, then clamps them to rest. A safety timeout is a failure, never a substitute for settling.

Repeatability means identical fixture, shot parameters and tick sequence produce the same event order and final positions within declared numerical tolerances. Fixed ticks separate simulation results from frame cadence. Do not promise cross-platform bitwise equality; document tolerances before locking expectations. Bound catch-up work and signal inability to progress rather than silently skipping physics.

## Observation and harness contract

A versioned read-only observation contains:

- build revision, contract version, scenario ID/version and reset epoch;
- simulation tick, state revision, frame/observation sequence and freshness/health signals;
- phase (`ready`, `aiming`, `rolling`, `placing-white`, `cleared`, or explicit fault), shot ID and shot readiness;
- strength, aim angle, pull/power and active/disarmed gesture state;
- each ball's stable ID, role, live/potted status, world position/velocity and pocket ID when captured;
- ordered recent events with sequence/tick/shot identifiers and ball/pocket IDs;
- object-ball pot count, placement candidate/validity and pause state;
- table-to-screen geometry needed to act through the same controls and correlate rendering.

A healthy stationary table is distinct from a stale observer: freshness advances even when simulation motion does not. New scenario epochs distinguish resets from non-monotonic observations. Event sequences make duplicate or missed pots visible.

Every gameplay ticket adds model behavior assertions plus browser journeys for what it delivers. The integration ticket broadens cross-flow and failure evidence; it does not defer the harness until gameplay is finished. Use compact assertion summaries for routine runs and targeted screenshots/motion samples to establish correspondence.

Start from the prototype safeguards: 3.5s action deadline, 2s freshness deadline, 5s revision/progress wait and 50s outer process bound per bounded scenario. Calibrate a finite settle wait to the new physical damping and maximum-strength case; record it rather than importing the prototype's forced stop. Split long suites into bounded cases. Stop the affected run on missing/stale observations, disconnected browser, timed-out action, or absent expected progress. Preserve the original failure and at least the last 16 actions/observations, errors, build/scenario/epoch IDs, and a targeted screenshot/trace. Permit at most one bounded reload health probe; it cannot upgrade the failed run to a pass. Classify `game-failure`, `harness-failure` or `uncertain` according to evidence.

## Observable acceptance checks

| ID | Required evidence |
| --- | --- |
| A1 | Each visible layout restores the same four-ball setup. Demonstrate the named straight, angled or cushion-assisted shot, then clear all three object balls in each layout through normal UI actions and explicitly re-rack to the exact fixture. Re-rack/layout changes during aim or motion reset deterministically without late shots/events and preserve strength. |
| A2 | Small pulls remain gentle, full pulls energetic; at 0.5×, 1.8× and 3×, arm and saturation distances remain 18.9px/127px. Same-finger abort and rearm work. Every listed interruption and extra-pointer case produces no unintended shot. |
| A3 | Head-on, glancing, multi-ball and simultaneous-contact fixtures, rails and jaws remain stable at full 3× power: no tunnelling, sustained overlaps, rail escapes, non-finite state or artificial five-second stop. Contacts do not create kinetic energy beyond declared tolerance; free-roll speed decreases monotonically, with restitution/damping/settle values documented. Reordered internal storage does not change the outcome beyond declared tolerances. |
| A4 | Corner and side mouth offset fixtures distinguish clear pots, jaw rebounds and near misses. All six pockets capture through real openings, remove each ball once and report the correct pocket. Observed capture agrees with rendered motion. |
| A5 | Further shooting is denied during motion. Settling produces zero velocities and exactly one applicable post-settle transition (`ready`, `placing-white` or `cleared`); a safety deadline reports failure. Pot count stays consistent and all three object balls produce Table cleared. |
| A6 | A scratch waits for settling, then permits legal white placement. Occupied, rail and pocket locations fail visibly. Valid placement consumes its pointer; only a fresh gesture can shoot. Keyboard placement works. White plus final-object capture clears without a placement prompt. |
| A7 | WebKit at 390×844, 844×390 and 320×568, plus Chromium at 412×839, pass normal-input journeys, including a full primary one-finger pull/release clear in every layout, one representative scratch → invalid/legal placement → fresh shot journey, and a separate keyboard path. Native touch dispatch covers pointer ownership/cancellation. Rotation preserves world positions and disarms. Hidden-page motion pauses/resumes without catch-up. Targeted ready/armed/moving/pot/placement screenshots and timed motion samples match observations within 1 CSS px for ball centers; mouth/jaw geometry also matches. |
| A8 | Same fixtures and committed shot parameters replay with declared tolerances; varying render cadence does not alter fixed-step outcomes. Missing/stale observations, action/progress timeouts and disconnection fault checks fail promptly with original diagnostics retained; recovery cannot turn them green. |
| A9 | A deployed build passes hosted health/revision and representative normal-input checks. The owner opens it on a physical phone and explicitly accepts that deployed revision. Corrections keep delivery open until fixed, reviewed, regression-tested, redeployed and accepted. Record device/browser/orientation when supplied; emulation is not physical evidence. Accepted touch study does not substitute for this new phase feedback. |

## Delivery sequence

1. Aim, shoot and pot on a working table: A2–A4 foundation and first normal-input pot journey; one fixed four-ball fixture, real geometry and observations. This also owns A5’s authoritative settling/admission contract: `ready → rolling → ready|placing-white|cleared`, sequenced cue/object capture and remaining count, `shoot`/`placeWhite`/`resetScenario` admission, and epoch invalidation. Reject shots outside ready and placement outside placing-white. Re-rack is the visible scratch recovery until ticket 3 supplies placement UI.
2. Complete and re-rack the practice layouts: A1/A5 and the cleared state; blocked by 1.
3. Place the white after a scratch: A6 and its input/observation tests; blocked by 1. The foundation exposes scratch/remaining-ball state so this can proceed independently of the layout UI.
4. Verify the complete phone practice loop: A1–A8 across integrated gameplay, including diagnostic self-checks; blocked by 2 and 3.
5. Review against the spec and repository standards: review the exact integrated revision, resolve findings and recheck affected behavior; blocked by 4.
6. Deploy and collect physical-phone feedback: A9 plus retained regression evidence; blocked by 5.

Native GitHub blockers and milestone membership are recorded on the published issues below. Model/effort guidance is a starting judgment based on this workspace’s available models; escalate on evidence. Only completed blockers unlock a ready-for-agent issue. #10 must wait for the actual phase delivery, not merely this planning document. Parallel implementation uses separate branches/worktrees; the orchestrator owns integration and verification.

| Issue | Native blockers | Suggested model / effort |
| --- | --- | --- |
| [#24 — Aim, shoot and pot on a working practice table](https://github.com/cannontrodder/grenadier-pool-1998/issues/24) | None | gpt-6-astra / high |
| [#25 — Complete and re-rack three practice layouts](https://github.com/cannontrodder/grenadier-pool-1998/issues/25) | #24 | gpt-5.6-sol / medium |
| [#26 — Place the white after a scratch without firing a shot](https://github.com/cannontrodder/grenadier-pool-1998/issues/26) | #24 | gpt-5.6-sol / high |
| [#27 — Verify the complete phone practice loop and harness safeguards](https://github.com/cannontrodder/grenadier-pool-1998/issues/27) | #25, #26 | gpt-5.6-sol / high |
| [#28 — Review the first playable table against the phase spec and standards](https://github.com/cannontrodder/grenadier-pool-1998/issues/28) | #27 | gpt-5.6-sol / medium |
| [#29 — Deploy the first playable table and record phone feedback](https://github.com/cannontrodder/grenadier-pool-1998/issues/29) | #28 | gpt-5.6-sol / medium |

Start with #24. Issues #25 and #26 can run in parallel once #24 is complete. #29 remains open until the new deployed phase receives physical-phone acceptance; #10 is natively blocked by #29.

## Hosting update during #24

The owner requested a friends' preview on GitHub Pages and authorized making the
repository public if required. [#30](https://github.com/cannontrodder/grenadier-pool-1998/issues/30)
publishes the tested #24 foundation early. The [hosting guide](../practice-hosting.md)
records the public runtime build. This updates the earlier private-link preference;
it does not waive the remaining gameplay, review or physical-phone acceptance in #29.

## Out of scope

Full racks/breaks; formal pool/foul/turn/win rules; AI or human opponents; multiplayer; saved matches/cross-version restoration/update prompts; physical spin, swerve or jump; striking nominated object balls; pub transitions/3D rooms; new persona media, audio or Easter eggs; elaborate aim prediction; engine generalization for future phases. No new shot-control comparison study.

These are phase deferrals, not removal of product requirements. In particular, the brief's saved-match/update behavior belongs to #10, while this explicitly temporary practice session reloads to its starting state. Preserve existing design and touch-study routes and the prototype branch. #4/#20 historical design feedback does not block this accepted-control phase.

## References

- [Project brief](../project-brief.md), [delivery plan](../plan.md), [domain language](../../CONTEXT.md).
- [Accepted touch-study findings](../prototypes/touch-study-findings.md), [selected direction](../design/selected-direction.md).
- [Simulation and harness research](../research/phase3-simulation-harness.md), including primary sources and the engine fallback tradeoff.
- [Preserved prototype and evidence](https://github.com/cannontrodder/grenadier-pool-1998/tree/059a7e8212999c966da0e8bacfc445acc6502c5d), [accepted private study](https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/touch-study/).
