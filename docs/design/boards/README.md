# Visual direction boards · B1

Issue: [#2](https://github.com/cannontrodder/grenadier-pool-1998/issues/2). Foundation: [D1 brief](../brief.md), [screen map](../screen-map.md), and [media inventory](../media-inventory.md). B1 does not select a direction or represent final mockups.

Open [`index.html`](index.html) in a browser. Each board is a dependency-free HTML/CSS artifact with original vector-like UI built from CSS; the comparison embeds them using relative paths. All personal photography and audio remain unavailable. Every portrait is therefore a visibly labeled `PHOTO-FRIEND` placeholder, and sound ideas are written as captionable cues rather than played.

## Artifact map

| Artifact | Stable moments | Job |
| --- | --- | --- |
| [`pub-snapshot.html`](pub-snapshot.html) | O02, G01 | Test warm, photo-led memory against table clarity. |
| [`sports-broadcast.html`](sports-broadcast.html) | O02, G01 | Test competitive broadcast hierarchy without losing personal character. |
| [`home-computer.html`](home-computer.html) | O02, G01 | Test tactile late-1990s computer language without shrinking touch UI. |
| [`comparison.html`](comparison.html) | O02, G01 in all three | Discuss structural tradeoffs side by side; no winner is implied. |

## Shared rules

- Gameplay keeps portraits, reactions, score captions and update notices outside the playable table. Ball color is repeated with a numeral or symbol.
- Controls are designed around a 44 CSS-pixel minimum. Ordinary copy targets 16px in playable UI; annotations may be smaller because they are review documentation, not game controls.
- Every board names `O02` as a computer counterpart and uses a fictional `Player A` label. No real person is claimed to be online and no biography is invented.
- The shown ball positions, score and frame label are illustrative. They do not select a pool ruleset.
- Motion proposals have reduced-motion substitutions. Meaningful sound has a text caption and separate mute/volume behavior.
- U01/update, recovery, reconnect and failure treatments are annotations, not claims of implemented persistence or networking.

## Direction rationale

**Pub Snapshot** uses the emotional hierarchy of an album page: large portrait, familiar material, short handwritten-feeling interjections. During G01 it limits that language to the frame and score strip. It communicates place and friendship best, but fails if approved media is weak or nostalgia competes with the shot.

**1998 Sports Broadcast** uses the information hierarchy of live sport: turn, player and match state scan in one pass; persona arrives as a featured-player package. It communicates competition and clarity best, but fails if its human detail is interchangeable with any televised event.

**Home Computer Pool Night** treats the game as a period software object: clear windows, file-like persona records, tactile buttons and honest save/recovery language. It communicates playfulness and ownership best, but fails if literal desktop conventions reduce the touch target or table area.

## References

These references influenced design logic only. No reference images, marks, typefaces, code, or recordings are bundled or copied.

- Repository product source: [`docs/project-brief.md`](https://github.com/cannontrodder/grenadier-pool-1998/blob/main/docs/project-brief.md), [`docs/plan.md`](https://github.com/cannontrodder/grenadier-pool-1998/blob/main/docs/plan.md), [`CONTEXT.md`](https://github.com/cannontrodder/grenadier-pool-1998/blob/main/CONTEXT.md), and GitHub issues #1 and #2. These establish the pub/friends premise, 1998 boundary, table-first app UI, computer-counterpart definition, iPhone priority, recovery requirement, and the three direction theses.
- [Museum of Brands — overview of the collections](https://museumofbrands.com/collections/overview-of-the-collections/) (accessed 18 September 2026). Reference for ordinary British packaging and ephemera as memory carriers; used to justify modest paper/material cues in Pub Snapshot, not to claim historical accuracy for the Grenadier.
- [V&A — Lost Music Venue Archive](https://www.vam.ac.uk/blog/projects/closing-time-stories-from-the-lost-music-venue-archive) (accessed 18 September 2026). Reference for the narrative value of photographs, set lists, flyers and worn venue records; no venue content was copied.
- [Ravensbourne University London — BBC Motion Graphics Archive](https://www.ravensbourne.ac.uk/bbc-motion-graphics-archive) and its [archive search](https://www.ravensbourne.ac.uk/bbc-motion-graphics-archive/bbc-archive-search) (accessed 18 September 2026). Reference for the existence and breadth of 1990s British broadcast motion languages. The board uses original neutral graphics and does not reproduce BBC branding or archive footage.
- [Microsoft — Windows 98 accessibility guide](https://download.microsoft.com/download/5/1/A/51A75861-9EE9-4973-AD97-641D95385EF1/Accessibility_guidebook.pdf) (accessed 18 September 2026). Period primary reference for window/control hierarchy, keyboard navigation and accessibility tools. The Home Computer board is an original game composition, not a faithful operating-system skin.

## Verification contract

Browser verification should open every HTML file from a local HTTP server, check navigation and relative links, and capture the three direction pages at a phone viewport plus the comparison at desktop width. Emulation is evidence about layout only; physical iPhone/Safari feedback remains outstanding until performed and recorded in the relevant deployment/review issue.

B1 verification captures are in `output/playwright/boards/`: `pub-snapshot-phone.png`, `sports-broadcast-phone.png`, `home-computer-phone.png`, and `comparison-desktop.png`. They were captured from Chromium at 390 × 844 CSS pixels for each direction and 1440 × 1000 for the comparison. The full-page captures exposed and led to fixes for clipped sports/computer labels and an unintended narrow grid column in the computer persona panel.

Phone review should ask: which G01 table reads fastest; which O02 feels most affectionate and least generic; which board reads specifically as 1998; and, if a hybrid is preferred, exactly which layer comes from which direction.
