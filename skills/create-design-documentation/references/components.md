# Component system (HTML pages)

Every page on the design specs site composes from one shared component library.
That keeps pages short, and a change to any element is made in one place.

- `docs-site/assets/docs.css`: all styles. See `documentation-style.md`.
- `docs-site/assets/docs.js`: the custom elements, the site chrome (header, side nav, search, overview cards, all built from the `SITE` list), the rail, Back/Next and the lightbox. Plain Web Components with no build step.

The repo copies are the source of truth. This skill's `assets/` holds a snapshot only for seeding a new repo; don't copy it over the repo's files. The snapshot's `SITE` list is the design specs site's own.

## Linking the files

Use paths relative to the page:

```html
<link rel="stylesheet" href="../assets/docs.css">
<script src="../assets/docs.js" defer></script>
```

A page under `docs/` uses `../assets/`. A page under `docs/components/` or `docs/foundations/` uses `../../assets/`. A page under `docs/amplify/components/` uses `../../../assets/`.

Never fork styles into a page. A page may add a small page-scoped `<style>` only for one-off content.

## Elements

| Element | Purpose |
| --- | --- |
| `<doc-page eyebrow title [intro] [meta] [status]>` | Page wrapper: header, column, rail. `status` shows a pill above the title. |
| `<doc-section id label desc [badge] [badge-tone="success"]>` | A section. `label` becomes the H2; `id`, `label` and `desc` feed the rail and Back/Next. |
| `<doc-split>` / `<doc-media>` / `<doc-body>` | Preview left, text right; stacks on narrow screens. |
| `<doc-example src [figma] [caption] [height] [viewport]>` | A live `ats-ui` showcase route from `/examples/<src>`. `viewport="1440"` renders a whole screen scaled to the column. Can hold `<doc-marker n for href>` numbered markers. |
| `<doc-prototype src [full] [figma] [caption] [viewport] [height]>` | An HTML prototype (`/prototypes/<name>/index.html?…`) scaled to the column. |
| `<doc-showcase src alt [href] [live] [caption] [ph]>` | A screenshot in a frame, opening in the lightbox. `href` = Figma frame, `live` = live example or prototype. `ph` = placeholder text until the image exists. |
| `<doc-tabs label>` + `<doc-tab label>` | Tabs between alternative views; panels stay loaded. |
| `<doc-carousel>` | Paged screens with prev/next and a count. |
| `<doc-code caption>` | An HTML-escaped code sample. |
| `<doc-callout type="do\|dont\|note" heading>` | Tinted callout. |
| `<doc-quote who>` | Verbatim feedback or research. |
| `<doc-spec>` | Row of `<span class="pair"><b>Label:</b> value</span>`. |
| `<doc-swatches>` + `<doc-swatch color name value [pending]>` | Compact swatches. |
| `<doc-token-list>` + `<doc-token color name value [pending]>desc</doc-token>` | Foundations token rows. |
| `<doc-recommendation status="pending\|final" heading>` | Recommendation block. |
| `<doc-overview [section]>` | Cards for one `SITE` section, or for every section. |

Inline helpers (classes): `.chip`, `.lead`, `.kicker`, `.eyebrow`, `.meta`, `.tbl` (+ `.em` row), `.mono`, `details.grp`, `a.doc` (link card), `.linkrow`. (The resource cards on `resources.html` are page-scoped styles, not shared.)

## Preview link rule

On component and design decision pages, every `doc-example`, `doc-prototype` and `doc-showcase` links to both its Figma frame (`figma` or `href`) and its live version (the example itself, the prototype, or `live`). See `SKILL.md`.

## Adding to the library

If a page needs a new repeated element, add it to `docs-site/assets/docs.js` (and `docs.css`) as a custom element with a usage comment above it. Don't hand-write the markup in a page. Then update this file and `documentation-style.md`.
