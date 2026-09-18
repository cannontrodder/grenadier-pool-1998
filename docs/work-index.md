# Work index

GitHub Issues hold the current task scopes, acceptance checks, dependencies, and handoff evidence. This index links the initial breakdown; use the live milestones for subsequent implementation tickets.

Each issue is a separate piece of work suitable for a fresh agent. Read its blockers before starting. Suggested model and effort are starting points, not fixed requirements.

| Phase | Issues |
| --- | --- |
| [Phase 1 — Design preview](https://github.com/cannontrodder/grenadier-pool-1998/milestone/1) | [#1 — Define the design brief, screen/state map, and media inventory](https://github.com/cannontrodder/grenadier-pool-1998/issues/1)<br>[#2 — Create three distinct Grenadier Pool 1998 visual direction boards](https://github.com/cannontrodder/grenadier-pool-1998/issues/2)<br>[#3 — Design phone touch-layout candidates and key state flows](https://github.com/cannontrodder/grenadier-pool-1998/issues/3)<br>[#4 — Deploy the phone-browsable design boards and wireframes](https://github.com/cannontrodder/grenadier-pool-1998/issues/4)<br>[#5 — Facilitate the design review and record the selected direction](https://github.com/cannontrodder/grenadier-pool-1998/issues/5) |
| [Phase 2 — Chosen experience and touch study](https://github.com/cannontrodder/grenadier-pool-1998/milestone/2) | [#6 — Create selected-direction mockups, storyboard, and design tokens](https://github.com/cannontrodder/grenadier-pool-1998/issues/6)<br>[#7 — Build and verify a focused aim, power, and release touch study](https://github.com/cannontrodder/grenadier-pool-1998/issues/7)<br>[#8 — Deploy the touch study and record real-device findings](https://github.com/cannontrodder/grenadier-pool-1998/issues/8) |
| [Phase 3 — First playable table](https://github.com/cannontrodder/grenadier-pool-1998/milestone/3) | [#9 — Define the first aim, shoot, and pot phase](https://github.com/cannontrodder/grenadier-pool-1998/issues/9)<br>[#24 — Aim, shoot and pot on a working practice table](https://github.com/cannontrodder/grenadier-pool-1998/issues/24)<br>[#25 — Complete and re-rack three practice layouts](https://github.com/cannontrodder/grenadier-pool-1998/issues/25)<br>[#26 — Place the white after a scratch without firing a shot](https://github.com/cannontrodder/grenadier-pool-1998/issues/26)<br>[#27 — Verify the complete phone practice loop and harness safeguards](https://github.com/cannontrodder/grenadier-pool-1998/issues/27)<br>[#28 — Review the first playable table against the phase spec and standards](https://github.com/cannontrodder/grenadier-pool-1998/issues/28)<br>[#29 — Deploy the first playable table and record phone feedback](https://github.com/cannontrodder/grenadier-pool-1998/issues/29) |
| [Phase 4 — Persistent meaningful match](https://github.com/cannontrodder/grenadier-pool-1998/milestone/4) | [#10 — Define match rules, basic computer play, and update-safe resumption](https://github.com/cannontrodder/grenadier-pool-1998/issues/10) |
| [Phase 5 — Personality](https://github.com/cannontrodder/grenadier-pool-1998/milestone/5) | [#11 — Define the first personalized opponent, audio, and Easter eggs](https://github.com/cannontrodder/grenadier-pool-1998/issues/11) |
| [Phase 6 — Human multiplayer](https://github.com/cannontrodder/grenadier-pool-1998/milestone/6) | [#12 — Define friends playing together and multiplayer update behavior](https://github.com/cannontrodder/grenadier-pool-1998/issues/12) |
| [Phase 7 — Expansion](https://github.com/cannontrodder/grenadier-pool-1998/milestone/7) | [#13 — Choose the next small expansion after core play](https://github.com/cannontrodder/grenadier-pool-1998/issues/13) |

## Starting work

The design foundation (#1), direction boards (#2), wireframes (#3), selected direction (#5), and photo intake (#14) are complete. #4 retains the outstanding physical iPhone check. Selected mockups (#6), their publication (#15), caricatures (#17), corrected room (#18), and avatars (#19) are complete. The playable touch study (#7), review (#22), strength tuning (#23) and physical-device acceptance (#8) are complete. The prototype stays on `prototype/touch-study-7`.

Additional work: [#14 — Supplied photo and names](https://github.com/cannontrodder/grenadier-pool-1998/issues/14), [#15 — Selected-direction publication](https://github.com/cannontrodder/grenadier-pool-1998/issues/15), and [#16 — Pub-room reference and handover planning](https://github.com/cannontrodder/grenadier-pool-1998/issues/16).

Issues #1–#8 deliver design artifacts, previews, the touch study, and user review. Issues #9–#13 are bounded planning tasks for later phases. They must create smaller implementation issues after resolving the relevant decisions; completing a planning issue does not mean its phase has been delivered.

Native GitHub blocking relationships describe the current graph. Later planning tasks must add dependencies on actual delivery issues as those are created. Each phase must finish with a tested deployment and phone feedback.

## Historical visual design review

#17 adds the approved pixel-caricature group direction; #18 corrects the pub entrance/foyer; #19 provides individual avatars. The user requests final review of these latest changes only, with no further blocking design choices. This historical review preceded #7/#8, which are now complete; #20 is separate non-blocking visual feedback.

[#20 — Final visual design sign-off](https://github.com/cannontrodder/grenadier-pool-1998/issues/20) covers only the individual avatars and corrected room plan.

[#21 — Preservation audit and implementation handoff](https://github.com/cannontrodder/grenadier-pool-1998/issues/21) records closeout. Its [next-agent prompt](handoffs/next-agent-touch-study.md) is historical; #7 and #8 are now complete. Use the current phase spec and live issue blockers for new work.

## Phase 3 is ready for implementation

[#9](https://github.com/cannontrodder/grenadier-pool-1998/issues/9) records the agreed [first playable table spec](phases/first-playable-table.md): three object balls in repeatable practice layouts, accepted touch controls, real pockets, manual white replacement, and a normal-action harness. The [research](research/phase3-simulation-harness.md) records the simulation/render boundary and collision risks. This planning package contains no gameplay implementation.

Start [#24](https://github.com/cannontrodder/grenadier-pool-1998/issues/24). After it completes, [#25](https://github.com/cannontrodder/grenadier-pool-1998/issues/25) and [#26](https://github.com/cannontrodder/grenadier-pool-1998/issues/26) can proceed independently in separate worktrees. Both block [#27](https://github.com/cannontrodder/grenadier-pool-1998/issues/27); then [#28](https://github.com/cannontrodder/grenadier-pool-1998/issues/28) reviews and [#29](https://github.com/cannontrodder/grenadier-pool-1998/issues/29) deploys and obtains physical-phone acceptance. These are native GitHub blockers, not just a checklist. #10 waits on #29. Ready-for-agent means fully specified; blocked issues must still wait.
