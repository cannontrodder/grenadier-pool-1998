# Sound direction · S1.2 · issue #6

Status: implementation guidance, not an audio delivery. **No audio samples have been supplied or added to the repository.** Cue names below are proposed slots; they do not describe finished demos or the real acoustics of the Grenadier.

## Listening target

Make the shot sound satisfying before the pub announces itself. Cue tip, balls, cushions and pocket are close, dry and easy to distinguish on a phone. A low, unhurried room bed and one occasional material detail place the table in a late-1990s pub between shots. The visual direction is a sports broadcast; the sound remains a pub pool table rather than a stadium broadcast.

Avoid continuous commentary, crowd or stadium beds, synthetic arcade effects, mandatory music, and a sting after every shot. A brief broadcast sting may be tested later for a exceptional result or match end, but is not in the core manifest. Do not invent friend voices, reactions or traits. Betty, the stern landlady the user described as a “battleaxe,” may occasionally interrupt between shots and might bar the player; her dialogue, trigger and game consequence remain open.

## Mix hierarchy and behaviour

1. **Shot truth:** cue contact, ball contact, cushion and pocket events are P0. Trigger them from simulation events, never from animation timing. Keep transients clear and mono-compatible; a phone must communicate the shot with ambience disabled.
2. **Room presence:** the room bed is P1, quiet under play and gently raised only after all balls settle. It should suggest a small occupied room without identifiable speech, music or a crowd swell.
3. **Between-shot detail:** chalk, a glass set down, a short chair movement, or a return-tray/coin mechanism occurs at most once in a handover and never on every turn. Use only when the visible/state context supports it. A coin mechanism does not imply payment or settle the future 50p rules idea.
4. **Betty interruption:** reserve an optional P2 slot for a sparse, between-shot interruption. No Betty voice, likeness or recording has been supplied, and none should be synthesized or acquired under this issue. Use the neutral caption placeholder `[Betty interrupts]`; do not write dialogue, imitate a real person, or turn the interruption into sudden match loss. Any warning/barred state needs a separately agreed trigger and visible, recoverable game-state treatment.

Relative implementation targets are starting points for phone testing, not mastering claims: pool impacts `0 dB` reference, pocket/return `-3 dB`, material detail `-14 dB`, and room bed `-22 dB`. Duck the room bed by `6 dB` when the shot is released, hold it through motion, then restore it 350 ms after the last material collision with a 250 ms release. Between-shot detail yields to any new shot immediately. Limit the master conservatively and check at low handset volume, with one speaker covered, and in mono. Do not make audio carry rules or turn ownership by itself.

Each repeated physical event needs several original takes selected without immediate repetition. Vary sample choice and gain slightly; do not randomize timing or pitch enough to change the apparent physics. Map cue and ball/cushion intensity to three velocity bands after the physics model exposes stable values. Until then, use the middle layer. Rate-limit dense ball-contact playback while retaining the first and strongest impacts; tune the exact limit against real breaks rather than guessing it in the design artifact.

The machine-readable cue slots and initial values live in [`sound-cues.json`](sound-cues.json). The same physical cue palette can support post-game knockabout, including a nominated non-cue striking ball, while result/turn stings remain disabled in that unscored mode. P0 is enough for the first playable table slice. P1 and P2 can remain silent without blocking gameplay.

## Controls, captions and lifecycle

