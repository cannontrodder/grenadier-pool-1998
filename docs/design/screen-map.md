# Screen and state map · D1

Issue #1. Stable IDs for #2–#4. States describe interface intent, not a settled rules or persistence implementation. Every recovery screen retains a visible next action; back from selection returns to entry.

| ID | Screen / state | Primary action and transition | Back / interruption / failure |
| --- | --- | --- | --- |
| E01 | Entry | Play computer → O01; play friend → M01; existing save → R01 | Settings/audio inline; unsupported load → X01 |
| O01 | Opponent selection | Choose named computer counterpart → O02 | Back → E01; missing media uses labeled placeholder |
| O02 | Persona introduction | Start → G01; show explicit “Computer counterpart” | Change opponent → O01; portrait never claims an online human |
| G01 | Match ready / aim | Aim → G02; turn ownership and shot readiness shown | Pause → P01; opponent turn → M03; update → U01 |
| G02 | Aim adjustment | Set direction, continue → G03 | Cancel → G01; pointer interruption cancels uncommitted input |
| G03 | Power / armed shot | Set power, explicit commit → G04 | Cancel → G02; app background or lost pointer disarms |
| G04 | Shot in motion | Inputs disabled until settled → G05 or G06 | Update waits for safe boundary; background recovery must not replay a committed shot |
| G05 | Turn feedback | Continue / next turn → G01 or M03; match end → Z01 | Reaction is bounded and dismissible, outside table |
| G06 | Foul feedback | Explain foul and next action → G01 or M03 | Rules-dependent placement represented as a variant, no rule selected |
| P01 | Pause | Resume → previous safe match state | Audio/settings; exit → E01 with save status; exit-save failure → X02 |
| Z01 | Result | Rematch → O02 or M01; choose opponent → O01 | Home → E01; distinguish completed match from restorable active save |
| U01 | Update available | Continue current game; safe “Save & reload” → U02 | During G04 show “After this shot”; never a blocking table overlay |
| U02 | Saving for update | Confirm durable checkpoint → reload → R01 | Save failure → X02; stay on current version while saving is unconfirmed |
| R01 | Restore offered / loading | Show saved opponent, match/version context; restore → R02 | Intentional new match requires explicit discard choice; load failure → R03 |
| R02 | Restored confirmation | Continue → G01 or M03, based on restored ownership | Never repeat a shot; reconcile authoritative multiplayer state first |
| R03 | Restore unavailable / incompatible | Retry → R01; recover compatible version if supported | Explain retained save; return E01; explicitly confirm starting afresh |
| M01 | Friend multiplayer lobby | Invite/join → M02; same-device option remains undecided | Back → E01; invalid/expired invite stays M01 with retry |
| M02 | Waiting / joining | Both ready and compatible → G01 or M03 | Cancel → E01; join failure → M01; incompatible versions → M05 |
| M03 | Friend / counterpart turn | Observe; confirmed next turn → G01 | No shot controls; remote disconnect → M04; counterpart stays local |
| M04 | Reconnecting | Bounded retry; reconcile state → G01/M03 | Manual retry; leave → E01 preserving recoverable match; no assumed extra turn |
| M05 | Multiplayer version mismatch | Explain required update → U01/R01; rejoin → M02 | Stay in lobby or leave → E01; no incompatible shot acceptance |
| X01 | App / asset load failure | Retry; essential asset failure blocks Start clearly | Optional portrait/audio failure uses fallback and keeps navigation usable |
| X02 | Save / storage failure | Retry save → U02 or P01; continue current session | Explain reload risk; no automatic destructive reload |

## Primary journey

E01 → O01 → O02 → G01 → G02 → G03 → G04 → G05 → G01. Cancel G03 → G02 → G01; pause G01 → P01 → G01; results G05 → Z01 → O01. No primary screen depends on a supplied photograph.

## Update and remote interruption journey

G04 + new version → U01 (deferred) → settled boundary → U02 → R01 → R02 → G01/M03. Saving must succeed before reloading; failure X02 keeps the current game. This is a proposed interaction contract to validate in #10, not implemented persistence.

Remote G03 + disconnect → disarm → M04. Remote G04 + disconnect → M04, reconcile committed-shot identity before showing G01/M03. A local pause cannot stop the other person's remote game: P01 must say whether only local controls are paused. Detailed authority and update rules remain #12 work.

## Wireframe variants required

Show all IDs directly or as explicitly mapped variants. Include mute/caption and missing-image examples. Keep notice layers separate from input layers: update banner and turn indicator do not obscure balls; destructive save-discard action belongs on a confirmation surface. Review portrait and landscape at realistic viewport sizes, including reachable cancel controls and safe-area allowances.
