# HTML output and publishing

The default output is a page on the design specs site. The site lives in the
**Design Specs monorepo** at `docs-site/` (GitHub
`madeleinevalcour-prog/designspecs`). Vercel deploys it from the repo root on
every push to `main`, and builds the live component examples into
`docs-site/examples/` first. The repo `CLAUDE.md` holds the full workflow;
follow it.

## Build the page

1. Pick the folder from `page-types.md` and write `docs-site/docs/.../<name>.html`.
2. Link the shared files with the right relative depth (`components.md`) and compose from `doc-*` elements only.
3. Previews:
   - Component states: `doc-example src="<showcase route>?…"`. Find routes in `components/projects/showcase/src/app/pages/`.
   - Prototypes: `doc-prototype src="/prototypes/<name>/index.html?…"`. Prototypes are built from `prototypes/*/`; never edit the built `index.html`.
   - Screenshots: `doc-showcase` with images in `docs-site/docs/images/`.
   - Every preview gets both its Figma link and its live link (rule in `SKILL.md`).
4. Add the page to `SITE` in `docs-site/assets/docs.js`.

## Preview locally

Run `npm run docs` from the repo root. It builds the examples and serves the site at `http://localhost:4400`.

A plain static server won't have `/examples/`, so `doc-example` embeds stay blank there. The browser preview tab is often hidden, so example iframes only resize on a screenshot. That's the preview, not a bug.

## Publish (only after the user approves)

The site is behind a password. Pushing is what deploys, so nothing is committed before approval.

1. Stage and commit from the **repo root**, not `docs-site/`:
   ```bash
   git -C "<repo-root>" add docs-site/docs/<path> docs-site/assets/docs.js
   git -C "<repo-root>" commit -m "Add <name> documentation"
   ```
   The pre-commit hook rebuilds stale prototypes and runs `npm run check`. If it blocks the commit, fix the cause; don't bypass it.
2. **Don't push.** The shell doesn't hold the user's GitHub credentials. Give them the command:
   ```bash
   git -C "<repo-root>" push
   ```
   If the team is working in branches and pull requests, the user pushes the branch and opens the PR. The Vercel preview deploy is what gets reviewed.
3. Report what changed: the files, the `SITE` entry, the commit. Say plainly that the push or merge is what makes it live.

## Standalone file

Only if a page truly has to stand alone (emailed, opened without the site):
inline `docs.css` and `docs.js` into a copy. Say that `doc-example` embeds won't
load outside the site, and link to the live site page instead where possible.

## Figma

If the user also wants a Figma version, see `figma-doc-kit.md`. When both
exist, they must match: same sections, tokens and wording.
