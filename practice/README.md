# Working practice table · issue #24

One fixed, versioned four-ball layout, real pockets, the accepted single-finger
shot, and explicit Re-rack recovery. This is the foundation for the three-layout
flow (#25) and white-placement UI (#26). The model already owns placement and
clear-state admission; those tickets add their player-facing flows.

## Run

From the repository root, with Python 3, Node 22+ and Git available:

```sh
python3 scripts/build-design-preview.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory out
```

Open `http://127.0.0.1:8765/practice/`. The build retains the design at `/` and
reconstructs the accepted, pinned prototype at `/touch-study/`. It does not merge
the prototype branch. `revision.json` identifies HEAD and adds `-dirty` when
application/build sources differ from that commit. Rebuild after editing.

The browser has no runtime dependencies or external requests beyond its own
static files. Deploying the phase and obtaining physical-phone acceptance are
tracked separately in #29.

```sh
node --test scripts/practice/*.test.mjs
```

Browser harness commands and exact verification results are recorded in
[`docs/verification/practice-table-24.md`](../docs/verification/practice-table-24.md).

## Ownership and public contract

- `geometry.mjs` describes the single 1000×500 table: radius-12 balls, rail
  surfaces, circular jaws, pocket mouths and capture planes.
- `model.mjs` owns command admission, deterministic fixed ticks, ball motion,
  contacts, capture events and post-settle precedence. It uses no browser or
  clock APIs. [`PHYSICS.md`](PHYSICS.md) documents numerical bounds and evidence.
- `input.mjs` owns one pointer's gesture and the accepted screen-pixel curve.
- `app.js` adapts DOM input, advances ticks, renders SVG and publishes a
  read-only observation. It never resolves collisions or decides post-settle
  state independently.

`createPractice({scenario?})` returns a frozen interface:

| Method | Contract |
| --- | --- |
| `snapshot()` | Immutable state, balls and sequenced capture events. |
| `shoot({angle,power,strength,epoch?})` | Radians, power 0–1, strength 0.5–3; accepted only in `ready` with the current epoch. Returns boolean. |
| `step(ticks=1)` | Explicit integer ticks of 1/120 second; returns a snapshot. |
| `resetScenario(scenario?)` | Restores the selected fixture, clears shot/event state, increments epoch. Omission restores the current fixture. |
| `placementValidity({x,y})` | Returns `{valid,reason}` for felt, pocket, jaw and occupied-position checks. |
| `placeWhite({x,y,epoch?})` | Accepted only in `placing-white`, at a valid position in the current epoch. Returns boolean. |

Scenario fixtures contain `id`, integer `version`, and ball records with stable
`id`, `role`, and world positions. Explicit statuses/velocities support pure
model fixtures; no browser setter exposes them. Future layout controls call
`resetScenario` internally. Strength belongs to the browser and survives Re-rack;
reload resets it to 1.8 and restores the default layout.

Only the model decides `ready → rolling → ready|placing-white|cleared`. All
live balls must settle before this decision. No remaining objects takes
precedence over an absent white. Scratch is a capture event while rolling;
shooting remains disabled until valid placement or Re-rack. #24 offers Re-rack
for recovery. Capture events carry epoch, sequence, tick, shot, ball and pocket.

## Input, rendering and time

The SVG world is translated by (60,60) in landscape. Portrait uses
`translate(560 60) rotate(90)` in a 620×1120 viewBox. SVG's actual screen matrix
handles viewport letterboxing; its inverse maps input to world coordinates.
Rotation changes the view only. Balls, rails and jaws are rendered directly
from the same model geometry. Rail artwork extends outward from the collision
surface; jaws retain their physical radius. Pocket mouth polygons connect to
their bowls; capture depends on crossing the plane, not the artwork.

The aim points from the finger toward the white. Pull is measured outward from
the first finger radius in CSS pixels: `clamp((radius-startRadius-12)/115,0,1)`.
Power is pull squared, armed at pull 0.06, with speed
`60 + 1300 × power × strength`. Secondary contacts cannot take ownership. Only
an armed release by the owning pointer in the current epoch commits a shot.
Returning inward aborts; pulling outward again rearms the same contact.

Cancellation, lost capture, blur, hidden page, page exit, rotation, resize,
Menu/settings and Re-rack disarm. The menu contains labeled keyboard angle,
power and Shoot controls. It is modal so menu contacts cannot reach the table.

Animation frames accumulate time into fixed ticks, at most 60 ticks per frame.
A visible-frame gap over 0.5 seconds reports `frame-backlog` and requires
Re-rack; it never skips physics or converts a timeout to settling. A hidden page
pauses, clears its accumulator and resumes without elapsed-time catch-up.
Back/forward-cache page transitions also reset the browser clock.

## Read-only observation · version 1

`window.practice.observe()` returns the last deeply frozen rendered snapshot.
The interface and property are frozen too; there are no privileged browser
shoot, position, pot or fixture-loading methods.

It includes model state plus `contractVersion`, `buildRevision`, `frame`,
`observedAt` (performance-clock milliseconds), `health`, `paused`, `shotReady`,
`strength`, `aimAngle`, `pull`, `power`, `gesture`, `placement`, and `geometry`.
Geometry includes the world-to-screen affine `matrix` and all rails/jaws/pockets.
An active gesture projects the model's `ready` as `aiming`; `gesture.armed`
records arming. Admission remains in the model. Placement is `null` until #26
adds its candidate UI.

`frame` and `observedAt` advance even when balls are stationary, so idle is
distinguishable from stale observations. `tick` advances only during rolling;
`stateRevision` tracks simulation changes. `epoch` increments on reset while
shot/tick/event sequence restart. Harness actions compare epochs before making
progress assumptions. A reported fault is a failed run, never a passing settle.

## Friend-feedback tuning · issue #32

The Menu has session-only settings with bounded ranges:

| Setting | Default | Range |
| --- | --- | --- |
| Shot strength | 1.8× | 0.5–3× |
| Guide length | 60% of table length | 10–100% |
| First-contact marker | On | On/off |
| Lock aim while adding power | On | On/off |
| Pull before aim locks | 28 CSS pixels | 20–60 pixels |
| Pocket opening | 110% of original | 90–130% |

Guide length is a maximum. The line stops at the first cue-ball contact with a
live object ball, cushion face or jaw, or at the cloth edge through an open
pocket. The ring shows the white's centre at that contact; it does not predict
rebounds or guarantee a pot. The guide and marker are purely visual.

Aim locking freezes the last aiming direction before the selected pull
threshold. It stays fixed through sideways motion and release. Returning to
within 12 pixels of the starting radius unlocks and disarms, allowing re-aim,
abort or another pull. Small armed shots below the lock threshold remain freely
aimed. Locking does not change the existing squared power curve or full travel.

Pocket changes are pending until **Apply pocket size & re-rack** is pressed.
Closing the menu discards a pending pocket change. Applied size changes move
actual rail ends, jaws, mouths and bowls together; there is no attraction or
invisible capture assist. Applying or restoring defaults increments the epoch,
resets the balls and cancels any previous gesture. Re-rack keeps all tuning;
reload restores defaults. These starting values await friends' feel feedback.

`createPractice({scenario?, pocketScale=1})` and
`resetScenario(scenario?, {pocketScale?})` accept a scale clamped to 0.9–1.3.
The pure model retains its historical 1.0 default; the app explicitly chooses
1.1. Plain model resets preserve the chosen scale. Its frozen `table` getter is
the single geometry source for simulation, rendering and the guide.
Observations add `pocketScale`, `tuning`, `guide` and `gesture.locked` to the
existing version-1 contract. `tuning.mjs` owns menu bounds/defaults;
`guide.mjs` owns first-contact ray geometry.
