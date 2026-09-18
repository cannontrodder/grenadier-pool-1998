# Friends' practice preview · GitHub Pages

Issue [#30](https://github.com/cannontrodder/grenadier-pool-1998/issues/30)
publishes the #24 foundation early so friends can try solo practice. This does
not complete #25–#29 or replace physical-phone acceptance of the full phase.

Target: <https://cannontrodder.github.io/grenadier-pool-1998/>.

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

The dedicated build copies an allowlist of six runtime files plus the favicon,
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
