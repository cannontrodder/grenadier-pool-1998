# Touch-study findings · T1.1 · 18 September 2026

The focused prototype requested in the [handoff](../handoffs/next-agent-touch-study.md) is implemented, reviewed and privately deployed. The prototype remains on `prototype/touch-study-7`; main retains these findings and pointers, not the throwaway implementation. #7 is complete. #8 is complete following explicit user acceptance and confirmation of use on a physical device. #4 and #20 remain accurately open; #9 now defines the [first playable table phase](../phases/first-playable-table.md).

- [Open the private touch study](https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/touch-study/).
- Exact application revision: `d4f83f24786a089113ffce74a3f4525c6be609d5` (T1.1). The existing design review is preserved alongside it. Sign into the owning account on the phone.
- [Run instructions and observation contract](https://github.com/cannontrodder/grenadier-pool-1998/blob/prototype/touch-study-7/docs/design/touch-study/README.md).
- [Verification/evidence](https://github.com/cannontrodder/grenadier-pool-1998/blob/prototype/touch-study-7/docs/verification/touch-study-7.md) and [two-axis review](https://github.com/cannontrodder/grenadier-pool-1998/blob/prototype/touch-study-7/docs/verification/touch-study-review-22.md).

## What the study has established

One captured pointer can orbit, pull, return inward to abort, or release into bounded motion; interruption disarms and delayed release is ignored. The same world coordinates map to portrait and landscape rendering. Compact observations can support programmatic play with freshness, progress, failure classification and preserved diagnostic evidence. These are verified implementation behaviors, not proof that the touch feel is accepted on a physical phone.

Eight focused model tests, 30 assertions in each of three WebKit sizes (390×844, 844×390, 320×568) and Chrome/Pixel 7 (412×839), plus nine native browser-touch assertions pass. Deliberate stale/missing observation runs stop with retained evidence. Hosted smoke checks confirm the exact source marker, input loop, reset and observation contract. Browser emulation remains distinct from physical Safari.

## User feedback incorporated in #23

The user tried the local initial study and preferred nonlinear pull for gentle taps, wanted much more energy at full power, and requested a menu tuning setting while preserving full travel. Button shot controls were useful for exploration but are probably not needed in the final direct-shot interface. Device/browser identity was not supplied, so this is not physical-iPhone evidence.

Gentle start is now the default. The menu exposes **Shot strength, 0.5–3×, initially 1.8×**. It changes impulse without shortening the gesture: neutral/arm remains 18.9 CSS px beyond the initial radius; full pull is 127px. Default full-power speed is 2400 world units/s versus the initial 1080, while the weakest armed tap is about 68. Mapping/strength survive Reset within the page; reload restores defaults. The button/keyboard alternative is collapsed inside Menu. The user subsequently accepted the revised study as a whole; no separately chosen strength value or orientation was supplied.

## Explicit acceptance · issue #8

Following delivery of T1.1 (`d4f83f24786a089113ffce74a3f4525c6be609d5`), the user said **“I like it all.”** Record this as acceptance of the revised touch study, including the nonlinear response and menu tuning approach, with no further corrections requested. The user then confirmed: **“I am. I used it on a physical device. I’m happy with it.”** This supplies the remaining hands-on confirmation and explicit acceptance, so #8 is complete. Exact device model, OS/browser version and separately chosen strength/orientation were not supplied; leave those metadata unspecified rather than inventing them. The user requested no further correction.

## Boundary and next evidence

This is an approximate two-ball response, with simple rolling, contact and cushion reflection. Pocket mouths are visual only; spin contact is recorded but has no physical effect. No rules, match, persistence, AI, networking, payments, knockabout or 3D room was built.

The user has accepted the study after physical-device use. Preserve the nonlinear response, full pull range, same-finger abort and menu tuning approach as inputs to #9. Exact device metadata, a preferred numeric strength and a single chosen orientation remain unspecified; they do not reopen the accepted study. The resulting planning work is recorded in the [Phase 3 spec](../phases/first-playable-table.md); no production gameplay is implemented by the study or its planning issue.