- Keep audio controls always reachable through pause/settings, without adding a permanent gameplay rail: `Sound off`, `Effects only`, and `Full sound`. Remember the choice per device and expose the current state in text, not by icon alone. First visit may default to full sound, but playback begins only after a deliberate tap/gesture has enabled it.
- Caption gameplay-significant cues in a compact live region, for example `[cue strike]`, `[ball hits cushion]`, and `[ball pocketed]`. Coalesce collision bursts into `[balls collide]`; do not flood the screen per ball. Decorative ambience captions such as `[low pub room tone]` appear when the bed begins or materially changes, not continuously. Captions remain available when sound is muted.
- Creating or resuming the one live, turn-based match must not play a backlog. Restore the saved sound preference, show it, and leave the audio context silent/suspended until the player's next deliberate interaction. Events that happened while the app was hidden are not replayed. On backgrounding, fade/suspend the bed; on return, restart it only after playback remains permitted and the match is foregrounded.
- Web playback must handle rejection or suspension as a normal state. MDN recommends creating or resuming a Web Audio context from a user gesture; WebKit documents direct `touchend`, `click`, `doubleclick`, or `keydown` handlers as qualifying iOS media gestures ([MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [WebKit iOS media policy](https://webkit.org/blog/6784/new-video-policies-for-ios/)). Await the enable/resume result and leave a visible retry when playback is denied ([MDN `play()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play/), [MDN `AudioContext.resume()`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume/)). The enabling gesture may be the explicit `Enter match`/`Resume match` action. Do not consume the first shot gesture merely to unlock sound.

## Original recording plan

Original pool foley is the preferred core because it gives a coherent table and avoids pretending a library ambience is the Grenadier. Record in a controlled, permissioned room with a real table; document location type, table type, recorder/microphone, creator, date, consent, and intended licence. Do not label the result “Grenadier 1998” unless evidence later supports that claim.

Record isolated takes with the room otherwise still:

| Slot | Shot list | Minimum useful takes |
| --- | --- | ---: |
| Cue | soft / medium / firm centre-ball strikes; one miscue for a later rules state | 6 per valid strength, 3 miscue |
| Ball | single collision at soft / medium / hard speeds; compact break scatter | 8 per strength, 5 breaks |
| Cushion | shallow and square impacts at soft / medium / hard speeds | 6 per strength |
| Pocket | corner and side pocket drops, with return tray isolated if the table has one | 5 per pocket type |
| Handling | chalk cube, cue lifted/set down, bridge hand or sleeve movement | 5 each |
| Pub material | glass set on wood, short chair shift, door latch, coin/return mechanism if present | 4 each |
| Room bed | controlled room at play and between shots, with no intelligible conversation or recognisable music | 2–3 takes of 60–90 s |

Capture a close microphone for the physical cue and a modest room microphone for optional space. Leave headroom, record 10 seconds of clean room tone, and slate takes rather than speaking over tails. For the bed, arrange consenting participants to make non-verbal, low-key presence or record a quiet room; discard any take containing intelligible bystander speech, names, private conversation, television/radio or recognisable music. Record voices only under a separate, explicit persona-content decision.

Edit non-destructively, remove handling noise around isolated events, make loops seam-free, and retain the untouched masters outside the runtime bundle. Export short effects as lossless masters plus web delivery files; test codec support in the eventual implementation rather than locking it here. Loudness-match variations by ear and meter while preserving real differences in impact.

## Acquisition fallback and provenance

No sound has been acquired in this issue. If original sessions cannot cover a slot, shortlist individual library files and record for each one: stable source URL/ID, title, creator, downloaded date, licence and version, required credit, original filename, edit chain, and the cue slot that uses it. Keep a copy of the licence/metadata alongside the source master.

Preferred order:

1. Original, permissioned recordings for all P0 pool cues and the room bed.
2. Freesound files licensed **CC0** or **CC BY** for isolated gaps. Freesound says each upload carries its own selected licence ([Freesound licensing FAQ](https://freesound.org/help/faq/), [Freesound terms](https://freesound.org/help/tos_web/)). [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) permits reuse without permission; [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) permits commercial reuse with appropriate credit, licence link and an indication of changes. Exclude CC BY-NC and older Sampling+ assets from this project baseline so future distribution is not constrained. Verify each asset page at acquisition time; a search result is not provenance, and CC0 does not remove unrelated privacy or publicity concerns.
3. BBC Sound Effects only as listening/search reference unless a suitable distribution licence is deliberately obtained. Its free RemArc licence is limited to eligible non-commercial personal, research or educational use and restricts sharing the content itself; commercial use requires separate licensing ([BBC RemArc licence](https://sound-effects.bbcrewind.co.uk/licensing), [BBC Sound Effects FAQ](https://sound-effects.bbcrewind.co.uk/faqs)). Do not copy BBC files into the repository under this design task.

Search terms for later shortlisting: `pool cue ball close`, `billiard balls collision`, `pool cushion impact`, `pool ball pocket drop`, `coin operated pool return`, `wood chair short scrape`, `glass set on wood`, `small pub room tone no music`. Audition for a single believable acoustic family; reject exaggerated reverb, bowling-like collisions, audible contemporary music, intelligible speech, and crowd/stadium material.

## Acceptance checks for the prototype

- With ambience muted, a listener can distinguish cue, collision, cushion and pocket on an iPhone-class speaker at low volume.
- Muting never hides game state; captions communicate significant events and do not overwhelm a break.
- Repeated gentle shots do not expose obvious same-sample repetition.
- The pub bed disappears beneath a shot and returns without pumping; it contains no intelligible speech or music.
- Opening or resuming the live match is silent until a deliberate user interaction permits sound, and it never replays historical turn events.
- A Betty interruption is optional and sparse, appears only between shots, and cannot unexpectedly discard or end the live match.
- Asset records can identify the source, rights and edits for every shipped file. A silent asset fallback passes when a licensed/recorded cue is absent.
