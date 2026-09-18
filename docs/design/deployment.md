# Design preview deployment · P2 · issues #4 and #15

This preview publishes the contents of `docs/design/` as a dependency-free static site. It contains design artifacts and clearly labeled placeholders, not gameplay. Game-engine, production-game hosting, storage, and networking choices remain open.

## Host and source

GitHub Pages creation returned HTTP 422: the current account plan does not support Pages for this private repository. The repository was kept private. The preview uses the installed Sites host with owner-only access; the owner can open its phone link while signed into the matching account. Source remains in this repository, and the exact committed source is also pushed to the Site's designated source repository for publication.

A small copy step (`python3 scripts/build-design-preview.py`) copies `docs/design/` to the ignored `out/` directory because the Sites packager accepts a fixed set of output roots. No asset transformation occurs.

The Site identity and static directory are recorded in `.openai/hosting.json`. Preserve that identity for future updates. Do not create a second Site or broaden its audience as a redeployment shortcut. The selected mockups use the generated pixel-caricature group and individual avatars derived from the supplied photograph; original pixels and user-provided name order remain preserved. The Site remains owner-private.

## Reproduce locally

From the repository root, run `python3 -m http.server 8123 --bind 127.0.0.1 --directory docs/design` and open `http://127.0.0.1:8123`. No package installation, bundler, font CDN, or external asset server is required by the preview.

## Redeploy

Use the installed `sites:sites-hosting` skill and its publishing instructions. Read the existing manifest, obtain a short-lived source write credential for the same Site when required, commit all source changes, and push that exact revision with per-command authentication. Never save credentials in files, Git configuration, remote URLs, or logs. Run `python3 scripts/build-design-preview.py`, then use the installed plugin's packaging helper to package the configured static directory, save the pushed full commit SHA with the resulting archive, and deploy via the private publishing operation. Confirm terminal deployment success before recording its returned URL. The manifest is configuration, not a credential.

Resolve the currently installed plugin and read its hosting skill; paths changed during the session. P2 used the installed bundled Sites 0.1.57 `scripts/package-site.sh`. On this Mac the Homebrew Git client failed source publication with a LibreSSL bad-record error; `/usr/bin/git` succeeded with the same credential. Use per-command authentication, never a stored token. This is a recorded workaround, not a requirement to replace Git globally.

## Review identity

The current visible identifiers are P2 / S1.4 / M1.2 / C1 / A1. The historical D1 / B1 / W1 artifacts remain available with superseded-control notices. The exact source commit and successful deployment identity are recorded in the issue #15 handoff; initial publication evidence remains in #4. Browser captures and limitations are recorded in `verification.md`. The selected direction comes from explicit user feedback captured in #5.
