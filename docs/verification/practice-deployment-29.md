# First playable table publication · #29

The reviewed runtime is live at
[the friends' practice link](https://cannontrodder.github.io/grenadier-pool-1998/).
Implementation (#25/#26), integrated verification (#27) and independent review
(#28) are complete. **Physical-phone feedback is pending.** #29 stays open and
#10 remains blocked; Phase 3 is not yet marked delivered.

## Deployment and identity

Initial deployment: `41a5002a8b21222e415eb82bf946a861a4424473`,
[successful workflow](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35399911252).
Final publication source: `d2ba2347213ed67df7af73c55130654265a943f7`.
The additional commit changes the reviewed harness only; runtime files remain
byte-identical to the first deployment. Its workflow is
[35400216561](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35400216561).
The runtime matches the [reviewed source](practice-review-28.md) and the complete
[local A1–A8 matrix](practice-loop-27.md). CI passed all 50 model/input tests.
The public build contains nine runtime files, favicon, revision marker and
`.nojekyll`; no design photos, documentation or diagnostic bundles are copied.

## Hosted checks

All 11 application resources were fetched anonymously over HTTPS and matched
the local public build byte-for-byte. Source/documentation/evidence paths return
404. An initial ad-hoc assertion incorrectly expected the hidden `.nojekyll`
build marker to be publicly served; its 404 is recorded in `hosted29-http.json`
and the corrected check excludes that marker from application-resource checks.

A hosted Straight pots journey passed 70 gameplay assertions, but its final
identity was `local-unbuilt`: reload readiness preceded the asynchronous revision
fetch. Its journal retained the actual deployed identity through the clear and
reset checks. This attempt is preserved and excluded from fully verified totals.
The harness now waits at most two seconds for a resolved initial revision and
for that same revision after both reload journeys. A separate Standards review
approved this narrow harness-only fix; timeout remains a failure. The runtime
was unchanged.

Hosted browser results: **10 successful cases / 435 assertions**. At initial
revision `41a5002`, WebKit portrait pointer placement (23), keyboard placement
(15), tuning (43), all three layout clears (70 each), WebKit landscape potting
(40), and Chromium native placement (11) passed: 342 assertions. At final
revision `d2ba234`, fresh placement (23) and Straight pots clear/re-rack/reload
(70) passed: 93 more. Runtime bytes are identical across both deployments.
Final publication CI also passed all 50 tests, and all 11 application resources
match the final public build. Screenshots of invalid/legal placement and cleared
layouts were inspected alongside atomic rendered-state checks.

Evidence under [output/playwright/practice](../../output/playwright/practice/):
`hosted29-layout-report.json`, `hosted29-*-summary.json`, linked original
journals/screenshots, `hosted29-final-http.json` and
`hosted29-final-deployment.json`. The original incomplete identity attempt is
excluded from the successful total. The earlier full local matrix remains
intact; no physical-phone outcome is inferred.

## Preserved references

The design-preview and `/touch-study/` source/routes are unchanged. Both local
built routes return 200. The preserved `prototype/touch-study-7` branch remains
`059a7e8212999c966da0e8bacfc445acc6502c5d`. The private Sites URLs return 403 to
anonymous requests; authenticated access has not been reverified and is not
claimed as a passing live check. This GitHub Pages deployment does not modify
that private Sites deployment.

## Phone check requested

The owner was given the live link and asked to try gentle/full shots, Menu →
strength, corner and side pots, white replacement after a scratch, all three
layouts and clear/re-rack in portrait and landscape, with phone/browser details
where possible. White placement uses a tap or drag to clear felt; red invalid
previews cannot commit. Release places the white; a fresh contact aims the next
shot. The keyboard placement alternative is in Menu.

No physical-device result has been supplied for this build. Desktop WebKit and
CDP native touch do not substitute for physical iPhone/Safari or Android use.
Record explicit acceptance or requested corrections in #29 before closing it.
