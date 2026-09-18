# First meaningful match · discussion proposal for #10

Status: proposed, not accepted. This is the first `/grill-with-docs` round,
not an implementation specification or authorization to build the whole phase.

The owner requested recommendations rather than a long questionnaire: this is
a fun game for old mates who probably did not follow formal rules; “two shots”
is the remembered convention. Call the result **Grenadier house rules**. Do not
claim these are the pub's historical rules or a recognized competition ruleset.

Planning is explicitly authorized after #34. That supersedes the earlier wait
before starting #10; #29 remains open and no physical-phone acceptance is inferred.

## Recommended first scope

One human versus one modest computer counterpart, playing one rack of seven
reds, seven yellows and the black. One active match, automatically resumable on
the same device/browser. Preserve the separate practice mode. Use an existing
approved avatar and simple readable turn/foul/result captions; richer character
behavior remains the personality phase.

Keep 2 v 2, winner-stays-on queues and remote friends in the product plan, outside
this first match slice. No accounts, multiple-match inbox, shot clock, real spin,
real payments or extra difficulty modes in this proposal. Do not infer that
one active match means these future multiplayer intentions have been withdrawn.

After a result, preserve the agreed unscored knockabout with remaining balls,
including nomination of another struck ball, and explicit Re-rack. The result
stays final. Re-rack starts a fresh competitive setup and normal white-ball use.

## Proposed rules, with edge cases answered

- Clear your colour, then pot the black legally. No nominated pockets.
- A legal pot of your colour keeps you playing. A miss ends the current visit.
  Before colours are assigned, either colour can be contacted first.
- The break leaves colours open. The first subsequent legal colour pot assigns
  the groups. If both colours fall on that assigning shot, let the shooter pick
  reds or yellows with two clear choices. A foul never assigns colours.
- Fouls: potting the white; hitting nothing; contacting an opponent's colour
  first once groups are assigned; contacting black first before clearing your
  colour; or potting an opponent's colour once groups are assigned. Each ends
  the offender's turn. Other balls potted stay down. No additional cushion-contact
  requirement, nominated safety rules or free-ball exceptions in this house set.
- After any ordinary foul, the incoming player gets two visits and can place
  the white anywhere clear on the cloth. This intentionally generous combination
  avoids trapping a casual player behind balls and avoids special snooker rules.
  Placement requires confirmation before a new aiming gesture, as in practice.
- A visit can contain several shots: legal pots keep it alive; a miss spends it.
  With two visits, your first miss leaves another chance. The second miss passes
  play. Fouling immediately ends both chances and gives the opponent two visits;
  penalties never accumulate beyond two. Two visits remain available on the black.
- UI can celebrate “Two shots!” but must explain the actual state as “First go”
  or “Last go”; do not display a misleading count of two literal cue strikes.
- Black before your group was already clear at the start of that shot loses.
  Potting your final colour and black together therefore loses. Potting the black
  with any foul, including the white, loses even when otherwise eligible.
  A foul while aiming at black without potting it is an ordinary foul, not a loss.
- Break exception: black potted on the break means re-rack and the same breaker
  tries again, even if the white also fell. Otherwise a break needs only object-ball
  contact; a scratch or no contact gives the opponent the normal foul award.
  A legal break pot keeps the breaker at the table; no pot passes play. No minimum
  cushion count. Use a usable opening white position to avoid a placement tutorial.
- Randomly select the first breaker for a new match; alternate on rematches.
  Persist the selected breaker so resuming cannot redraw it.
- No shot clock or absence penalty. The player can leave for days.
- If a rack becomes tedious or stuck, offer an explicit agreed restart against
  the computer rather than a complex stalemate adjudicator. Starting a new match
  must clearly confirm replacing the active one; opening practice must not erase it.

These are a coherent custom proposal, not an adoption of all World Rules or
International Rules. Existing `docs/design/house-rules-notes.md` remains earlier
discussion context; its official-rule comparisons do not override this proposal.

## Computer counterpart

