# Touch-study findings · T1.1 · 18 September 2026

The focused prototype requested in the [handoff](../handoffs/next-agent-touch-study.md) is implemented, reviewed and privately deployed. The prototype remains on `prototype/touch-study-7`; main retains these findings and pointers, not the throwaway implementation. #7 is complete. #8 remains open for physical iPhone Safari evidence and explicit acceptance. #4 and #20 remain accurately open; #9 has not been started.

- [Open the private touch study](https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/touch-study/).
- Exact application revision: `d4f83f24786a089113ffce74a3f4525c6be609d5` (T1.1). The existing design review is preserved alongside it. Sign into the owning account on the phone.
- [Run instructions and observation contract](https://github.com/cannontrodder/grenadier-pool-1998/blob/prototype/touch-study-7/docs/design/touch-study/README.md).
- [Verification/evidence](https://github.com/cannontrodder/grenadier-pool-1998/blob/prototype/touch-study-7/docs/verification/touch-study-7.md) and [two-axis review](https://github.com/cannontrodder/grenadier-pool-1998/blob/prototype/touch-study-7/docs/verification/touch-study-review-22.md).

## What the study has established

One captured pointer can orbit, pull, return inward to abort, or release into bounded motion; interruption disarms and delayed release is ignored. The same world coordinates map to portrait and landscape rendering. Compact observations can support programmatic play with freshness, progress, failure classification and preserved diagnostic evidence. These are verified implementation behaviors, not proof that the touch feel is accepted on a physical phone.

Eight focused model tests, 30 assertions in each of three WebKit sizes (390×844, 844×390, 320×568) and Chrome/Pixel 7 (412×839), plus nine native browser-touch assertions pass. Deliberate stale/missing observation runs stop with retained evidence. Hosted smoke checks confirm the exact source marker, input loop, reset and observation contract. Browser emulation remains distinct from physical Safari.

## User feedback incorporated in #23

The user tried the local initial study and preferred nonlinear pull for gentle taps, wanted much more energy at full power, and requested a menu tuning setting while preserving full travel. Button shot controls were useful for exploration but are probably not needed in the final direct-shot interface. Device/browser identity was not supplied, so this is not physical-iPhone evidence.

Gentle start is now the default. The menu exposes **Shot strength, 0.5–3×, initially 1.8×**. It changes impulse without shortening the gesture: neutral/arm remains 18.9 CSS px beyond the initial radius; full pull is 127px. Default full-power speed is 2400 world units/s versus the initial 1080, while the weakest armed tap is about 68. Mapping/strength survive Reset within the page; reload restores defaults. The button/keyboard alternative is collapsed inside Menu. These numeric defaults still need hands-on tuning.

## Boundary and next evidence

This is an approximate two-ball response, with simple rolling, contact and cushion reflection. Pocket mouths are visual only; spin contact is recorded but has no physical effect. No rules, match, persistence, AI, networking, payments, knockabout or 3D room was built.

In #8, record physical iPhone model/iOS/Safari, preferred strength, successful and accidental aborts, handedness/occlusion, and portrait versus landscape. Preserve the user's explicit nonlinear preference; do not infer final acceptance from it. #9 can plan the later production slice after that review; it is not implemented here.
