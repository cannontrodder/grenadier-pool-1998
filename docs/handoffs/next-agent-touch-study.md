# Next agent: implement the focused touch study

Work in `cannontrodder/grenadier-pool-1998`, starting from current `origin/main`. This is the handoff after the visual design work. Execute GitHub issue **#7**, then the deployment portion of **#8**. Produce a small playable experiment that answers: **does one-finger cue orbit, pullback power, release and same-finger abort feel casual and reliable on a phone?**

## 1. Load the decision sources

Read `AGENTS.md`, `docs/project-brief.md`, `docs/plan.md`, `CONTEXT.md`, and the current bodies/comments/native blockers of #7 and #8. Before GitHub operations read `docs/agents/issue-tracker.md`; before triage use `docs/agents/triage-labels.md`.

For the selected visuals and interaction constraints, read `docs/design/selected-direction.md`, `docs/design/selected/storyboard.html` and `docs/design/selected/tokens.html`. Read `docs/design/verification.md` for what was actually tested. The final design review is at https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/selected/final-review.html .

**Done:** identify the governing S1.4 / M1.2 design, the #7 acceptance checks and any genuine blocker. #6 is complete. #20 retains final feedback on the latest avatars/room plan, and #4 retains physical-iPhone evidence; neither is a prerequisite for building this bounded touch experiment. Preserve their open status until actual evidence arrives.

## 2. Build the smallest runnable answer

Use the **prototype** skill's logic/state branch for the unresolved gesture question, keeping the selected visual direction. Read **frontend-design** only for applying the existing tokens; a new direction exercise is unnecessary. Preserve the study on `prototype/touch-study-7` in an isolated worktree. Keep a simple local run command and a clear PROTOTYPE label.

Implement a deterministic small table scenario, cue orbit through 360°, provisional pull-away power, release-to-shoot, visible armed state, same-finger abort and a separate contact-point selector for spin/backspin with centre reset. Approximate motion is enough to judge the interaction; explicitly report simulation fidelity. Compare a small number of power mappings or response curves through a clearly labeled review selector. Keep the table fullscreen in portrait and landscape, with transient readable broadcast overlays away from the active finger and shot line.

Represent interruption as disarming: pointer cancellation, page backgrounding, orientation/input interruption and simulated turn-ownership loss must never release a shot. Offer a separate keyboard/button alternative and respect reduced motion. Use existing pixel avatars only where they help review; final artwork and audio acquisition do not block this experiment.

**Done:** a person can aim, adjust power, abort or release, see a bounded response, and reset through normal controls on a phone-size viewport. The prototype is limited to the gesture loop; full match rules, persistence, AI, networking, payments, 2v2, knockabout and a 3D room stay in their later issues.

## 3. Prove the interaction and harness

Follow the harness requirements in the project brief and #7. They take precedence over the prototype skill's generic “no tests” shortcut. Use focused tests for observable behaviour, not a broad production framework. Apply **tdd** to the gesture state transitions and cancellation cases if useful; use **playwright** for browser actions and targeted captures.

Expose compact observations: version/scenario, gesture state, cue angle, power, contact point, shot readiness, ball coordinates and velocities. Drive the same input path as a player. Correlate state with rendered positions and motion at targeted checkpoints. Use bounded waits/recovery, freshness and progress checks, concise assertions and a retained diagnostic bundle; stop an unreliable run and distinguish harness failure from game failure.

**Done:** the happy shot path, abort, interruption and deterministic reset pass; portrait/landscape and narrow-width checks are recorded; motion/state observations match rendering. Evidence names the exact revision. Emulation remains distinct from physical iPhone Safari.

## 4. Publish and hand back the result

Use the installed **sites-building/sites-hosting** skills for the existing Site. Read `.openai/hosting.json` and `docs/design/deployment.md`; preserve its identity and owner-private audience. Resolve the installed plugin path at runtime. The Site-owning agent performs publication, using an exact committed source revision and native deployment tools. Preserve the existing design review alongside the study.

Commit and push the prototype branch, record source, tests, limitations and a link on #7, and close #7 only when its acceptance checks pass. Run #8's deployment checks and provide the phone link. Retain the prototype as evidence on its branch; carry validated findings into main after review. Keep #8 open for real-device feedback and explicit acceptance. Use **code-review** against the branch's starting point before final delivery, with the project standards and #7 as the two review axes.

**Done:** deliver a working phone link, exact revision, short run instructions, passing checks and known limitations. Ask only for the focused hands-on feedback needed to decide power mapping, abort reliability and orientation. Stop there; #9 plans the later production table slice from these findings.

## Workflow rationale

The explicitly invoked **ask-matt** skill is a local workflow guide, not a person contacted externally. It routes unresolved runnable questions through a prototype, then returns validated findings to the spec/ticket/implementation flow. Existing #7/#8 already supply this bounded work; use them instead of opening a broad planning round. This prompt was structured with **writing-for-agents**: ordered steps, conditional source pointers and observable completion criteria.
