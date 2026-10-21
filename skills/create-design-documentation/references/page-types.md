# Page types

Confirm the page type with the user before building. It decides the structure,
the folder, and where the page goes in the `SITE` list in
`docs-site/assets/docs.js`. All types share the style in
`documentation-style.md`; only the structure differs. Within a type, include
only the sections that carry weight (Rams: as little design as possible).

| Type | Folder | `SITE` group | Reference page |
| --- | --- | --- | --- |
| Foundations | `docs/foundations/` | Foundations | `docs/foundations/color.html` |
| Components | `docs/components/` | Components | `docs/components/button.html` |
| Amplify components and patterns | `docs/amplify/components/`, `docs/amplify/patterns/` | Amplify → Components / Patterns (with `cat`) | `docs/amplify/components/amplify-chat-reply.html` |
| Design Decisions | `docs/` | Design Decisions (with `s` status) | `docs/tab-contrast.html` |
| Guides and resources | `docs/` | Its own top-level entry, or Resources | `docs/contributing.html` |

## Foundations

System primitives: color, elevation, typography, spacing.

Typical sections: overview · the tokens (`doc-token-list` or `.tbl` with real
names and resolved values) · usage · do and don't. Never invent a value; mark
unresolved ones `pending`.

## Components

One component.

Typical sections: overview · anatomy · variants and states · usage (do and
don't) · measurements and spacing · tokens · behavior · accessibility ·
related components.

- Show the component with `<doc-example>` live embeds of its `ats-ui` showcase route. Never use stand-ins or screenshots when a route exists.
- Each embed carries `figma="…"` pointing at the variant or frame it shows.
- The component, its showcase route and the doc page ship in the same change (see the repo `CLAUDE.md`).

## Design Decisions

How a decision was made, short enough for a stakeholder to skim. Start from
`assets/design-decision-template.html`.

1. **Problem:** the feedback or research that prompted it (`doc-quote` for verbatim input), and the current state.
2. **Options:** an overview (optionally a `.tbl` comparison), then one section per option. Each option has a preview and a written Why it works / Trade-offs / Implementation.
3. **Recommendation:** `doc-recommendation status="pending"` until the user confirms. Don't present it as final on their behalf.

Layout:
- Each option uses `doc-split`, with the preview in `doc-media` and the text in `doc-body`.
- The rail and Back/Next build themselves from the `doc-section` elements.
- Previews are:
  - `doc-prototype` when an HTML prototype exists
  - `doc-example` for a component state
  - `doc-showcase` for a screenshot (images in `docs/images/`)
- Every preview links to both its Figma frame and its live version (see `SKILL.md`).
- Set the page's `s` status in `SITE` (e.g. `In progress`, `Complete`).

## Guides and resources

Pages that explain a process or collect references, e.g. the contributor guide.
Use plain `doc-page` and `doc-section` with tables, lists and callouts. There's
no required structure.

## Adding a page to the site

Add an entry to `SITE` in `docs-site/assets/docs.js`: `t` (title), `href`
(root-absolute), `d` (one-line card text), and optionally `s` (status) or `cat`
(sub-heading within an Amplify group). The side nav, search, section overview
pages and home cards are all built from `SITE`. There is no hand-maintained
link list in `index.html`.
