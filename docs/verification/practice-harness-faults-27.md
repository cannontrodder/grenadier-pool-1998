# Practice harness fault checks · #27

18 September 2026. WebKit, 390 × 844. All five faults were verified first
against built revision `e2ec370bbc500d4b61dd320c089cfab02f405cfd`, then repeated
with durable journals against `e2ec370bbc500d4b61dd320c089cfab02f405cfd-dirty`
(the integrating agent's isolated layout-select CSS change). Each bundle records
its actual identity. These are local browser checks, not physical Safari evidence.

## Bounds and classification

The runner retains its 50-second outer budget. Browser checks bound each wrapped
action to 3.5 seconds, observation read to 2 seconds, normal freshness polling to
2 seconds, and this injected progress expectation to 1.5 seconds. A timed-out
progress expectation gets one 1.2-second freshness check before classification.
Screenshots have a 2-second failure-capture bound. At most one reload health probe
runs after a harness failure. Original evidence is written before that probe;
probe success never changes `FAIL` into a pass. Sessions now default to unique
names, preventing simultaneous runs from closing each other's browser.

`--fault` reports `EXPECTED FAILURE` and exit 0 only when injection was reached
and the actual failure classification and signature match that fault. The
underlying result always remains `FAIL`. A setup failure or undetected fault
exits 1. Normal gameplay cases retain their normal success semantics.

| Injection | Actual mechanism and safeguard | Result | Browser check / commands through failure |
| --- | --- | --- | --- |
| `missing` | Drop the observed sample; ordinary contract guard rejects it | harness-failure | 128 ms / 3.676 s |
| `stale` | Freeze a sample; ordinary freshness poll reaches its 2 s deadline | harness-failure | 2.185 s / 5.514 s |
| `action-timeout` | Disable the real Re-rack button; ordinary locator click cannot complete | harness-failure | 3.655 s / 7.072 s |
| `stalled-progress` | Swallow the real pointer release at capture; expected shot progress never starts, while rendered observations keep advancing | game-failure | 1.731 s / 5.078 s |
| `disconnect` | Close the actual browser, then attempt an ordinary observation through the CLI | harness-failure | outer commands 4.545 s |

The stalled case proves that a fresh healthy observer does not imply successful
game progress. It deliberately tests a swallowed release, not an internally
frozen physics engine. Unprovable observer health instead returns `uncertain`.

Browser close can kill the CLI worker before it returns. The runner therefore
persists a checkpoint first, closes the browser, and detects the real subsequent
CLI error. The pre-disconnect screenshot remains useful when a post-failure
screenshot is impossible. Its one reload probe also fails because the browser
is closed; the original result is retained.

Failure bundles contain identity, separate last-16 action and observation
histories, bounded errors, and screenshots. Missing/stale injection occurs only
after healthy initial observations and identity have been captured. No game
runtime or observation API mutations were needed.

A runner-owned loopback HTTP sink persists the compact journal after every
wrapped action, observation and screenshot, using a random per-run endpoint,
128 KiB body limit, last-16 histories, one-second request/body-read limits, atomic
writes and shutdown in `finally`. This journal survives an unexpected CLI-worker
exit; the outer failure handler includes it alongside actual command diagnostics.
The runner passes `harnessJournal` to all suites; this commit wires the producer
in `browser-check.js`. Integration must wire the same producer in placement,
native-touch and motion suites before claiming their unexpected-exit coverage.

An additional **normal pot run without `--fault`** was externally closed after
its first actions. It stopped with exit 1 / `uncertain` because observer health
could not be proved, retaining real actions, observations, identity and the
initial screenshot. It was never counted as a pass. The command used was
`playwright_cli.sh -s=faults27-unexpected close` while the ordinary `--case pot`
run was active. Its persisted journal is independent of the CLI process.

## Reproduce

Serve the built practice bundle on port 8765. Run each fault with:

```bash
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8765/practice/ --fault missing
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8765/practice/ --fault stale
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8765/practice/ --fault action-timeout
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8765/practice/ --fault stalled-progress
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8765/practice/ --fault disconnect
python3 scripts/practice/run-browser.py --url http://127.0.0.1:8765/practice/ --case interaction
```

The normal interaction regression passed all **64 assertions**. Python syntax
compilation passed. `--case motion` dispatch was added for the integrating
agent's separate motion script; its validation belongs to the integrated report.

## Evidence

Final checks with journals (original immutable diagnostic results; screenshots
are referenced in each JSON):

- [missing](../../output/playwright/practice/practice-webkit-interaction-1789768184701332000-390x844-1789768184701332000.json)
- [stale](../../output/playwright/practice/practice-webkit-interaction-1789768190802653000-390x844-1789768190802653000.json)
- [action-timeout](../../output/playwright/practice/practice-webkit-interaction-1789768198757454000-390x844-1789768198757454000.json)
- [stalled-progress](../../output/playwright/practice/practice-webkit-interaction-1789768208308875000-390x844-1789768208308875000.json)
- [disconnect](../../output/playwright/practice/practice-webkit-interaction-1789768214051759000-390x844-1789768214051759000.json)

- [Normal interaction: 64 assertions](../../output/playwright/practice/practice-webkit-interaction-1789768132171762000-390x844-1789768132171762000.json)
- [Unexpected external disconnect](../../output/playwright/practice/faults27-unexpected-390x844-1789768169211358000.json)

Earlier exact `e2ec370` build checks, before the journal refinement:

- [missing](../../output/playwright/practice/practice-webkit-interaction-1789767994499986000-390x844-1789767994499986000.json)
- [stale](../../output/playwright/practice/practice-webkit-interaction-1789768000524947000-390x844-1789768000524947000.json)
- [action-timeout](../../output/playwright/practice/practice-webkit-interaction-1789768008548758000-390x844-1789768008548758000.json)
- [stalled-progress](../../output/playwright/practice/practice-webkit-interaction-1789768017878168000-390x844-1789768017878168000.json)
- [disconnect](../../output/playwright/practice/practice-webkit-interaction-1789768023597081000-390x844-1789768023597081000.json)
