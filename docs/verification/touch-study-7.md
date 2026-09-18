# Touch study verification · #7

Exact application revision: **d4f83f24786a089113ffce74a3f4525c6be609d5**, T1.1, scenario `two-ball-centre-v1`, retained on `prototype/touch-study-7`. Original starting point: `173c39c6388ca6f1899037c190a8ecd6bfc251a5`. Later evidence-only commits do not change the deployed application source.

## Passing checks

- Eight focused Node model tests: complete orbit, single release, same-finger abort, every interruption followed by stale release, second-pointer rejection, monotonic/clamped curves, deterministic bounded reset/motion, gentle/default/full-power tuning and safe high-strength contacts.
- WebKit iPhone 13 emulation at **390×844**, **844×390**, **320×568**: **30 assertions each**.
- Chrome Pixel 7 emulation at **412×839**: **30 assertions**.
- Chromium native CDP touch: **9 assertions**, including a complete circular touch path, arm/release, inward abort and native touch cancellation. This is browser-emulated touch, not a physical Android or iPhone.
- Scenario/build identity, freshness, no document overflow, 44px table and sheet controls, button/keyboard alternative, both mapping options, spin/centre reset, simulated mid-gesture ownership loss, reduced-motion preference and no page errors pass.
- Moving SVG centers match observation coordinates within 1 CSS pixel. Nonzero velocities, position progress, and bounded settling are checked over time. Portrait/landscape/narrow ready/armed/motion captures were inspected; six pockets remain on the correct rails, armed text remains readable, and nonessential chrome fades.
- Deliberately stale and missing observations both stop as harness failures, preserve diagnostics, and perform at most one reload health check. Neither failed run becomes a pass.

Evidence lives under `output/playwright/touch-study/`. Each timestamped JSON contains results and command transcripts; each result records its source revision. Select T1.1 records with revision `d4f83f24786a089113ffce74a3f4525c6be609d5`. Ready/armed/motion PNGs are the targeted checkpoints; `failure-*`, `native-failure-*` and `recovery-*` preserve earlier diagnoses and injected failures.

## Resolved failures retained as evidence

Early captures used a development marker before revision stamping. An early reduced-motion check sampled before WebKit propagated the emulation change; a bounded predicate wait corrected it. Formatting added a trailing semicolon to CLI function snippets; the retained syntax failure was fixed. Native touch input acknowledgement was sampled too early; bounded frame acknowledgement now precedes assertions. Review corrected failure classification. WebKit's select needed explicit height/appearance. Initial hosted T1 checks sampled before asynchronous revision fetch completed; the harness now waits at most five seconds for exact revision availability. None of those original runs is counted as a pass.

Synthetic background/blur/capture-cancellation coverage tests browser event handlers; it does not claim an actual mobile OS interruption. Resize is performed through the browser viewport. The timed turn-loss button is a normal UI action, and direct shot inputs follow the player's event path. Harness failures preserve the last observations/actions and targeted screenshots before recovery. A healthy stream supports game-failure attribution; otherwise timeout diagnosis stays explicitly uncertain.

## Feedback incorporated · #23

The user tried local T1 and preferred the nonlinear feel, asked for more power while retaining light taps/full travel, and wanted a menu setting. Device and Safari identity were not provided; this is not physical-iPhone evidence or final acceptance. T1.1 defaults to Gentle start, offers 0.5–3× strength (1.8× initially), and tucks the button controls into Menu's expandable alternative. Reset preserves review settings. At default strength the weakest armed tap is about 68 world units/s and full pull is 2400, versus the original maximum 1080. Full drag distance and abort threshold stay unchanged.

## Run, fidelity and remaining review

See `docs/design/touch-study/README.md` for the one-command local run, observation/action contract, harness commands and phone script. Two-ball rolling/cushion/contact simulation is approximate; pockets are visual only and the contact selector records spin without simulating it. No match rules, persistence, AI, networking or room scene is implemented.

S1.4/M1.2 remains governing. #6 is complete; #4 and #20 remain open and non-blocking. #8 records hosted smoke results, the stable phone link, physical Safari findings and explicit acceptance. Actual thumb reach, occlusion, abort reliability and orientation remain hands-on questions. #9 is not started.
