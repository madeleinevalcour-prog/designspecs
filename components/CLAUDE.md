# components — ats-ui (Angular)

Angular port of the system components from the legacy Astro prototype repo
(`~/ATS Redesign`), ported 1:1 from `src/components/*.astro` there. Figma is the
design source of truth. Part of the Design Specs monorepo — see `../CLAUDE.md`.

- `projects/ats-ui` — the component library (`ats-` prefix, standalone, signal inputs).
  - Tokens come from `../tokens/css/` (not stored here). `npm run build:lib` copies
    them into the package as `styles/tokens/`.
  - `assets/icons/` — the icon set, copied from the prototype repo's `public/icons/`.
    Served at `icons/` relative to the base href (override with the `ATS_ICON_PATH` token).
- `projects/showcase` — living reference app; one route per component in
  `src/app/pages/`. No query params → full matrix; params → compact embed for the docs
  (`<doc-example>`). Register new pages in `app.routes.ts` and the home page list.

Conventions: name components after the Figma component (Button → `button[ats-button]`).
Native-element components use attribute selectors so native semantics stay intact.
Styles use `ViewEncapsulation.None` namespaced under `.ats-<name>` so projected
content (icons) can be styled.

Commands: `npm start` (showcase on :4200) · `npm run build:lib` · `npm run build:examples` (→ `../docs-site/examples`).

Ported so far: Button, Icon, IconButtonNoContainer, Checkbox, Card family, Novo data table, Novo list family, RecordHeader, WorkflowStepper, Bowling Alley family (`lib/bowling-alley/`: shell, nav, tabs, overlays, Fast Find — rebuilt from Figma 157:511 / 1323:67008), SearchInput (`lib/search-input/`), ListItem (`lib/list-item/`), Amplify (`lib/amplify/`, exported; no showcase or doc page yet), SophiaFab.
Not ported (prototype-only): list-variations (removed — not a real component), ScreenShell, DemoPanel, StylingPanel, TestingControls, prospect/*, RecordPage, testing-july-2026/*, and the prototype's Header / Top Bar option (dropped from the bowling alley).
