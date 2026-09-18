# W1 state coverage

Issue [#3](https://github.com/cannontrodder/grenadier-pool-1998/issues/3), foundation D1 from issue #1. Open [the interactive wireframes](index.html), [the rationale and flow map](rationale.md), or return to the [Design preview](../index.html).

The D1 screen map contains **23 stable IDs**. W1 includes every ID in the selector and renders each in both candidate layouts. Three extra selectable views are explicit mapped variants rather than new stable IDs: `G06·V` for possible rules-dependent placement, `U01·V` for an update deferred during a committed shot, and `R03·V` for the required start-afresh confirmation. The selector therefore contains 26 views.

| Stable ID | W1 rendered view and clear next actions | Candidate coverage |
| --- | --- | --- |
| E01 | Entry: resume → R01; computer → O01; friend → M01 | A + B |
| O01 | Opponent selection: choose → O02; back → E01; missing-photo fallback shown | A + B |
| O02 | Persona introduction: start → G01; change → O01; “Computer counterpart” explicit | A + B |
| G01 | Ready/aim: aim → G02; pause → P01 | A + B |
| G02 | Aim adjustment: power → G03; cancel → G01; drag and button alternatives labeled | A + B |
| G03 | Power/armed: explicit commit → G04; cancel → G02 | A + B |
| G04 | Shot in motion: controls locked; safe boundary implied before G05/G06 | A + B |
| G05 | Turn feedback: next/dismiss → G01; captioned reaction outside table | A + B |
| G06 | Foul feedback: continue → M03; rules note → mapped `G06·V` | A + B |
| P01 | Pause sheet: resume → G01; save/exit → E01; audio/captions retained | A + B |
| Z01 | Result: rematch → O02; opponent → O01; home → E01 | A + B |
| U01 | Update available: continue in G01; save/reload → U02 | A + B |
| U02 | Saving: wait for checkpoint; cancel/keep playing → G01; failure contract → X02 | A + B |
| R01 | Restore offered: restore → R02; home → E01; start-afresh route separated | A + B |
| R02 | Restored confirmation: continue → G01; ownership/checkpoint stated | A + B |
| R03 | Restore unavailable: retry → R01; home → E01; save retained | A + B |
| M01 | Multiplayer lobby: invite/join → M02; back → E01 | A + B |
| M02 | Waiting/joining: ready → G01; mismatch → M05; cancel → E01 | A + B |
| M03 | Other turn: no shot controls; pause locally → P01 | A + B |
| M04 | Reconnecting: retry → M04/G01/M03; leave preserving recovery → E01 | A + B |
| M05 | Version mismatch: update → U01; lobby → M01; leave → E01 | A + B |
| X01 | Essential load failure: retry → E01; optional portrait fallback shown | A + B |
| X02 | Save/storage failure: retry → U02; current session → G01; pause → P01 | A + B |

## Explicit rendered variants

| Variant | Maps to | Why it is rendered separately |
| --- | --- | --- |
| G06·V · Foul / placement | G06 | Shows how a future ruleset could expose placement and cancel without selecting that rule now. |
| U01·V · Update deferred | U01 | Shows “after this shot” during G04 and keeps all controls locked until a safe boundary. |
| R03·V · Start-afresh confirmation | R03 | Keeps the save intact until an explicit discard action; Cancel returns to R03 and Confirm returns to E01. The diagram performs no deletion. |

## Dead-end review

The primary E01 → O01 → O02 → G01 → G02 → G03 → G04 → G05 → G01 path has a visible forward action at every actionable step. G04 is intentionally locked after commitment and names its completion condition. Cancel paths exist before commitment. Recovery and failure states each retain retry, preserve/continue, or safe-return actions. The mapped R03·V confirmation makes the destructive boundary explicit; it is a diagram and performs no deletion.
