---
name: create-design-documentation
description: >-
  Create design documentation pages for the design specs site (docs-site in the
  Design Specs repo) for components, foundations, patterns, design decisions and
  guides, in the site's Soft notebook style built on the Modern UI tokens. Use
  this skill whenever the user asks to "create design documentation", "document
  this component", "write up specs for", "make a usage/anatomy page", "document
  the states of", "write up this design decision", or otherwise wants a
  component, pattern, token set or decision written up for other designers or
  engineers, including when they want it as an HTML page or a shareable link.
  A full documentation page in Figma is optional and only built when asked; for
  on-canvas Figma notes, use figma-section-annotation instead.
---

# Create design documentation

Design documentation explains a component, foundation, pattern or decision so
another designer or engineer can use it correctly without asking questions.
The default output is a page on the **design specs site**: `docs-site/` in the
Design Specs repo, deployed by Vercel.

Three things stay constant:

1. **The site style (Soft notebook).** The style is encoded in `docs-site/assets/docs.css`, built on the Modern UI tokens, and described in `references/documentation-style.md`. The repo files are the source of truth.
2. **The shared component library.** Every element is a `doc-*` Web Component in `docs-site/assets/docs.js` + `docs.css`. Pages compose from them and never fork styles. See `references/components.md`.
3. **The preview link rule** below.

## Where Figma fits

- **Default:** documentation lives on the site. In Figma, the component gets lighter on-canvas annotation with the `figma-section-annotation` skill, on its template page.
- **Optional:** a full documentation page in Figma, built from the doc kit in `references/figma-doc-kit.md`. Build it only when the user asks for it.

## Preview link rule (component and design decision pages)

Every preview pane links to **both**:
- **The Figma frame it shows:** the component variant or frame, or the sample page for a screen.
- **Its live version:** the showcase route (live example) or the HTML prototype.

| Element | Figma link | Live link |
| --- | --- | --- |
| `<doc-example src="…" figma="…">` | `figma` | Built in ("Open live example") |
| `<doc-prototype src="…" full="…" figma="…">` | `figma` | Built in ("Open this view", "Open full prototype") |
| `<doc-showcase src="…" href="…" live="…">` | `href` | `live` |

- Prefer a live preview (`doc-example` or `doc-prototype`) over a screenshot whenever one exists.
- If either link doesn't exist yet (e.g. a current-state screenshot of production with no prototype, or a frame not yet in Figma), don't leave it out silently. List it in the review step as missing, and ask whether to add it later or leave it.
- Before finishing, check every preview on the page against this rule.

## Page types

Confirm the type first; see `references/page-types.md`.
- **Foundations:** `docs/foundations/`
- **Components:** `docs/components/`. Amplify components go in `docs/amplify/components/`. These use live `doc-example` embeds.
- **Design Decisions:** `docs/`, starting from `assets/design-decision-template.html`. Problem, then options, then a recommendation that stays pending until sign-off.
- **Guides and resources:** `docs/`, plain structure.

## Workflow

### 1. Clarify scope

Ask only what you can't infer, then confirm in one line:
- **Page type and subject.**
- **Sections:** offer a starting set and let the user cut or add. Build only the sections that carry weight (Rams: as little design as possible). The menu, in order:
  - overview
  - anatomy
  - variants and states
  - usage (do and don't)
  - measurements and spacing
  - tokens
  - behavior
  - content
  - accessibility
  - related components
- **Sources:** the Figma file and nodes, the showcase routes, the prototypes.
- **Figma doc page:** whether the user also wants a full page in Figma. The default is no.

### 2. Gather real source material

- **Figma:** read the real component with the Figma tools (`get_metadata`, `get_design_context`, `get_screenshot`). Ignore hidden layers. Record the node URL for every variant or frame you'll show; the preview link rule needs them.
- **Code:**
  - Read the `ats-ui` component and its showcase route (`components/projects/showcase/src/app/pages/<name>/`) for the real inputs and embed params.
  - Read `prototypes/<name>/` for prototype views.
- **Unknowns:** if a value is unknown or unresolved, label it to be confirmed. Never guess a number.

### 3. Build the page

- Compose from the `doc-*` elements from the first line. No standalone HTML converted later.
- Link `docs.css` and `docs.js` at the right relative depth.
- Separate sections with whitespace and grouping, not divider lines (Gestalt proximity, common region).
- Show product UI only through live examples, prototypes or real Figma screenshots. Never redraw it.
- Write clearly and directly, verb-first, with no filler or marketing tone. Preserve the user's voice.
- Add the page to `SITE` in `docs-site/assets/docs.js`: `t`, `href`, `d`, and `s` or `cat` where used. The nav, search and cards are built from it.

### 4. Optional: Figma doc page

Only if asked. Load `figma-use` first, then follow `references/figma-doc-kit.md`.

### 5. Review

- **Check:** run `npm run docs` from the repo root to preview. Check the preview link rule on every pane, plus spacing rhythm, type hierarchy, and no stray borders or effects (craft skill).
- **Report:**
  - what was built
  - what was left out and why
  - any missing Figma or live links
  - any uncertain specs

  Justify structural choices with a named principle.
- **Wait for approval.** Nothing is committed before the user signs off.

### 6. Publish on approval

Follow `references/html-output.md`:
1. Commit from the **repo root**: the page plus the `docs.js` `SITE` change. The pre-commit hook runs the checks.
2. **Don't push.** Give the user the push command. If the team uses branches and pull requests, they push the branch and open a PR for review on the Vercel preview.
3. Report the files changed and the commit, and say plainly that the push or merge is what makes it live.

## Guardrails

- Do exactly what was asked. Don't add sections or systems unprompted. When unsure, do less.
- Don't invent facts, tokens, measurements or state names. Label uncertainty clearly and separately.
- Use existing components; never draw or imitate icons, buttons or product UI.
- Ignore hidden layers in Figma.
- No divider lines in the documentation.
- Don't edit generated files: the prototypes' built `index.html` or the token CSS.
