# Phase 3 planning readiness — issue #9

Planning only, 18 September 2026. No gameplay implementation, build, deployment or physical-device test is claimed by this record.

## Scope evidence

The user accepted the T1.1 touch study after physical-device use, then selected **Three-ball practice layouts** and **Place the white ball yourself**. After receiving the concrete six-ticket breakdown and draft, the user directed the agent to have everything created ready to start work on issues. The [phase spec](../phases/first-playable-table.md) records that package, preserving nonlinear power, full pull range, same-finger abort and adjustable strength. No new chat or handoff file was created.

## Bounded background work

- Research: `gpt-5.6-sol`, medium effort, read-only investigation of simulation/render separation, pocket/collision risks and harness boundaries. Its cited [research note](../research/phase3-simulation-harness.md) is retained.
- Planning review: `gpt-5.6-sol`, medium effort, independent read-only scope/readiness audit. Findings resolved: foundation owns settling/admission and clear-before-placement precedence; complete pointer-driven clear for every layout; separate keyboard coverage; contact energy bounds; physical acceptance remains the final delivery gate. Final small corrections made A5's post-settle transition conditional, made pointer coverage explicit in #25, and removed draft status.
- Primary session integrated the documents and issues and independently checked publication state.

## Tracker audit

Read back issue bodies, labels, milestone and native blocker relationships from GitHub after publication. All six issues are open, in milestone 3 and labelled ready-for-agent; each includes acceptance checks, artifact references, model/effort guidance and completion evidence requirements.

| Issue | Native blocked by |
| --- | --- |
| [#24 — Working table](https://github.com/cannontrodder/grenadier-pool-1998/issues/24) | None |
| [#25 — Layouts and clear/re-rack](https://github.com/cannontrodder/grenadier-pool-1998/issues/25) | #24 |
| [#26 — White placement](https://github.com/cannontrodder/grenadier-pool-1998/issues/26) | #24 |
| [#27 — Integrated verification](https://github.com/cannontrodder/grenadier-pool-1998/issues/27) | #25, #26 |
| [#28 — Independent review](https://github.com/cannontrodder/grenadier-pool-1998/issues/28) | #27 |
| [#29 — Deployment and phone acceptance](https://github.com/cannontrodder/grenadier-pool-1998/issues/29) | #28 |
| [#10 — Next phase planning](https://github.com/cannontrodder/grenadier-pool-1998/issues/10) | #29 |

The native graph is acyclic and matches the document graph. #25/#26 only share the completed foundation; their UI work can proceed in separate worktrees. The harness starts with #24 and grows with each gameplay ticket. #27 is integrated proof and diagnostic fault testing, not delayed harness creation. #29 explicitly stays open while feedback/corrections remain. Historical #4/#20 design review issues are not added as blockers.

## Repository checks

- All changed Markdown local references resolve, and issue-body artifact references target the resulting committed documents and preserved prototype revision.
- `git diff --check` passes. Changes are documentation only: phase spec, research, this audit, domain terms and current brief/plan/index/findings pointers.
- Local and remote `prototype/touch-study-7` remain at `059a7e8212999c966da0e8bacfc445acc6502c5d`; the accepted application source remains `d4f83f24786a089113ffce74a3f4525c6be609d5`. No prototype implementation was merged.
- Planning completion does not claim A1–A9 gameplay acceptance. Those checks belong to #24–#29. The commit/push result and final closeout are recorded on #9.
