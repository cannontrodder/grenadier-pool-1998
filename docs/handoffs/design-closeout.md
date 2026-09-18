# Design closeout and preservation audit

18 September 2026 · issue #21. User requested that all completed work be committed to main, decisions recorded, completed issues closed, and a next-agent prompt prepared using ask-matt and writing-for-agents.

## Ready next

The visual direction and artifact production are complete enough to begin the bounded **#7 touch study**, followed by #8 deployment and physical-device feedback. This is a prototype of gesture feel, not authorization to expand into a full production game. The [next-agent prompt](next-agent-touch-study.md) defines the scope and completion checks.

Ask Matt is a local skill router, not a person contacted externally. Its runnable-question branch recommends a prototype because aim/power/abort feel cannot be settled in prose. Existing #7/#8 already contain the required narrow tickets. The writing-for-agents skill shaped the prompt around ordered work, source pointers and explicit completion criteria.

## Preserved work

Audit covered the root checkout and every registered project worktree. Completed design source, supplied original photo, generated group and four avatar assets, exact image prompts/provenance, sound plan, corrected pub SVG, mockups, storyboard, tokens, browser evidence and publication records are on main. No worktree contains unique unpreserved source or evidence.

| Worktree branch | Original commit | Representation on main |
| --- | --- | --- |
| `design/issue-2` | `458bdb7` | Patch-equivalent `062a725` |
| `design/issue-3` | `2504388` | Patch-equivalent `602674e` |
| `design/issue-6-mockups` | `28ae84d` | Patch-equivalent `b5af49f`; later #17–#19 changes also integrated |
| `design/issue-6-sound` | `4a5ac11` | Direct ancestor |

The two uncommitted room-plan edits in the old issue-6 worktree are already represented by `a7aafff`; main also has newer version labels and avatars. They must not overwrite main. Other untracked/ignored files are generated Playwright snapshots/logs and copied build output. Worktrees and branches are retained; nothing was deleted to make this audit pass.

The audit baseline `198eab8676c8e99f515e66f1a765273d04d37897` matched origin/main. The closeout commit adds this record, the prompt and consistent current-source pointers. Issue #21 records the final pushed SHA after completion.

## Issue state

Completed and closed with artifact/decision evidence: **#1, #2, #3, #5, #6, #14, #15, #17, #18, #19**.

Accurately open:

- **#20:** user's final check of the separate avatars and corrected room plan. Broad mockups and the pixel group treatment were approved; no final individual-avatar approval is inferred.
- **#4:** direct physical iPhone Safari evidence is missing. Deployment and emulated checks are complete; this is not a reason to rebuild the design.
- **#7 / #8:** next prototype and its deployed device review.
- **#9–#13 / #16:** later bounded planning work. Final rules, AI, persistence, multiplayer, audio acquisition, Betty's barring behaviour and room modeling remain later work.

Neither outstanding visual feedback nor physical-device evidence is silently marked complete. The user's request here prepares an implementation handoff; this closeout session does not start the app.

## Published review

https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/selected/final-review.html

Owner-private access is preserved. #15 records successful P2 publication of `198eab8`; the closeout issue records the subsequent documentation refresh. Browser verification is in `docs/design/verification.md`. Individual PNGs and their prompts are in `docs/design/selected/assets/`.
