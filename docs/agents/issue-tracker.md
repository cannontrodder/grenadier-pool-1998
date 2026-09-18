# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `cannontrodder/grenadier-pool-1998`. Use the `gh` CLI, which resolves the repository from the Git remote.

- Create: `gh issue create --title "..." --body-file <file>`.
- Read: `gh issue view <number> --comments`; include the issue's labels.
- List: `gh issue list --state open --json number,title,body,labels,comments`, with appropriate label and state filters.
- Comment: `gh issue comment <number> --body-file <file>`.
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close: `gh issue close <number>`.

For multiline issue bodies and comments, write the exact text to a temporary file and pass `--body-file`.

When a skill says to publish to the issue tracker, create a GitHub issue. When it says to fetch a ticket, read the issue and its comments.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares issue and PR numbering. Resolve an ambiguous reference with `gh pr view <number>`, falling back to `gh issue view <number>`.
