# Design preview deployment · P1 · issue #4

This preview publishes the contents of `docs/design/` as a dependency-free static site. It contains design artifacts and clearly labeled placeholders, not gameplay. Game-engine, production-game hosting, storage, and networking choices remain open.

## Host and source

GitHub Pages creation returned HTTP 422: the current account plan does not support Pages for this private repository. The repository was kept private. The preview uses the installed Sites host with owner-only access; the owner can open its phone link while signed into the matching account. Source remains in this repository, and the exact committed source is also pushed to the Site's designated source repository for publication.

A small copy step (`python3 scripts/build-design-preview.py`) copies `docs/design/` to the ignored `out/` directory because the Sites packager accepts a fixed set of output roots. No asset transformation occurs.

The Site identity and static directory are recorded in `.openai/hosting.json`. Preserve that identity for future updates. Do not create a second Site or broaden its audience as a redeployment shortcut. No real friend media is included.

## Reproduce locally

From the repository root, run `python3 -m http.server 8123 --bind 127.0.0.1 --directory docs/design` and open `http://127.0.0.1:8123`. No package installation, bundler, font CDN, or external asset server is required by the preview.

## Redeploy

Use the installed `sites:sites-hosting` skill and its publishing instructions. Read the existing manifest, obtain a short-lived source write credential for the same Site when required, commit all source changes, and push that exact revision with per-command authentication. Never save credentials in files, Git configuration, remote URLs, or logs. Run `python3 scripts/build-design-preview.py`, then use the plugin's `package-site.mjs` helper to package the configured static directory, save the pushed full commit SHA with the resulting archive, and deploy via the private publishing operation. Confirm terminal deployment success before recording its returned URL. The manifest is configuration, not a credential.

For this environment the helper is `/Users/neil/.codex/plugins/cache/openai-curated-remote/sites/0.1.65/scripts/package-site.mjs`. Resolve the currently installed version in later sessions rather than assuming that version remains installed.

## Review identity

The visible design identifiers are P1 / D1 / B1 / W1. The exact source commit, deployment identity, browser captures, and known limitations are recorded in `verification.md` and the issue #4 handoff. Revision labels identify artifacts; only explicit user feedback in #5 can choose a visual direction.
