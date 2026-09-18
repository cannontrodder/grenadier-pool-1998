# Selected-direction browser evidence

Captured from `docs/design/selected/index.html` with the Playwright CLI named session `mockups6` in Chromium 153. This is browser-size evidence, not a physical-device claim.

## Captures

- `g01-ready-portrait-390x844.png` — unobstructed ready state.
- `s01-cue-contact-portrait-390x844.png` — expanded cue-contact selector before aiming.
- `g03-armed-portrait-390x844.png` — held one-finger candidate, locked spin status, armed cue, same-finger abort.
- `g04-feedback-portrait-390x844.png` — balls moving and compact result feedback.
- `o02-persona-portrait-390x844.png` — supplied group photo with all four faces and names visible; source status strip cropped by CSS.
- `e01-resume-portrait-390x844.png` — one long-running live match resume.
- `g05-pub-handover-portrait-390x844.png` — spatial-placeholder pub handover and Betty cameo.
- `z01-knockabout-portrait-390x844.png` — locked result, any-ball knockabout, explicit Re-rack.
- `g01-ready-landscape-844x390.png` and `g03-armed-landscape-844x390.png` — fullscreen landscape ready/held states.
- `g03-armed-compact-320x568.png` — compact-width pressure check.
- `qa-contact-sheet.png` and `qa-orientation-sheet.png` — visual review sheets derived from the captures.

## Measured checks

- 390×844: table outer box 370×740 CSS px, exact 1:2 portrait ratio.
- 844×390: table outer box 794×397 CSS px, exact 2:1 landscape ratio; document scroll extent remains 844×390.
- 320×568: table outer box 294×588 CSS px, exact 1:2 ratio and intentionally clipped by 10px at each short edge to fill the viewport; document scroll extent remains 320×568.
- Compact held state: abort field 92×48 CSS px; locked cue-contact field 130×48 CSS px.
- Outer explorer review controls are at least 44px high.
- Console after the final compact render: 0 errors, 0 warnings.
- Copied photo verified byte-identical with `cmp` against `assets/source/friends-group-01.jpg`.

## Contrast calculations

WCAG relative-luminance calculations for critical pairs:

- cool white `#F7FAF8` on navy `#071B33`: **16.47:1**
- gold `#F2C14E` on navy `#071B33`: **10.31:1**
- cool white `#F7FAF8` on red `#D92E3D`: **4.53:1**
- warm white `#F4F0DF` on felt `#0F684F`: **5.90:1**
- warm white `#F4F0DF` on navy `#071B33`: **15.14:1**

Reduced-motion removes animated interpretation, while `prefers-contrast: more` makes essential captions opaque and preserves dark text on the warm-white resume card. Pointer cancellation in the review script disarms G02/G03 back to G01; production must also disarm on backgrounding, input loss, and turn loss.
