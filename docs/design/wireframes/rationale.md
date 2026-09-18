# Touch-layout wireframes · W1

Issue [#3](https://github.com/cannontrodder/grenadier-pool-1998/issues/3), based on foundation D1 from issue #1. Open [the interactive wireframes](index.html) or return to the [Design preview](../index.html).

## Job

Expose the structural tradeoffs in taking a pool shot on a phone before choosing an orientation or control model. A player should always see who owns the turn, what can happen next, whether a shot is still cancellable, and how to recover from an update, restore, storage, or connection interruption.

These are neutral, low-fidelity app UI diagrams. They deliberately avoid choosing among the visual directions, do not simulate pool physics, and do not settle rules, networking, persistence, or the final gesture model.

## Candidate A · portrait, 390 × 844 CSS px

The table occupies the full width above a bottom control deck. Aim, power, cancel, and commit stay in the lower third for one-handed use. Turn ownership sits in a narrow strip immediately above the table; transient feedback occupies the control deck or a bottom sheet, so it does not cover balls.

This candidate gives the strongest vertical sequence: status → table → controls. It also gives opponent introductions, results, and recovery copy more vertical space. The cost is a shorter table and less horizontal distance for a fine aim gesture. Browser chrome and text enlargement can reduce the control deck, so a real implementation would use dynamic viewport units and allow non-game screens to scroll.

## Candidate B · landscape, 844 × 390 CSS px

The table occupies the left region and a 224 CSS px control rail occupies the right. Aim, power, cancel, and commit are grouped in the right-thumb zone. Status has its own 42 CSS px band above the table; modal surfaces enter from the control side. The side safe-area bands account for notches, camera cutouts, and home indicators.

This candidate gives the table and aim gesture more width while keeping controls out of the playfield. It uses scarce vertical space, limits copy, and currently favors the right hand. A touch prototype must test a mirrored rail and a persistent handedness setting before this layout could be selected.

## Shared control contract

The candidates use the same explicit sequence so their layouts can be compared without changing the task:

1. **G01 Ready:** “Aim shot” is available; no shot is armed.
2. **G02 Aim:** direction can be changed by drag or buttons; Cancel returns to G01.
3. **G03 Power:** the player sets power and sees “Commit shot”; Cancel returns to G02 and does not shoot.
4. **G04 Motion:** commitment has happened; input is locked until all balls settle. Backgrounding or pointer loss must never replay this shot.
5. **G05/G06 Feedback:** result or foul is stated in text outside the table, with a visible next action.

This sequence is a wireframe hypothesis for later touch testing. It does not specify whether aiming uses direct cue rotation, an offset pad, a swipe, or another implementation.

## Primary flow review

```text
E01 Entry
  → O01 Opponent selection
  → O02 Persona introduction
  → G01 Match ready
  → G02 Aim adjustment
  → G03 Power / armed
  → G04 Shot in motion
  → G05 Turn feedback
  → G01 next ready turn
```

Every step has a labeled forward action. O01 and O02 have back/change actions. G02 and G03 have explicit cancel actions. G04 is intentionally non-cancellable after commitment and moves only after settle. G05 can be dismissed or continued. The explorer’s **Walk the flow** control visits this sequence and direct in-phone buttons exercise its transitions.

## Interruption and recovery flows

```text
Update while ready
G01 → U01 Continue | Save & reload → U02
U02 confirmed checkpoint → R01 → R02 → G01/M03
U02 save failure → X02 → retry U02 | continue G01 | pause P01

Update during a committed shot
G04 → U01·V “after this shot” → safe settled boundary → U02

Remote interruption
G03 disconnect → disarm → M04
G04 disconnect → M04 → reconcile committed-shot identity → G01/M03

Restore problem
R01 load failure → R03 → retry R01 | home E01 | R03·V explicit start-afresh confirmation

Version mismatch
M05 → U01/R01 | lobby M01 | home E01
```

No update path reloads before save confirmation. X02 explicitly says that the current session is still open. M04 prevents a player from receiving an assumed extra turn. R03 says the save is retained; R03·V shows a separate explicit confirmation and states that the diagram itself deletes nothing.

## Dimensions and implementation annotations

- The two reference viewports are 390 × 844 and 844 × 390 CSS px. They are comparison sizes, not device detection breakpoints.
- Primary touch controls are drawn at 48 CSS px high; the minimum specification is 44 × 44 CSS px, including icon-only settings and navigation controls.
- Keep `env(safe-area-inset-top/right/bottom/left)` around interactive edges. Use `100dvh` with a tested fallback rather than assuming `100vh` reflects visible mobile browser space.
- Ordinary production UI copy should remain at least 16 CSS px. Some diagram labels are deliberately smaller because these files annotate structure; they are not production text specifications.
- The table and controls must remain separate DOM regions. Update banners, reactions, and persona media cannot intercept table input or cover ball positions.
- Left-handed reach needs a mirrored landscape rail and a portrait thumb-reach test. Neither candidate is selected until physical-phone evidence exists.
- Android browsers need the same safe-area, dynamic viewport, pointer-cancel, touch target, and scroll checks as Safari. Do not rely on iOS-only gestures or hover.

## Accessibility and fallback notes

Use visible focus, semantic buttons, keyboard alternatives for drag adjustments, text for turn/foul/update state, and redundant ball numbers/patterns alongside color. Respect reduced motion. Caption meaningful sound cues and retain mute/volume controls. Missing portraits use labeled silhouettes; missing audio is represented by captions. If the wireframe script fails, `index.html` leaves a static fallback with direct links to this flow map and the complete state table.

## Open tradeoffs for the later touch study

- Portrait reach and copy capacity versus landscape table width and aim precision.
- Direct table aim versus a separate aim pad; step buttons remain the accessible fallback in either case.
- A hold, tap, or release gesture for commitment. W1 requires a named armed state and explicit commit but does not choose the gesture.
- Right-side landscape rail versus mirrored or user-selectable handedness.
- How rules-dependent ball placement works, represented only as the mapped `G06·V` variant.
- Exact safe checkpoint behavior during updates and remote committed shots, which later persistence and multiplayer work must prove.

## Verification evidence

The verification log is under [`verification/`](verification/README.md). Browser-size captures follow the Playwright artifact convention under [`output/playwright/wireframes/`](../../../output/playwright/wireframes/):

- [`portrait-g03-390x844.png`](../../../output/playwright/wireframes/portrait-g03-390x844.png) — portrait power/armed state at the exact reference viewport.
- [`landscape-g03-844x390.png`](../../../output/playwright/wireframes/landscape-g03-844x390.png) — landscape power/armed state at the exact reference viewport.
- [`portrait-x02-390x844.png`](../../../output/playwright/wireframes/portrait-x02-390x844.png) — save failure next actions at the exact portrait viewport.
- [`landscape-m04-844x390.png`](../../../output/playwright/wireframes/landscape-m04-844x390.png) — reconnect next actions at the exact landscape viewport.

These are browser emulation captures, not physical-device evidence.
