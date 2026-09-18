# Grenadier Pool 1998 — project brief

Working notes from the project interview. These capture the overall idea; phase scope and detailed designs remain to be agreed.

## Game

A two-dimensional, top-down pool game for the creator and his friends, inspired by playing pool at the Grenadier public house in 1998. It should have a retro 1998 aesthetic, graphics, sound, friends' images, and personal Easter eggs.

The intended game supports both real friends playing against each other and computer opponents based on their personas. Computer counterparts have exaggerated personalities, such as angry or cool. Basic computer play should require modest effort; especially skilled “ultimate” counterparts are a possible later addition.

## Selected direction and interaction feedback (18 September 2026)

The user selected **1998 Sports Broadcast** for gameplay and personas, grounded in the pub. Use a fullscreen top-down table with temporary TV overlays away from the active finger, fading nonessential chrome during interaction. The fixed landscape rail and mandatory power/commit buttons were rejected.

Prefer **single-finger drag and release with abort**. The cue can rotate around the cue ball; pull-away distance is a candidate power control, still provisional and casual. Add a cue-ball contact-point selector for spin/backspin. Gesture calibration and orientation need a touch study.

Scope is **one live active match**, turn-based and resumable even if it lasts a long time. The earlier multiple-game/asynchronous-inbox idea is explicitly deferred. Both **2 v 2** and **winner stays on** are wanted; exact fouls, team rotation, black-ball edge cases and optional timeout penalties remain unsettled. The earlier “killer”/50p challenger idea is not a specification for real payments.

After the competitive result, allow an unscored knockabout with remaining balls, including nominating a non-cue ball to strike. Keep the result final and expose an explicit Re-rack action for the next setup.

Explore pub pullbacks between shots, with people seated or stepping up; no finished 3D model exists. The user's relative room plan places the bar on the bottom/back wall, pool to its left, seats beyond/around it, foyer immediately above the bar with toilets either side, and seating without a pool table on the right. Betty is the formidable landlady, with a possible humorous barring interlude whose trigger/effect remain open.

Sound should evoke a 1990s pub, led by normal pool sounds. See [selected direction S1.2](design/selected-direction.md) and raw feedback for precise decisions and superseded ideas.

## Feedback and delivery

Quick feedback on the user's iPhone is a priority. A mobile browser game is the current recommendation, with Safari prioritized and Android compatibility retained. The user defines phases, starting with small vertical slices and expanding their scope as understanding grows. Plans, designs, and mock-ups establish what done looks like. Each phase ends with a tested deployment.

There is no fixed budget or hard deadline. Efficient use of agents matters, and the user would like rapid progress, ideally within the day discussed during the interview.

## Updating during play

While someone is playing, the game must indicate when a new deployed version is available. They must be able to reload into that version and resume their existing game with its state restored, rather than start over.

State preservation is a product requirement for deployed updates, including visual changes. Development hot reload alone does not satisfy it. The implementation must account for restoring saved state across application versions; detailed behavior during shots and multiplayer updates remains to be designed.

## Automated play and test harness

Design for a harness that can interactively play the game using compact, machine-readable observations. Relevant observations include ball coordinates and velocities, alongside the match state needed to choose actions and check outcomes. Playwright is a candidate for browser interaction, not a mandated tool for every test.

Avoid a screenshot-driven loop that consumes large amounts of agent context. Establish that the harness observations correspond to the rendered game through targeted visual checks, then use state observations for routine automated play and reusable programmatic test fixtures. Recheck that correspondence when relevant rendering or coordinate-mapping behavior changes. Velocity and motion checks require observations over time, rather than a single still image.

Implementation should favor normal gameplay actions for exercising the game, repeatable scenarios, and assertions executed by the harness with concise results returned to the agent. Detailed harness interfaces and the split between simulation tests, browser interaction, and visual checks remain to be designed.

### Harness safeguards and diagnostics

The harness must detect problems in its own operation and signal when its observations or actions can no longer be trusted. Examples include missing or stale observations, disconnected browser sessions, actions that time out, and repeated lack of expected progress.

Use bounded waits and recovery attempts. When safe recovery fails, stop the affected run and report that investigation is required; an incomplete or unreliable run must not count as a pass. Distinguish a harness failure from a game assertion failure where evidence permits, and explicitly report uncertainty otherwise.

On failure, retain a bounded diagnostic bundle containing recent actions and observations, relevant errors, version and scenario identifiers, and targeted screenshots or browser traces when useful. Return a concise failure summary and artifact locations to the agent, which can inspect richer evidence on demand. Preserve the original failure evidence across recovery attempts.
