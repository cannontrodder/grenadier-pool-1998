# Selected direction · S1.1 · issue #5

Decision source: [user's 18 September 2026 review](feedback/2026-09-18-direction-review.md). Reviewed B1/P1 source `4de961e3dc01e01fe67d5b644868990355b4d657`. Issues consulted: #1–#7, #10–#12, #14.

## Selection

**1998 Sports Broadcast**, for both **G01 gameplay** and **O02 persona presentation**, explicitly selected by the user. The governing idea is **a 1998 sports broadcast of a match taking place in the Grenadier pub**.

Keep the clear score/turn captions, bold period sports typography, navy/red/cool-white graphics, green felt, and featured-player persona framing. Keep broadcasts restrained enough that the table and the next shot remain immediately legible. The later feedback explicitly rejects the persistent landscape control rail: the table should occupy the available viewport, with compact TV-style overlays positioned away from active touch and fading back during interaction. This is not a hybrid with the Pub Snapshot album layout or Home Computer windows.

## Pub presence without compromising the shot

- Gameplay stays two-dimensional and top-down, with recognizable table rails and warm pub light/material accents. Preserve table aspect ratio within the full available viewport; no persistent right control rail or bottom power deck takes its place. “Fullscreen” describes layout, not a dependency on a browser fullscreen permission/API.
- Score, active-player captions, update notices, and feedback use brief TV-style overlays. During aim/drag, reposition them away from the finger/cue/important ball region and fade nonessential chrome. Keep an intelligible abort/armed cue. Exact timing, opacity, and collision-avoidance rules need prototype testing; do not move targets under the finger. Provide a legible alternative when transparency or motion is reduced.
- Between shots, allow character reactions, people seated nearby, the incoming player stepping up, and the social context of sharing a pub table.
- Explore a skippable pullback to an isometric pub scene once the balls have settled. Use a labeled schematic or 2.5D stand-in in design work. No accurate Grenadier room model or 3D asset currently exists.
- Do not move the camera while a shot is being aimed or balls are in motion. Do not delay every shot with a mandatory sequence. A reduced-motion/static alternative must retain turn ownership and the pub context.
- Return to the same readable top-down shot view before input becomes available. Treat any transition timing as a prototype hypothesis, not a user-approved timing value.

## Interaction direction superseding W1

The preferred study is **one-finger drag and release, with an abort route**. The user explicitly does not want the wireframe buttons to constrain the UX. G02 (aim), G03 (armed/power), and G04 (committed/motion) remain useful state names; they may occur within one continuous gesture, not three button-driven screens.

The mockup/storyboard must show contact, aiming, changing shot strength, release, abort, motion, and feedback. Drag distance versus velocity, control origin, aim adjustment, dead zone, and cancel target remain hypotheses for #7. Show a candidate clearly rather than treating it as settled. An accessible button/keyboard mode can be offered separately; it must not replace the preferred direct gesture.

A candidate safe abort is to return to a neutral zone or slide to a clearly signaled cancel region while maintaining the same finger contact, then lift. Test discoverability, accidental-release rate, and reach. Pointer cancellation, app backgrounding, interrupted gestures, and remote loss of turn must disarm rather than shoot. A second finger or a mandatory confirmation tap is not part of the preferred loop.

Orientation is **not selected**. Preserve portrait/landscape comparison in the touch study, alongside thumb obstruction and left/right-handed reach. “I prefer G01” selects the visual treatment, not a measured ergonomic result.

## Friends and sound

Use the user-supplied identities Trod, Craig, Shacka, Maaaaark in that original left-to-right order when identifying the source photo (#14). Computer counterparts must remain explicitly identified as such. Individual traits and teams have not been assigned by the user; any team arrangement in a mockup must be labeled illustrative.

Audio should put ordinary pool sounds first: cue contact, ball contact, cushion contact, pocket drop/return, with a low pub-room bed and sparse between-shot human/material detail. Develop a reusable sound palette with asset provenance, mute/level controls, captions, and a silent fallback; no actual period recording is currently supplied. Do not assume a music track is required or that a broadcast visual style demands commentary/stings over every shot. See the #6 sound direction artifact when available.

## Multiple matches and asynchronous play

The user explicitly likes returning to several in-progress games and taking turns across them, like playing correspondence chess with multiple people. Design an E01 match-list variant with clear “Your turn”, “Waiting”, and resume context for each match. Opening one match must not silently discard or reset another. Distinguish switching matches from updating the application; both need restoration, but their triggers differ.

For later #10/#12 implementation, save and reconcile each match separately and show authoritative turn ownership on resume. Details such as notifications, live-mode coexistence, time limits, how to leave during a committed shot, and simultaneous turn arrivals remain open. No accounts, networking service, or production match storage is implemented by a design mockup.

## Future play formats, not newly committed implementation

The user is interested in 2 v 2 with turn-taking and a “killer”/winner-stays-on challenger mode with a 50p entry motif. Preserve that description until house rules are specified. Team composition, within-team rotation, foul/extra-shot treatment, challenger queue, and the meaning of 50p in the software remain open. Use #10 and #12 for rules/multiplayer planning; do not introduce a payment flow in the design preview.

## Review status and downstream handoff

The visual-direction decision is explicit and sufficient for #6 mockups/storyboard/tokens. The physical iPhone Safari check remains in #4 and future touch-study review #8; no hardware, orientation, contrast, or accessibility acceptance was implied by this choice. Carry those unresolved checks forward, without reopening the basic visual selection.

Required #6 outputs: fullscreen broadcast gameplay and persona mockups, a multiple-match resume/turn-list concept, a labeled pub pullback/handover concept, one-finger gesture/abort storyboard with touch-aware translucent overlays, reusable visual/audio/accessibility notes, and phone-size verification. These are design artifacts, not a playable prototype or a completed 3D scene.
