# Phase 3 research: smallest credible aim, shoot and pot slice

Status: research recommendation adopted by the agreed phase spec for [issue #9](https://github.com/cannontrodder/grenadier-pool-1998/issues/9), not implementation evidence. “Three-ball” below means **three object balls plus the cue ball**. The user subsequently chose three object balls and manual cue-ball placement. The comparison below records the alternatives evaluated, not unresolved choices.

## Recommendation

Keep a small, pure, circle-specific simulation for this phase, separated from SVG rendering and browser input. Extend it only with real cushion geometry, pocket capture, cue-ball scratch/replacement, deterministic scenarios, and collision handling that is safe at the accepted strength range. Do not add match rules, spin physics, persistence, AI, or multiplayer.

The preserved prototype already proves the useful seam: its model accepts gesture-derived shot values and advances world-space balls; `study.js` alone owns Pointer Events, screen/world transforms, SVG updates, and the read-only harness surface ([model](https://github.com/cannontrodder/grenadier-pool-1998/blob/059a7e8212999c966da0e8bacfc445acc6502c5d/docs/design/touch-study/model.mjs), [browser adapter](https://github.com/cannontrodder/grenadier-pool-1998/blob/059a7e8212999c966da0e8bacfc445acc6502c5d/docs/design/touch-study/study.js)). Preserve the accepted nonlinear “gentle start,” full 127 CSS-pixel pull range, inward abort, and 0.5–3× strength setting; strength changes impulse, not gesture travel ([prototype contract](https://github.com/cannontrodder/grenadier-pool-1998/blob/059a7e8212999c966da0e8bacfc445acc6502c5d/docs/design/touch-study/README.md)). Use centre-ball contact physically in this slice; a visible spin selector must not silently pretend to affect motion.

## Boundary and contract

**Simulation** should own table geometry, ball/pocket state, shot admission, fixed-step motion, collision order, pot/scratch events, settling, and cue replacement validity. It consumes explicit commands (`shoot`, `resetScenario`, and whichever replacement command is selected) and never reads DOM, wall-clock time, viewport size, or animation frames.

**Input adapter** should own pointer capture, interruptions, screen-to-world conversion, the accepted pull curve, and normal UI settings. It emits a shot command only after an armed release. Rotation/background/capture loss still disarms; orientation changes never rotate simulation state.

**Renderer** should only project immutable simulation snapshots into the selected table view. Pocket artwork must derive from the same geometry that governs capture; targeted checks should prove rendered centres and pocket mouths correspond to observations.

The read-only harness observation should be versioned and compact:

```text
contractVersion, buildRevision, scenarioId, frame, simTick, stateRevision,
phase, shotId, shotReady, strength, aim/power/gesture,
balls[{id, role, status, x, y, vx, vy, pocketId}],
lastEvents[{seq, tick, type, ballIds, pocketId}], replacement, health
```

Use ordinary pointer/UI actions; avoid privileged “shoot” or “pot” setters. A normal Reset may load a named deterministic fixture. Wait on `stateRevision`, `shotId`, and phase transitions rather than sleeps. Keep the prototype’s bounded freshness/progress checks, one bounded recovery attempt, and separate `game-failure` / `harness-failure` / `uncertain` classifications ([harness source](https://github.com/cannontrodder/grenadier-pool-1998/blob/059a7e8212999c966da0e8bacfc445acc6502c5d/scripts/touch-study/browser-check.js)). Preserve the original action/observation ring, errors, build/scenario IDs, and a targeted screenshot or trace when a run stops.

## Geometry and numerical risks

Model each rail as cushion segments that end before six mouths, with explicit jaw arcs/circles and a capture boundary behind each mouth. A ball is potted only when its centre crosses that boundary inward; mere overlap with dark pocket artwork is not a pot. Once captured, remove it from table collisions and emit one event. A scratched cue ball enters an explicit `awaiting-replacement` or `returning-cue` phase rather than teleporting during motion.

At the accepted maximum speed (3960 world units/s), a 1/120-second step travels 33 units, more than the prototype ball diameter (24). Overlap correction alone can tunnel. Either solve swept circle-circle and circle-cushion time of impact, advancing the earliest event and resolving all contacts within an epsilon, or adaptively substep so no ball crosses more than a small fraction of the smallest collision feature. Stable ball/collider ID ordering and several contact iterations are needed when events share a time.

Concrete behaviour checks:

- **Tunnelling:** maximum-strength head-on, grazing, cushion, and pocket-jaw shots register the first physical contact; no ball crosses a rail or another ball.
- **Simultaneous contact:** symmetric three-ball and collinear fixtures remain symmetric within a declared tolerance; permuting array storage does not change the outcome.
- **Pocket/jaw:** a table of offsets around a corner and side mouth distinguishes pots, jaw rebounds, and near misses; events fire once and balls never reappear.
- **Settling:** require every live ball below a speed threshold for a sustained fixed-tick window (for example 30 ticks), then clamp to rest. A safety deadline is a failure, not a normal settle rule.
- **Repeatability:** replay the same scenario, strength, aim, and command tick many times and compare event sequences plus final states exactly in one runtime and within a declared tolerance across WebKit/Chromium. Also verify reset restores the fixture byte-for-byte.
- **Cue replacement:** no overlap with balls, cushions, or pocket capture regions; invalid attempts remain pending. For automatic return, verify a documented deterministic search order. For manual replacement, verify screen/world mapping and pointer interruption.
- **Rendered correlation:** ready, armed, first motion, jaw contact, pot, scratch/replacement, and settled checkpoints at the existing phone viewports; routine play then uses observations.

## Bounded solver versus a general 2D engine

A custom solver fits this phase because every moving body is an equal-radius circle and the static world is a few segments/jaws. It keeps pockets, settling, events, and deterministic ordering explicit and avoids translating a rigid-body engine’s contacts back into pool semantics. It is credible only if the risk matrix above passes at 3× strength.

Planck.js is the strongest general-engine fallback to spike if a full rack is selected now or the bounded solver fails. Its official documentation provides fixed stepping, time-of-impact handling, dynamic-body CCD through `bullet`, and sensor fixtures suitable for pocket regions ([continuous collision](https://piqnt.com/planck.js/docs/body), [sensors](https://piqnt.com/planck.js/docs/fixture)). It does not remove the hard acceptance work: Planck documents collision slop, an iterative approximate solver, degraded restitution under simultaneous contacts, and repeatability only within the same JavaScript runtime rather than across platforms ([limitations and determinism](https://piqnt.com/planck.js/docs/limitations)). Therefore a general engine should be adopted for demonstrated phase needs, not as an assumed prerequisite.

## Alternatives evaluated

| Choice | Phase consequence |
|---|---|
| Three object balls + cue | Smallest credible potting practice; exercises transfers, blockers, pockets, scratches, and modest simultaneous contacts. Recommended research baseline. |
| Fifteen-ball rack + cue | Adds the break and dense simultaneous contacts immediately; raises solver confidence and tuning scope without adding a new aim/shoot/pot loop. |
| Automatic cue return | Smallest recovery loop; define a deterministic legal spot/search and resume automatically. |
| Manual cue placement | Adds a useful future ball-in-hand interaction and mapping checks, but expands input, invalid-placement feedback, accessibility, and harness actions. |

The user resolved both choices in the #9 discussion: three-ball practice layouts and manual white-ball placement. See the [phase spec](../phases/first-playable-table.md) for the resulting behavior and acceptance checks.
