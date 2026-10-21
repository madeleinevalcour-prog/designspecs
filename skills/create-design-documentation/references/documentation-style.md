# Soft notebook — documentation style spec

The visual language of the design specs site (`docs-site/`). It is encoded in
`docs-site/assets/docs.css`, which is the source of truth. This file describes
what's there so pages and extensions stay consistent. If this file and
`docs.css` disagree, `docs.css` wins; update this file.

The site uses the **Modern UI tokens** for color and type, with the values
mirrored at the top of `docs.css`, because the site deploys without the
`tokens/` folder. The documentation reads as documentation through its layout
(white page, one reading column, generous space, a quiet frame around every
example), not through a separate palette. Product UI is shown only as live
examples, prototypes or Figma screenshots, never redrawn.

## Contents

- Color
- Typography
- Layout and site chrome
- Spacing
- Callouts, quotes and recommendations
- Tables, specs, tokens and swatches
- Preview panes
- Status pills
- Style do and don't

## Color

Doc roles in `docs.css`, each bound to a Modern UI semantic token:

| Role (CSS var) | Token | Value | Use |
| --- | --- | --- | --- |
| `--canvas` | `color/background/default` | `#ffffff` | Page background |
| `--mat` | `color/background/subtle` | `#f7f8f8` | Hover fills, neutral note background |
| `--ink` | `color/text/headline` | `#2f2f33` | Headings, card titles |
| `--ink-body` | `color/text/body` | `#3d464d` | Body text |
| `--ink-2` | `color/text/secondary` | `#525b63` | Lead paragraphs, table headers, descriptions |
| `--ink-muted` | `color/text/subtle` | `#677079` | Meta, eyebrows, kickers, list markers |
| `--hairline` | `color/background/subtle-hover` | `#ebedef` | Table rows, showcase frame edge |
| `--edge` | `color/border/subtle` | `#dee0e3` | Card and Back/Next borders |
| `--chip` | `color/background/subtle-hover` | `#ebedef` | Mono token chips |
| `--link` | `color/text/link` | `#296cc3` | Links (hover `#1450a0`) |
| Focus ring | `color/border/focus` | `#4a89dc` | 2px outline, 2px offset |
| `--do-fill` / `--do-ink` | utility green 100 / 700 | `#f3ffe6` / `#366504` | Do callouts, recommendation |
| `--dont-fill` / `--dont-ink` | utility red 100 / 600 | `#ffe6e8` / `#9f111f` | Don't callouts, pending marks |
| `--note-fill` / `--note-ink` | background subtle / text body | `#f7f8f8` / `#3d464d` | Note callouts, quotes |

The link blue is the only accent in the chrome. Keep it to links.

## Typography

Inter for everything (loaded from Google Fonts, `system-ui` fallback). Mono:
`ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`. Weights 400, 500
and 600 only.

| Level | Size / line height / weight | Notes |
| --- | --- | --- |
| H1 (page title) | 24 / 32 / 600 | One per page, from `doc-page title` |
| H2 (section) | 20 / 28 / 600 | From `doc-section label`; 12 below |
| H3 | 18 / 24 / 600 | 8 below |
| Body | 16 / 24 / 400 | Paragraphs and lists max 68ch |
| Table, spec, card description | 14 / 20 / 400 | |
| Meta, eyebrow, kicker | 12 / 14 / 500 | `--ink-muted` |
| Table header | 12 / 16 / 600 | `--ink-2` |
| Mono | 13 (inline) / 12 (chips, tokens) | |

Sentence case everywhere. No all caps. Headings and short labels take no
terminal punctuation.

## Layout and site chrome

`docs.js` injects the chrome; pages don't build it.
- **Header:** 56 tall, with the logo, a nav toggle and search.
- **Side nav:** 280 wide. It pushes the page on wide screens and slides over it on narrow ones.
- **Built from `SITE`:** the header search, side nav, section overview cards and home cards all come from the `SITE` list in `docs.js`.
- **Shell:** max width 1240, padding 48 / 40 / 96, 56 gap to the rail.
- **Main column:**
  - 960 max on pages with a rail
  - 760 on single-section pages
  - 1080 when the page holds a `doc-overview`
- **"On this page" rail:** 216 wide, sticky on the right, with Back/Next at the foot of each section. It's added automatically to any page with more than one `doc-section id`. The old `rail` attribute does nothing.
- **Sections:** 56 apart (first has none). Sections are separated by space alone. No divider lines.

## Spacing

The 4/8 grid.
- Paragraph and list bottom margin: 12. List items: 8.
- Page header to first section: 40.
- Callout padding: 14 / 16. Quote padding: 16 / 18. Recommendation padding: 20 / 22.
- Radius:
  - 8 for callouts, quotes, showcase frames, cards and Back/Next buttons
  - 10 for recommendations
  - 4 for chips
  - 20 for status pills

## Callouts, quotes and recommendations

- **Callouts:** `<doc-callout type="do|dont|note" heading>` is a tinted block with no border, max 62ch. Use a short bold heading and one idea. A callout that needs a paragraph is really a section.
- **Quote:** `<doc-quote who>` for verbatim feedback or research, on the note fill, with the attribution in meta.
- **Recommendation:** `<doc-recommendation status="pending|final" heading>` on the do fill. Keep it `pending` until the user signs off.

## Tables, specs, tokens and swatches

- **Table:** `.tbl` at 14/20. Hairline row borders are the only rules on the site. `.em` marks an emphasized row.
- **Spec pairs:** `<doc-spec>` with `<span class="pair"><b>Label:</b> value</span>`.
- **Token chips:** `.chip` (mono 12, chip fill, 4 radius). Always use the real token name, never a raw hex.
- **Swatches:** `<doc-swatch>` (34 square) for comparisons, and `<doc-token>` (56 square plus a description) for Foundations. Mark unresolved values `pending`.

## Preview panes

Every example sits in a `figure.showcase`: white fill, a 1px hairline edge and 8 radius, with a caption bar under the example holding its links.

| Element | Shows | Links in the caption |
| --- | --- | --- |
| `<doc-example src figma>` | A live `ats-ui` showcase route from `/examples/` | Open live example, Open in Figma |
| `<doc-prototype src full figma>` | An HTML prototype scaled to the column | Open this view, Open full prototype, Open in Figma |
| `<doc-showcase src href live>` | A screenshot, which opens in the lightbox | Open frame in Figma, Open live preview |

Every preview pane on component and design decision pages carries both links. See the rule in `SKILL.md`.

## Status pills

`doc-page status="…"`, `doc-section badge="…"` and the `s` field in `SITE` render a pill.
- Default is yellow: `#fdf0d5` fill, `#7a4b00` text.
- `Complete` and `badge-tone="success"` are green.

## Style do and don't

- **Do:** let whitespace and grouping separate sections (Gestalt proximity, common region).
- **Do:** reference real tokens and measured values.
- **Do:** show product UI only as live examples, prototypes or real Figma screenshots.
- **Don't:** add divider lines, gradients, glows or extra shadows to the chrome.
- **Don't:** fork styles into a page. Extend `docs.css` and `docs.js` instead, so every page updates together.
- **Don't:** let the link blue spread beyond links.
