# Friends' practice preview · GitHub Pages

Issue [#30](https://github.com/cannontrodder/grenadier-pool-1998/issues/30)
publishes the #24 foundation early so friends can try solo practice. This does
not complete #25–#29 or replace physical-phone acceptance of the full phase.

Live: <https://cannontrodder.github.io/grenadier-pool-1998/>.

The owner requested GitHub Pages and authorized making the repository public if
needed. GitHub rejected Pages on the existing private repository with
“Your current plan does not support GitHub Pages for this repository.” The
repository was then made public and Pages configured with `build_type=workflow`.
The public website contains only the practice runtime; source/history remain
available in the now-public repository. The existing Sites deployment was not
changed.

## Build and publish

```sh
node --test scripts/practice/*.test.mjs
python3 scripts/build-practice-preview.py
python3 -m http.server 8766 --bind 127.0.0.1 --directory out-public
```

The dedicated build copies an allowlist of nine runtime files plus the favicon,
revision marker and `.nojekyll`. It does not copy design pages, friend photos,
documentation or diagnostic bundles into the hosted site. All game URLs are
relative so the repository path works without configuration.

`.github/workflows/practice-pages.yml` runs model/input tests, builds and deploys
on changes to practice/build/harness/workflow files on `main`, or manually via:

```sh
gh workflow run practice-pages.yml --ref main
```

Build and deployment have separate permissions, five-minute job bounds and one
deployment concurrency group. The revision marker is the build commit, with
`-dirty` on local source changes. Document-only commits do not deploy a new build.

Hosted verification uses the same normal-action harness with `--url` set to the
public URL. No account, saved game, server or multiplayer session is involved.

## First publication · 18 September 2026

- Source/deployed revision: `a6065eb16c516312d2b56c91052f0748458b529d`.
- [Successful build and deployment](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35382011156).
- The CI model/input suite passed all 28 tests before publishing.
- Anonymous HTTPS requests returned the application, JavaScript modules, CSS,
  favicon and matching revision marker with correct content types. Design,
  source-photo and evidence paths returned 404 on the Pages site.
- Hosted WebKit 390×844 passed 64 interaction, 40 side/corner pot and 18 keyboard
  assertions. Hosted WebKit 844×390 passed 40 pot assertions; Chromium 412×839
  passed 19 native-touch assertions. Total: 181 hosted assertions.
- JSON evidence starts `hosted-` in
  [`output/playwright/practice/`](../output/playwright/practice/), alongside the
  hosted screenshots. The earlier full local matrix remains in
  [#24 verification](verification/practice-table-24.md).

This verifies publication and browser behavior. Physical-phone acceptance of
the completed Phase 3 remains #29, after #25–#28.


## Friend-feedback tuning publication · #32

The tuning publication served `fa8d7a249d64141e904d1dbd821796fe576f2edd`.
[Deployment](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35385060081)
and 102 hosted checks passed (WebKit tuning/potting and Chrome native touch).
See [tuning verification](verification/practice-tuning-32.md) for defaults,
local coverage, retained failures and evidence. The live URL is unchanged.


## Reviewed practice loop publication · #29

The public preview now serves `d2ba2347213ed67df7af73c55130654265a943f7`:
[successful deployment](https://github.com/cannontrodder/grenadier-pool-1998/actions/runs/35400216561).
White replacement after scratches and all three repeatable layouts are live.
The runtime is byte-identical to the #28 approved source. CI passed 50 tests;
435 hosted assertions span the two publications of this identical runtime.
[Deployment evidence and limits](verification/practice-deployment-29.md) retain
exact identities, revision-readiness correction and excluded incomplete attempt.

#25–#28 are complete. #29 remains open for actual physical-phone feedback;
Phase 3 is not yet marked delivered and #10 remains blocked. Later documentation
commits do not deploy a new runtime; the live revision above is authoritative.
