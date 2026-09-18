# Grenadier Pool 1998 — initial plan

Status: working plan. It separates the accepted product vision from a proposed delivery order. The user defines and agrees each phase scope before work begins.

## Work tracking

Every discrete step, including design and review, is a separate GitHub issue grouped by phase milestone. Use the [work index](work-index.md) to select an issue for a fresh agent. GitHub holds the current scope, acceptance checks, recommended model/effort, and native blockers. Later phase planning issues produce their own smaller implementation issues once decisions are settled.

## Accepted product requirements

- A two-dimensional, top-down pool game rooted in the Grenadier pub and the people who played there in 1998.
- A deliberately 1998 visual and audio identity. “Retro” does not automatically mean neon, synthwave, or an imitation of the 1980s.
- Friends appear as personas, using their identity and media. Computer counterparts exaggerate traits such as angry or cool; an especially skilled ultimate version is a possible later addition.
- Both human multiplayer and play against computer counterparts belong in the intended product.
- Sound, friends' photographs, and personal Easter eggs are part of the experience; specific source material remains to be selected.
- Touch feel and rapid testing on a real iPhone in Safari have priority, while Android browser compatibility remains an intended constraint.
- Every agreed delivery phase ends with a tested deployment and a working phone link. This includes the first design-preview phase.
- A deployed update must be visible during play. A player can move to it and resume their saved match across application versions.
- The game is designed alongside a programmatic play harness, using compact machine-readable state rather than a screenshot-heavy control loop.

## Product job

Create a pool game that feels like a specific group of friends returning to one specific pub in 1998, and makes taking a shot on a phone immediately satisfying.

This is app UI, not a promotional landing page. The table, aim, shot feedback, opponent personality, match status, and update/resume behavior are the primary interface.

## Design artifacts

Keep the following under `docs/design/` so later work can reuse the decisions:

- a short design brief and an inventory of available photos and audio;
- a screen map covering entry, opponent selection, match, pause, results, update, restore, and multiplayer states;
- three distinct reference boards, each with palette, typography, texture, imagery, motion, audio cues, layout behavior, and failure modes;
- labeled wireframes for phone portrait and/or landscape candidates, including aim, power, turn, foul, pause, update, reconnect, and resume states;
- mockups for the chosen direction at key moments, including at least one persona-rich screen and one unobstructed gameplay screen;
- an interaction storyboard from choosing an opponent through taking a shot and seeing the response;
- reusable design notes for tokens, image treatment, type, controls, motion, sound, and accessibility;
- screenshots and findings from real-device reviews, linked to the design version they evaluate.

## Direction selected on 18 September 2026

The user chose **1998 Sports Broadcast for G01 and O02**, with the pub's social setting between shots. [S1.2](design/selected-direction.md) supersedes the previously open visual-direction decision and the W1 button-driven shot sequence. Single-finger drag/release plus abort is the preferred interaction study; gesture details and orientation remain open. A labeled isometric pub/handover concept can precede a later room model. The table fills the available viewport, with touch-aware broadcast overlays rather than a permanent control rail. The current scope is one live, turn-based, resumable match; the briefly proposed multi-match inbox is deferred. Add spin selection and post-game knockabout/re-rack to the design study. Both 2 v 2 and winner-stays-on are desired formats; their rules and the earlier 50p motif remain later match/multiplayer implementation work.

## Original three direction boards

1. **Pub Snapshot** — Warm, intimate, and photographic: flash-lit friend portraits, worn pub materials, handwritten annotations, compact late-1990s editorial type. It fails if nostalgia overwhelms table legibility or real people feel like decoration.
2. **1998 Sports Broadcast** — Crisp table-first play with score captions, instant-replay energy, restrained broadcast graphics, and contemporary broadcast typography. It fails if it becomes generic television sports and loses the Grenadier's personality.
3. **Home Computer Pool Night** — A late-1990s desktop/game-menu language with compressed photos, period UI details, practical bitmap accents, and tactile sound. It fails if it becomes parody, obstructive skeuomorphism, or a false “neon 1980s” shorthand.

These were the original comparison theses. Sports Broadcast is now selected; retain B1 boards as review history and use S1 for subsequent design.

## Proposed delivery order

The order below is a proposal. Each numbered item becomes a phase only after its scope and acceptance checks are agreed.

1. **Design preview:** publish the brief, screen map, three reference boards, and labeled wireframes in a phone-friendly preview; test the link on iPhone/Safari and record feedback.
2. **Chosen experience and touch study:** produce key mockups, interaction storyboard, reusable design notes, and a small playable touch prototype focused on aim, power, release, feedback, and orientation; deploy and test on a real iPhone.
3. **First playable table slice:** implement a narrow aim, shoot, and pot loop with deterministic setup, core physics, and shot feedback; grow the harness to observe state and perform the same normal actions as a player; deploy and phone-test.
4. **Persistent meaningful match:** establish saved-state restoration and a state-aware upgrade path alongside the first agreed match rules and basic computer opponent. Prove restoration before calling the match complete: deploy, interrupt with an update, restore, and phone-test. Split this into smaller deployed phases if needed.
5. **Personality slice:** add selected persona media, one computer counterpart's readable behavior, tailored audio, and a small set of Easter eggs; check media fallbacks and accessibility; deploy and phone-test.
6. **Human multiplayer slice:** add the agreed multiplayer mode and explicitly define turn ownership, reconnect, incompatible-version, update-during-shot, and cross-version match behavior; deploy and test with two real devices.
7. **Expansion:** deepen rules, opponent variety and difficulty, persona content, audio, Easter eggs, polish, and possibly ultimate counterparts in user-defined increments.

Basic computer play is proposed before human multiplayer because it allows the table, touch controls, rules, persistence, and automated play to mature with fewer distributed-state variables. Both modes remain part of the intended product, and the user may choose a different sequence.

## Harness growth alongside the game

- Begin with health/version reporting, deterministic scenarios, and compact observations of balls, velocity over time, turn, rules state, and shot readiness.
- Exercise normal aim and shot actions, then add concise assertions and reusable fixtures as gameplay expands.
- Correlate observations with targeted screenshots and motion checks initially and whenever rendering or coordinate mapping changes.
- Use bounded waits, bounded recovery attempts, and progress checks. Distinguish game failures from harness failures where evidence permits.
- On uncertain or failed runs, stop rather than report a pass and retain a bounded bundle of recent actions, observations, errors, scenario/version identifiers, and targeted screenshots or traces.

## Decisions to make as evidence arrives

- Which pool rules and match format define the first meaningful game.
- How the selected broadcast direction represents the pub during brief between-shot moments, and what room references/model are needed.
- Portrait, landscape, or responsive orientation and the exact aim/power control model.
- What “first complete” means: its minimum opponent, match, personality, persistence, and multiplayer scope.
- When human multiplayer enters the sequence and whether its first form is same-device, remote, or another agreed model.
- How updates behave during an active shot and how multiplayer proceeds when clients are on different versions.
- Which people media and audio can be used, how each person is represented, and which personal references should remain private.

Do not front-load these into an exhaustive questionnaire. Resolve the next decision with boards, wireframes, prototypes, and real phone feedback. Concrete engine, hosting, networking, storage, and deployment choices remain open until the relevant slice provides enough evidence.

## Pace and feasibility

Aim for useful deployed progress today. The amount achievable depends on the chosen scope, feedback, and technical findings; completion of the entire vision within one day is not yet established. Use completed, tested phases to assess progress rather than promising a date before investigating the work.