Use the same legal actions, physics and foul rules as the human. Prefer a clear
direct pot; otherwise try a legal hit toward a useful area. Add modest bounded
aim/power error rather than hidden advantages. No perfect multi-cushion planning,
ball repositioning or special pot assistance. It should take a brief readable
turn, make plausible misses, and be beatable. Tune the feel through normal-action
scenarios and human play, not an unsupported promise of a specific win percentage.

Persist any chosen computer shot so an interruption cannot reroll an easier
outcome or cause a duplicate shot. Schedule at most one computer action at a time.

## Saving and deployed updates: proposed experience

- Resume one match on the same browser/device: balls, groups, whose turn, remaining
  visit, pending white placement, computer decision, breaker, result and knockabout.
  Retain the rules version with the match so a later rules tweak cannot change a
  game halfway through. Cross-device sync and survival of cleared browser storage
  are outside this first slice and must not be implied by the resume UI.
- Save at reliable action boundaries. Closing during a shot must neither erase
  it nor count it twice. Prefer resuming at that shot's settled result rather
  than replaying an animation; the implementation must establish how to preserve
  this reliably across simulation-version changes before it becomes an accepted
  engineering promise.
- Show a small update notice away from the active finger. Let the shot settle,
  save, then offer Update & resume. Never reload automatically while aiming or
  during motion; cancel an uncommitted aim when deliberately leaving the match.
- Keep a recoverable prior save during upgrades. Validate before replacing it.
  Do not silently replace an unreadable/incompatible save with a fresh rack.
  Show a plain explanation and preserve the original; offer an explicit recovery
  or restart choice. If saving fails, make that visible and offer retry before
  claiming the match is safe to leave. Avoid overwriting from two open tabs.
- Verify actual old-version → new-version deployment/resume, including a foul's
  remaining extra visit, pending placement, computer turn and interrupted shot.
  A reload on one version alone does not satisfy this requirement.

## Decision frontier and delivery shape

A read-only feasibility review of `a0b1b04` found:

- `practice/model.mjs` currently admits only 2–4 balls, one cue and generic object
  balls; it directly owns practice cleared/white-placement phases. A full rack
  needs a generalised simulation and separate match/rules state, with 16-ball
  collision/performance verification. Current pot/scratch events need first
  object-contact facts for the proposed fouls.
- The existing deterministic `shoot`/`step` seam can serve human and computer
  commands. A rolling snapshot is not a complete checkpoint: private settling
  counters and pocket-mouth state are omitted, and no restore API exists.
- Browser hiding pauses a loaded page safely, but there is no persistent storage.
  `revision.json` is read once at startup; update detection/UI do not yet exist.

Recommended engineering direction, subject to the eventual spec: keep validated,
versioned stable saves and a previous-good copy in browser-local storage. Write
a stable pre-shot state plus the exact pending shot before admitting motion;
commit the adjudicated stable result after settling. Recover a pending shot by
running its saved simulation version to completion, without requiring the user
to watch the animation. Save chosen computer commands/random state identically.
If the initial write fails, do not admit an apparently saved shot; show retry.
Use bounded simulation recovery with diagnostic evidence, not an unlimited loop.

Compatibility must cover pending shots as well as stationary balls. A new build
must retain the needed simulation-version support or a proven equivalent recovery
path; replay under changed physics is not acceptable. If a save is unsupported,
preserve it and explain the recovery state. The first deployment proof can change
visual/app code while retaining physics, but must not be advertised as proof of
arbitrary physics migrations. Storage choice, single-writer handling and migration
details belong in the spec; they are not questions the owner must solve.

This fits the desired same-device scope; no backend/account exists today. It is
more work than persisting the current observation object and must be ticketed as
behavior with interruption/failure acceptance scenarios.

Owner feedback is needed on the proposed overall house-game feel and bounded
first scope; detailed recommendations above may be accepted or revised together.
The agent should not interview the owner about implementation mechanics.

After agreement, turn the decisions into a spec and separate dependency-linked
issues for: complete human match/rules; modest computer play; robust saving and
update/resume (split if necessary); integrated harness/independent review;
deployment and phone feedback. Each implementation slice must exercise a real
player-visible path. Exact ticket boundaries depend on the saved-state design.
Do not mark #10 complete or launch implementation from this draft.
