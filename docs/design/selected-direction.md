# Selected direction · S1.3 · issue #5

Decision source: [user review and follow-ups, 18 September 2026](feedback/2026-09-18-direction-review.md). Initial reviewed B1/P1 source: `4de961e3dc01e01fe67d5b644868990355b4d657`. Issues: #1–#7, #10–#12, #14–#16. Later user instructions below supersede earlier S1/S1.1 assumptions.

## Chosen look

**1998 Sports Broadcast**, selected for **G01 gameplay** and **O02 persona presentation**. The game should feel like a period sports broadcast of friends playing in the Grenadier pub. Keep navy/red/cool-white captions, bold period sports typography, green felt, and featured-player framing. Pub light, rails, room ambience, friends and Betty give it a specific place. Do not reintroduce album layouts, desktop windows, neon/synthwave, or generic stadium crowds.

## Fullscreen table and broadcast overlays

The user rejected the fixed landscape control rail. Give the table the full available viewport, preserving roughly 2:1 playing-surface geometry and correctly positioned pockets. “Fullscreen” is a layout requirement, not a browser-permission/API dependency. Do not reserve a persistent right panel or bottom power deck.

Use brief TV-style score, turn, reaction and update overlays. Avoid the active finger, cue and important ball/action region; fade nonessential chrome during interaction. Keep armed/abort feedback and indispensable turn ownership intelligible. Do not relocate a control while the finger is trying to use it. Exact opacity, timing and collision avoidance are prototype hypotheses. Reduced-transparency/motion alternatives retain readable feedback. Safe-area controls, 44px minimum targets, readable text and non-color-only information remain requirements.

Portrait versus landscape remains unselected. The fullscreen rule applies to both candidates; actual thumb reach and obstruction need testing.

## Cue gesture and spin: clarified preference, provisional mechanics

The user describes touching the table and rotating the cue all the way around the cue ball. Pulling away from the cue ball is a candidate for power; they explicitly remain unsure whether pullback alone is enough and want a casual feel. Study this first, without freezing sensitivity, gain, start position, dead zone or power curve.

- Prefer one-finger drag and release, with an abort option.
- G02 aim and G03 armed/power may be phases within one contact; valid release enters G04. No mandatory Set power or Commit shot button screens.
- Show a small cue-ball contact-point control which opens a touch-sized selector for topspin/backspin/side contact, with a clear centered reset. This is a spin design, not a claim that spin physics already exists.
- Spin setting occurs outside the active shot drag; opening/changing it must not accidentally fire a shot. Collapse its overlay before the aiming gesture and retain a small status cue.
- A candidate same-finger abort is returning to neutral or sliding to a clearly signaled cancel region then lifting. Compare discoverability and accidental release in #7. Do not require a second finger or confirmation tap in the main loop.
- Pointer cancellation, interrupted contact, backgrounding or lost turn ownership disarms. Accessible button/keyboard alternatives may coexist separately.

## One live match; previous inbox deferred

**One live active match for now.** The user explicitly withdrew the multiple-simultaneous-matches idea as too complex. E01 offers entry/resume for the current match, not an inbox. A live turn-based match may last a long time and still needs update/reload/reconnect restoration. Do not infer that “single mode” means single-player: the user still wants friends, 2 v 2 and winner-stays-on.

A possible excessive-delay penalty is only an idea. Distinguish turn expiry, extra visits and whole-match forfeiture; duration, warnings, pauses and disconnect fairness are unresolved. Proposed casual default: no automatic shot clock until agreed. No accounts/networking/store is implemented by these mockups.

## Pub scene and Betty

After balls settle, explore a short, skippable/event-based pullback showing seated people and the incoming player stepping up. Return to stable top-down view before input. Never move the camera during aim or shot motion or force a long sequence after every shot. Use a static/cut alternative for reduced motion.

The user supplied relative room layout: bottom/back-wall bar (middle third or longer), pool table to its left, seats/tables beyond the pool and around the bar, foyer/entrance immediately above the bar with toilets to its left and right, and a roughly mirrored right social area **without a second pool table**. See [pub-layout.svg](pub-layout.svg). This is a schematic interpretation, not a measured plan or finished 3D model. #16 retains that later asset work.

**Betty** is the landlady, described by the user as a “battleaxe” who might bar you. Include a formidable, humorous character presence with a labeled placeholder until her likeness/voice is supplied. Any invented caption is proposed game writing, not a real quote. Barring is an optional between-shot/post-game interlude concept; triggers/effects remain open. Preserve the match rather than silently wiping progress or inventing a competitive penalty.

## Formats and after-game play

The user wants both **2 v 2 teams** and **winner stays on**. Their earlier “killer”/50p challenger description is a house-game idea, not adoption of a standardized Killer ruleset. Team membership, teammate rotation, foul/extra-visit handling, break exceptions and challenger queue need later #10/#12 rules work. No real payment system is specified.

After a competitive result, allow **post-game knockabout**: leave remaining balls on the table, let either player nominate even a non-cue ball as the struck ball, and enjoy potting them without changing the recorded result. Expose an explicit **Re-rack** action for the next setup; do not reset automatically when the match ends. Return to normal cue-ball/rule constraints for the next competitive match. Multiple people's requests still need safe shot arbitration; no simultaneous-ball simulation/network policy is selected here.

[House-rule options](house-rules-notes.md) explain the distinction between two visits and two shots, early black and legal winning black. These are guidance/proposals; the user's uncertainty is not recorded as an approved ruleset.

## Friends and sound

Photo identities remain Trod, Craig, Shacka, Maaaaark, left to right (#14). Identify computer counterparts clearly. Do not invent individual traits, teams, or a Betty likeness from that photo.

Pool sound leads: cue contact, ball clicks, cushions, pocket/return. Add a quiet room bed and sparse between-shot glass/chair/chalk/coin detail, not obligatory commentary or musical stings. [Sound direction](sound-direction.md) specifies the palette and acquisition path. No final recordings exist. Respect mute/levels, captions, reduced sensory load, and quiet resume without replaying old sounds.

## Handoff

#6 delivers fullscreen gameplay/persona mockups, a single-match resume concept, spin/abort storyboard, post-game knockabout/re-rack concept, pub/Betty scene study, tokens/audio/accessibility notes and targeted captures. These are design artifacts, not physics, a finished 3D scene or a full match implementation. #15 publishes them; #7 tests the touch feel next. Physical iPhone findings remain in #4/#8 and are not inferred from the user's visual choice.

## Pixel caricatures and design-only scope

The user explicitly confirmed that current work is planning and designing the look/feel, not building the app. Do not advance to playable implementation as part of this design revision.

Use selective pixelation, definitely on friend portraits, which must be caricatures rather than straight photo crops. C1 in `selected/assets/friends-pixel-caricatures-v1.png` is the first generated design sample using the supplied photograph, preserving Trod, Craig, Shacka, Maaaaark left to right. Its background is invented atmosphere. Likeness and exaggeration remain subject to design feedback. Maintain Sports Broadcast framing; pixel texture can extend to pub/table art and transitions while aiming cues and labels stay readable.
