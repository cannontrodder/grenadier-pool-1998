# First playable table review · #28

Independent Standards and Spec agents reviewed base
`8381e5319f459e773683506aaf00f10e50ef321e` through candidate
`24a500dfa13b8610add0656e4d6acaa15ba0a909`, including the phase spec A1–A8,
accepted #32 amendment, runtime, tests, public build and retained failure evidence.
Final approved source: `ca3d68869cc08a9f646384bb9ae7716c947a344b`.

## Standards

One actionable harness responsiveness gap: raw CDP touch dispatch and motion
mouse operations lacked the specified 3.5-second action deadline. They could
consume the 50-second outer budget on stalled transport. Durable journals and
failure classification already prevented false passes; gameplay was unaffected.

The fix bounds native dispatch plus motion mouse and keyboard operations. The
Standards reviewer inspected the fix and confirmed no remaining material gaps,
subject to affected reruns. All three passed: native Chromium 412×839 (19),
motion Chromium 412×839 (25), and motion WebKit 390×844 (25): **69 assertions**.
Evidence is `review28-*.json` and its linked journals/screenshots under
[output/playwright/practice](../../output/playwright/practice/).

Nonblocking judgment: shared journal, history and bounded-operation helpers are
duplicated across harnesses. Consolidation can accompany future safeguard work;
this does not justify a broad refactor of the reviewed candidate.

No other material findings in pointer ownership/cancellation, consumed placement
contacts, epoch rejection, pure simulation ownership, immutable observations,
keyboard alternatives, public allowlist or documented architecture.

## Spec

No missing, partial or incorrectly implemented A1–A8 requirements found. Review
covered calibration/abort, pocket admission, settling, three layout clears,
invalid/legal placement, fresh-contact shooting, keyboard alternatives and
resets. Clear takes precedence over white replacement; stale epochs cannot
change a re-rack. Ordinary controls drive browser journeys; observations are
frozen and read-only. No unauthorized future-phase gameplay was introduced.

The original geometry-correlation failure remains distinct from its passing
replacement. All six fault records retain FAIL. Synthetic visibility evidence
is accurately limited and does not claim physical iOS lifecycle coverage.

## Approval boundary

The approved commit changes only the harness/evidence from the initial candidate.
The `practice/` runtime remains byte-identical to tested `aa9781e`; the
[full integrated verification](practice-loop-27.md) therefore applies. No
prototype branch changes were made. Deployment and actual phone feedback are
A9 work in #29; this review does not establish physical-phone acceptance.
