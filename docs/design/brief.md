# Design foundation · D1 · 18 September 2026

Issue: [#1](https://github.com/cannontrodder/grenadier-pool-1998/issues/1). This is the app-UI foundation. The later [S1 decision](selected-direction.md) selects Sports Broadcast and supersedes the original direction/control assumptions below.

## Job and audience

Make taking a pool shot on a phone immediately satisfying while bringing the creator and friends back to their Grenadier pub evenings in 1998. Prioritize a readable table, clear turn ownership, and an expressive but unobtrusive opponent. The audience knows the people and place; the interface must still explain how to play without relying on those memories.

## Settled requirements

- Two-dimensional, top-down pool; iPhone Safari first, Android browsers retained.
- Both real friends and computer counterparts belong in the eventual product. A persona represents a friend; a computer counterpart is an exaggerated computer-controlled version, never a claim that the real friend is online.
- Personal photography, sound, and Easter eggs belong in the experience. At the D1 baseline none had been supplied. A subsequent group photo identifies Trod, Craig, Shacka, and Maaaaark (see media inventory, issue #14); other missing media still uses clearly labeled placeholders.
- A 1998 identity: compact printed sports captions, flash-photo albums, pub materials, or practical home-computer UI are credible candidates. Do not substitute neon grids, synthwave, or an undifferentiated 1980s arcade mood.
- During play, announce deployed updates and offer a path to reload and restore the existing match across application versions. Never imply that browser hot reload fulfills this.
- Design alongside compact programmatic observations and ordinary gameplay actions. Targeted screenshots and motion checks must establish that observations match the rendered table; uncertain harness runs stop with bounded diagnostics.
- Each delivery phase includes a tested deployment and a phone link. Physical-device feedback must be recorded as actual feedback, never inferred from emulation.

## Interface priorities

1. Table geometry and balls remain readable throughout aim and shot motion. Under S1.2, use the full viewport for the table and temporary broadcast overlays away from the finger and important action; fade nonessential overlays during interaction. The original fixed control rail is rejected.
2. Make whose turn it is, the next legal interface action, and the difference between aiming and committing a shot explicit. Rules are not settled; do not hard-code a ruleset into the visual specification.
3. Study single-finger drag and release with a clear abort path (S1). Keep the armed/committed distinction legible, but do not require separate power/commit buttons. Exact mapping and orientation remain to be tested.
4. Use larger persona moments in selection and results; during play use a small named portrait slot and short reactions between shots.
5. Preserve context through pause, update, restore, and reconnect. Explain recovery next steps and do not silently discard a saved match.

## Accessibility constraints for concepts

Target controls of at least 44 × 44 CSS pixels, visible focus, 16px or larger ordinary UI text, and contrast suitable for readable phone use. Give balls redundant marks/patterns as well as color; turn and foul feedback needs text. Plan button/keyboard alternatives for drag gestures. Respect reduced motion, provide mute and volume controls, and caption meaningful sound cues. Treat narrow screens, text enlargement, safe-area insets, browser chrome, and left/right-handed reach as design inputs. No flashing effects or audio-only instructions.

## Open choices and how to resolve them

| Choice | Evidence / owner |
| --- | --- |
| Selected Sports Broadcast with pub context | User decision #5 / S1; apply it in #6 |
| Portrait, landscape, responsive composition | Neutral layout candidates (#3), then touch study and physical phone feedback |
| Aim/power/commit gesture and guide length | #3 candidates; later measured touch study (#7) |
| Pool rules, match length, computer difficulty | Later match planning (#10); diagrams use illustrative ball placements only |
| Initial human multiplayer mode | Later #12; show remote join/reconnect states without choosing infrastructure |
| Real persona identities, permissions, audio, personal references | Media inventory; later content selection, no invented personal details |
| Shot checkpoint timing and cross-version/network protocol | Show proposed safe-boundary UI now; prove the contract in later persistence/multiplayer work |
| Engine, hosting for the game, networking, storage | Defer until the relevant playable slice. Preview hosting is a separate small decision. |

## Later S1.2 requirements

Use one live active match with entry/resume; the user deferred the multi-match inbox. Include cue rotation, provisional pull-away power, spin/backspin contact selection, and post-game knockabout/re-rack in later design. Both 2 v 2 and winner-stays-on are desired, with exact rules still open. Pub scenes may include Betty, the formidable landlady.

## Parallel handoff

Use the stable IDs in [screen-map.md](screen-map.md) and media IDs in [media-inventory.md](media-inventory.md). #2 owns three distinct visual boards; #3 owns neutral structural candidates. Neither chooses a winner or implements physics. Revision D1 establishes shared vocabulary; later assets should state their own revision and the foundation they use.
