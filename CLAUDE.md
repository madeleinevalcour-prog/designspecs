# Design Specs — tokens, components, docs

One repo for the ATS redesign design system. GitHub
`madeleinevalcour-prog/designspecs`, deployed to Vercel on push to `main`
(settings in `vercel.json`).

| Folder | What | Notes |
|--------|------|-------|
| `tokens/` | Figma variable exports → token CSS | single source for everything below |
| `components/` | Angular workspace: `ats-ui` library + `showcase` app | see `components/CLAUDE.md` |
| `docs-site/` | static design-documentation site (no build step) | see `docs-site/README.md` |
| `prototypes/` | HTML prototypes, built into `docs-site/prototypes/*/index.html` | see each `README.md` |

The legacy Astro prototypes stay in `~/ATS Redesign` (still live at
ats-redesign.vercel.app) and are **not** part of this repo. Prototypes are only
brought over if rebuilt in Angular, and only when needed. Components are ported
1:1 from `~/ATS Redesign/src/components/*.astro`.

## Tokens
1. Re-export both variable collections from Figma (Variables Pro).
2. Replace `tokens/subatomic.json` and `tokens/component-migration.json`.
3. `npm run tokens` (or `npm run tokens:watch`) → regenerates `tokens/css/primitives.css`,
   `semantic.css`, `components.css`, then rebuilds the prototypes. Generated; don't hand-edit.
4. If Figma renamed tokens, `npm run check` lists every `var(--…)` that no longer resolves.
- `tokens/css/typography.css` and `elevation.css` are Figma **styles**, captured by
  hand with the Figma MCP (`get_design_context`); update them by hand.
- `tokens/css/index.css` imports the whole chain; the showcase and the `ats-ui`
  package both use it. CSS var names = Figma variable paths with `/` → `-`.

## Skills: the repo is the source of truth
The design system's Claude skills live in `skills/<name>/` (`SKILL.md` plus any `references/`,
`assets/`), each packaged as `skills/<name>.skill`. Skills in a Claude account are copies.
When any of these skills changes, in this order:
1. Edit `skills/<name>/` in the repo, never only the account copy. If the account copy has
   changes the repo doesn't, bring them into the repo first and tell the user.
2. `npm run skills` repackages every out-of-date `.skill` (deterministic, so unchanged skills
   don't change).
3. Update the account copy: if only `SKILL.md` changed, save it with `save_skill`
   (`overwrite: true`, same name, description = the frontmatter `description`); if any other
   file changed, present `skills/<name>.skill` so the user clicks Save skill.
4. Commit `skills/<name>/` and `skills/<name>.skill` together. The pre-commit hook blocks the
   commit if a `.skill` is out of date with its folder.

## Workflow: every component ships with a doc page
When a component is built or ported, in the same change:
1. Component in `components/projects/ats-ui/src/lib/<name>/` (+ export in `public-api.ts`).
2. Showcase route in `components/projects/showcase/src/app/pages/<name>/` with an embed
   mode (query params), registered in `app.routes.ts` + the home list.
3. Doc page `docs-site/docs/components/<name>.html` — Amplify components go in
   `docs-site/docs/amplify/components/<name>.html` (create-design-documentation skill,
   Components type), using `<doc-example>` live embeds — never stand-ins or screenshots.
   **Every preview pane links to both its Figma frame and its live version** — on component and
   design decision pages alike. The Figma link points at the node it shows (the variant, frame or
   sample page, e.g. `https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=6835-133241`);
   the live link is the showcase route or HTML prototype:
   - `<doc-example src="…" figma="…">` → "Open live example ↗" + "Open in Figma ↗"
   - `<doc-prototype src="…" figma="…">` → "Open this view ↗" / "Open full prototype ↗" + "Open in Figma ↗"
   - `<doc-showcase href="figma" live="/examples/… or /prototypes/…">` → "Open frame in Figma ↗" + "Open live preview ↗"
   If one doesn't exist yet, say so in the report rather than leaving it out silently. Add these before committing.
4. Add it to the `SITE` list in `docs-site/assets/docs.js` (title + one-line `d` card text). The side nav,
   search, section overview pages and home page cards are all built from `SITE`.
Docs are committed only after the user approves the page.

## Live examples in the docs
- Each component has a showcase route (`components/projects/showcase/src/app/pages/`).
  No query params → full reference matrix; with params → a compact embed.
- `npm run build` compiles the showcase into `docs-site/examples/` (gitignored) with
  base href `/examples/`. Vercel runs this on deploy; `vercel.json` rewrites
  `/examples/*` to the app.
- `<doc-code caption="Angular">` renders an HTML-escaped code sample.
- In a doc page: `<doc-example src="button?theme=primary&label=Save" caption="…"></doc-example>`
  (defined in `docs-site/assets/docs.js`; the iframe auto-sizes via postMessage).

## Commands (repo root)
- `npm run components` — showcase dev server (http://localhost:4200, live reload)
- `npm run docs` — build examples + serve docs-site at http://localhost:4400
- `npm run tokens` / `npm run tokens:watch`
- `npm run prototypes` — rebuild every `prototypes/*/build.py`
- `npm run skills` — repackage every out-of-date `skills/<name>.skill` (`--check` to only verify)
- `npm run check` — fail on any `var(--…)` with no definition (prototypes, ats-ui + tokens).
  `npm run build` runs it first, so a broken token reference fails the Vercel deploy
  (the last good deploy stays live).
- First time: `npm ci --prefix components` and `git config core.hooksPath .githooks`
  (pre-commit hook: blocks the commit if a staged skill's `.skill` is out of date; rebuilds
  the prototypes when tokens/components/prototypes are staged, blocks the commit if they
  were stale, then runs the check)

## Password protection
- `middleware.js` (repo root, Vercel Routing Middleware) puts every path behind the
  sign-in page in `login-page.js` (inline styles mirroring `docs.css`; keep them in
  sync). Password = `SITE_PASSWORD` env var in Vercel project settings (Production +
  Preview); unset → the site returns 503. The form posts to `/__login`, which sets a
  30-day `ds_auth` cookie (HMAC of the password, so changing it signs everyone out);
  `/__logout` clears it.
- No npm imports on purpose: the install step only installs `components/`, so root
  deps aren't available. Local `npm run docs` isn't protected.

## Gotchas
- The prototypes' `index.html` files inline tokens + component CSS at build time. Never
  edit or find-and-replace them; change the source and rebuild. (A token rename once
  updated their component CSS but not their inlined tokens, and they lost their spacing.)
- ng-packagr can't copy assets from outside the library, so `components` `build:lib`
  copies `tokens/css` into `dist/ats-ui/styles/tokens` itself.
- Unset query params bind as `undefined` (with `withComponentInputBinding`) and
  override input defaults — apply defaults in a computed, not on the input.
- The browser-preview tab is often hidden: ResizeObserver/rAF don't fire there, so
  the iframe auto-height only updates on a screenshot. That's the preview, not a bug.
