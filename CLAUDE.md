# Design Specs — tokens, components, docs

One repo for the ATS redesign design system. GitHub
`madeleinevalcour-prog/designspecs`, deployed to Vercel on push to `main`
(settings in `vercel.json`).

| Folder | What | Notes |
|--------|------|-------|
| `tokens/` | Figma variable exports → token CSS | single source for everything below |
| `components/` | Angular workspace: `ats-ui` library + `showcase` app | see `components/CLAUDE.md` |
| `docs-site/` | static design-documentation site (no build step) | see `docs-site/README.md` |

The legacy Astro prototypes stay in `~/ATS Redesign` (still live at
ats-redesign.vercel.app) and are **not** part of this repo. Prototypes are only
brought over if rebuilt in Angular, and only when needed. Components are ported
1:1 from `~/ATS Redesign/src/components/*.astro`.

## Tokens
1. Re-export both variable collections from Figma (Variables Pro).
2. Replace `tokens/subatomic.json` and `tokens/component-migration.json`.
3. `npm run tokens` (or `npm run tokens:watch`) → regenerates `tokens/css/primitives.css`,
   `semantic.css`, `components.css`. Generated; don't hand-edit.
- `tokens/css/typography.css` and `elevation.css` are Figma **styles**, captured by
  hand with the Figma MCP (`get_design_context`); update them by hand.
- `tokens/css/index.css` imports the whole chain; the showcase and the `ats-ui`
  package both use it. CSS var names = Figma variable paths with `/` → `-`.

## Live examples in the docs
- Each component has a showcase route (`components/projects/showcase/src/app/pages/`).
  No query params → full reference matrix; with params → a compact embed.
- `npm run build` compiles the showcase into `docs-site/examples/` (gitignored) with
  base href `/examples/`. Vercel runs this on deploy; `vercel.json` rewrites
  `/examples/*` to the app.
- In a doc page: `<doc-example src="button?theme=primary&label=Save" caption="…"></doc-example>`
  (defined in `docs-site/assets/docs.js`; the iframe auto-sizes via postMessage).

## Commands (repo root)
- `npm run components` — showcase dev server (http://localhost:4200, live reload)
- `npm run docs` — build examples + serve docs-site at http://localhost:4400
- `npm run tokens` / `npm run tokens:watch`
- First time: `npm ci --prefix components`

## Gotchas
- ng-packagr can't copy assets from outside the library, so `components` `build:lib`
  copies `tokens/css` into `dist/ats-ui/styles/tokens` itself.
- Unset query params bind as `undefined` (with `withComponentInputBinding`) and
  override input defaults — apply defaults in a computed, not on the input.
- The browser-preview tab is often hidden: ResizeObserver/rAF don't fire there, so
  the iframe auto-height only updates on a screenshot. That's the preview, not a bug.
