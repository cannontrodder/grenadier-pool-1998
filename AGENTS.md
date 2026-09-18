# Project instructions

## Orchestration

The primary session coordinates the project. Delegate substantial, bounded tasks to suitable background agents when that saves main-session context. Choose a lower-cost model and effort when sufficient; use stronger models when complexity or rework risk warrants them. The primary session owns integration, review, and verification.

## Delivery workflow

Before planning a phase, read `docs/project-brief.md` for the captured product intent and requirements, and `docs/plan.md` for the proposed delivery sequence and design artifacts.

The user defines work in phases, beginning with small vertical slices and increasing scope as understanding grows. Use agreed plans, designs, and mock-ups to establish what done looks like for each phase.

Every phase ends with a tested deployment and a working link the user can open on their phone. Deployment is part of completing an agreed phase and is already authorized. Prioritize quick feedback on iPhone/Safari while retaining Android compatibility.

## Testing

Develop the game with a programmatic play harness in mind. Prefer compact game-state observations and concise assertion results for routine testing. Use targeted screenshots and motion checks to validate that observations match the rendered game, including after relevant rendering changes. Read `docs/project-brief.md` for the harness requirements.

Give the harness bounded waits and recovery attempts, health checks, and diagnostic escalation. If the harness becomes unreliable, stop the affected run, preserve debugging evidence, and report the uncertainty rather than treating the run as passed.

## Agent skills

### Issue tracker

Track issues and specs in GitHub Issues. Before issue operations, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical triage labels. Before triaging issues, read `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout with root `CONTEXT.md` and `docs/adr/`. Before exploring the codebase, read `docs/agents/domain.md`.
