# Amplify documentation restructure — instructions for Claude Code

Brings all Amplify documentation into one top-level **Amplify** section of the docs site. Work through the phases in order. Stop at each **Checkpoint** and show me the result before continuing.

## Ground rules

- Follow `CLAUDE.md` and `components/CLAUDE.md`, including "every component ships with a doc page".
- Use the `create-design-documentation` skill for every new or rewritten doc page (Soft notebook style, `<doc-page>`, `<doc-section>`, `<doc-callout>`, `<table class="tbl">`).
- Use `<doc-example>` live embeds for components. No screenshots or stand-ins for components.
- **Do not mention Rovo, Atlassian, or any outside design system as inspiration anywhere in the UI.** This covers page copy, intros, callouts, `meta` attributes, `<title>`, captions, alt text and HTML comments.
- Do not invent content. Every sentence on a new page must come from an existing page or MD file in the repo. When a page needs content that doesn't exist yet, add a `<doc-callout type="note" heading="To be written.">` naming what's missing. Don't fill the gap yourself.
- New principle or rule text that you draft (only where these instructions say so) goes in a `<doc-callout type="note" heading="Draft — needs approval.">`.
- Don't add divider lines (`<hr>`, or `---` in MD).
- Don't commit. Docs are committed only after I approve each page.
- Ignore hidden layers in any Figma file.

## Decisions already made

- **Add prospect contacts:** keep v2 (`amplify-chat-prospect-add-flow-v2.html`). v1 gets retired (Phase 6).
- **Elevation:** combined with surfaces into one foundation page, "Surfaces and elevation".
- **Amplify Button and Icon Container:** links to the existing core pages only. No new pages.
- **Amplify icon:** gets its own component page (`bhi-amplify`). About Amplify UI must also cover using the icon to identify Amplify features and functionality.
- **Relevance signals:** become their own Amplify component page.
- **Motion:** out of scope.
- **Signals label:** the label changes by context. "Relevance Signals" is the default; contextual labels such as "Hiring signals" (v2 prospect mockup) are allowed. This matches the component's existing `label` input.
- **Icon variants:**
  - Filled (`amplify.svg`) is the default.
  - Line (`amplify-line.svg`) is for unselected or disabled states, or when less emphasis is needed.
- **Icon name:** `bhi-amplify` (Novo) and `<ats-icon name="amplify">` (ats-ui) are the same icon. List both names on the page.
- **File locations:** all Amplify doc pages live under `docs-site/docs/amplify/`. The 12 existing `docs/components/amplify-chat-*.html` pages move to `docs/amplify/components/` (Phase 1a).

## Target structure

All Amplify pages go in `docs-site/docs/amplify/`. Component pages go in `docs-site/docs/amplify/components/`. For Amplify pages, this replaces the `docs-site/docs/components/<name>.html` path in the `CLAUDE.md` workflow; the rest of that workflow still applies.

- **Amplify** — `docs/amplify/index.html` (overview landing)
  - About Amplify UI — `docs/amplify/about.html`
  - AI interaction guidelines — `docs/amplify/ai-interaction-guidelines.html`
- **Foundations**
  - Color — `docs/amplify/foundations/color.html`
  - Surfaces and elevation — `docs/amplify/foundations/surfaces-and-elevation.html`
  - Text styles — `docs/amplify/foundations/text-styles.html`
  - Spacing and layout — `docs/amplify/foundations/spacing-and-layout.html`
  - Voice and tone — `docs/amplify/foundations/voice-and-tone.html`
- **Components**, grouped on the landing page and `index.html` (the drawer shows them as one ordered list; see Phase 1b)
  - Amplify indicators: Amplify icon (new, `components/amplify-icon.html`), Button `amplify` theme (link), Icon Container `amplify` theme (link)
  - Surfaces: Full-page chat, Docked chat (this already covers docked and pop-over)
  - Conversation: User messages, Reply, Text, Sources
  - Response content: Blocks, Data table, Cards, Relevance signals (new, `components/amplify-chat-relevance-signals.html`), Selection
  - Input: Chat input, Clarifying questions
- **Patterns**
  - Response structure — `docs/amplify/patterns/response-structure.html`
  - Records and sources — `docs/amplify/patterns/records-and-sources.html`
  - Status and loading — `docs/amplify/patterns/status-and-loading.html`
  - Record actions in chat — `docs/amplify/patterns/record-actions.html`
  - Adding prospect contacts — `docs/amplify/patterns/adding-prospect-contacts.html`
  - Workflow examples — `docs/amplify/patterns/workflow-examples.html`
  - Amplify in the page layout — `docs/amplify/patterns/amplify-in-layout.html`
- **Resources**
  - Resources — `docs/amplify/resources.html`
  - Background and open questions — `docs/amplify/background.html`

Rationale, for reference: one container for all Amplify content (Gestalt — common region); grouping components by role (Gestalt — proximity); one source per topic (Nielsen #4 — consistency and standards; Rams #10 — as little design as possible).

## Phase 1a — Move existing Amplify component pages

1. Use `git mv` to move all 12 files from `docs-site/docs/components/amplify-chat-*.html` to `docs-site/docs/amplify/components/`, keeping the file names so history is preserved.
2. Fix relative paths in each moved file. Each file is now one level deeper.
   - `../assets/` → `../../assets/`
   - `../images/` → `../../images/`
   - `../amplify/<file>` → `../<file>`
   - Links to core component pages (e.g. `button.html`, `menu.html#menu-item`, `dropdown.html`) → `../../components/<file>`
   - Links between moved Amplify pages (`amplify-chat-*.html`) stay as they are.
   - Don't change `<doc-example src="...">`. Embeds resolve from `/examples/`.
3. Update every inbound link to the old paths across `docs-site/` (core component pages, foundations, resources, the patterns page, the flow mockups, `index.html`, `docs.js`). Search for `components/amplify-chat-` to find them.
4. Keep old URLs working. Add a `redirects` array to `vercel.json`: one permanent redirect per file, `/docs/components/amplify-chat-<name>.html` → `/docs/amplify/components/amplify-chat-<name>.html`. Leave `rewrites`, `buildCommand` and the other settings alone.
5. Update the "Workflow: every component ships with a doc page" section in the root `CLAUDE.md`: Amplify component doc pages go in `docs-site/docs/amplify/components/<name>.html`. Change only that line.

## Phase 1b — Nav skeleton

1. In `docs-site/assets/docs.js`, change the `SITE` list:
   - Remove the `groups` ("Amplify components") block from the Components group.
   - Replace the current `{label:"Amplify", ...}` group with one Amplify group:
     - `pages`: Overview (`/docs/amplify/index.html`), About Amplify UI, AI interaction guidelines.
     - `groups` (sub-groups, which the drawer already supports): "Foundations", "Components", "Patterns", "Resources", each with its pages from the target structure.
     - Components sub-group order: Amplify icon, Button (amplify) → `/docs/components/button.html#<amplify anchor>`, Icon Container (amplify) → `/docs/components/icon-container.html#<amplify anchor>`, then the Amplify component pages at `/docs/amplify/components/...`: Full-page chat, Docked chat, User messages, Reply, Text, Sources, Blocks, Data table, Cards, Relevance signals, Selection, Chat input, Clarifying questions.
   - Find the real anchor IDs for the Amplify content on `button.html` and `icon-container.html`. If there's no anchor, add an `id` to the existing heading or section. Don't change any of the copy.
   - Keep the order: Foundations, Components, Amplify, Design Decisions, Resources.
2. In `docs-site/index.html`:
   - Remove the "Amplify components" sub-label block from the Components group.
   - Replace the "Amplify" group with the new structure, using `group-sublabel` for Foundations, the five component categories, Patterns and Resources.
   - Each card's `desc` comes from the target page's `intro`.
3. Create every target page as a stub: a `<doc-page>` with the eyebrow "Amplify", a title, a one-line intro, and a `<doc-callout type="note" heading="To be written.">`. This keeps every nav link working while the later phases fill pages in.

**Checkpoint 1:** run `npm run docs` and show me the drawer and `index.html`.

## Phase 2 — Overview pages

### `docs/amplify/index.html` (landing)

- One `<doc-section>` per group: Overview, Foundations, Components, Patterns, Resources.
- Each page appears as a card: the title plus a one-line description taken from that page's intro. Reuse the `a.doc` card markup from the root `index.html`.
- Group the components by the five categories.

### `docs/amplify/about.html` — About Amplify UI

Sections:

1. **What Amplify is** — from `docs/resources/amplify-design-reference.md`: "What is Amplify", "Users", "Capabilities", "How Amplify Works". Rewrite into doc-page markup without changing the meaning.
2. **Principles for Amplify UI** — gather the existing rules that govern how Amplify looks:
   - The gradient is a meaning cue, not decoration (`color.html#amplify`).
   - The Amplify gradient marks AI-assisted features (`principles.html`).
   - Adding Amplify must not take away existing controls (`amplify-design-reference.md`, principle 2).
   - The right pane is Amplify-first space (`form-pages-design-decisions.html`).
   - Put each in a short titled block with its source. If you see an obvious missing principle, it goes in a "Draft — needs approval." callout.
3. **Identifying Amplify with the icon** — required:
   - The Amplify icon marks a feature, action or piece of content as Amplify-powered. Pair it with the gradient rule from section 2.
   - List every current use, verified in code (`components/projects/ats-ui/src/lib`):
     - Bowling alley Amplify tab, 14px (`main-tabs.ts`)
     - Relevance signals label, 12px (`relevance-signals.ts`)
     - Record header Amplify button (`record-header.html`)
     - Icon Container `amplify` theme
     - Search the lib for any other uses
   - Variants: filled is the default. Line is for unselected or disabled states, or when less emphasis is needed.
   - Do and don't (`type="do"` / `type="dont"`): use it only on Amplify-powered features; don't use it as a generic "magic", "new" or decorative icon. Wording beyond these rules goes in a draft callout.
   - Link to the Amplify icon component page.

### `docs/amplify/ai-interaction-guidelines.html`

- Source: `amplify-design-reference.md` — "Design Principles for AI Software" and "What Good Looks Like in Practice".
- One `<doc-section>` per principle, keeping the numbering and wording.
- Keep the source attributions that are already in the MD (Google PAIR, IBM, Microsoft, Salesforce). Don't add any.

**Checkpoint 2:** show me all three pages.

## Phase 3 — Foundations

| Page | Source | Notes |
|------|--------|-------|
| Color | `docs/foundations/color.html` `#amplify` section | Move the whole section, including tiles and `doc-spec` blocks. In core Color, replace it with a two-line summary and a link. Add a "Token gaps" callout listing the missing gradient/tint tokens noted in `button.html`, `icon-container.html`, `bowling-alley.html` and `record-header.html`. |
| Surfaces and elevation | `elevation.html` (level 3 right), Full-page chat and Docked chat pages, the patterns page "surfaces" section (`#surfaces`) | Sections: **Surfaces** (full page, docked, pop-over; when each is used) and **Elevation** (the level used by each surface). Link to the component pages; don't repeat their specs. Core Elevation keeps its row and gets a link. |
| Text styles | Patterns page `#styles` and `#structure` (headings, lists, emphasis, entity links) | Move as is. |
| Spacing and layout | Patterns page `#spacing` (incl. column width) | Move as is. |
| Voice and tone | `docs/resources/amplify-chat-interface-patterns.md` — "Voice" | First check whether `amplify-chat-interface-patterns.html` has voice content anywhere in the body. Use the HTML version if it does, the MD if not. |

The patterns page is `docs/amplify/amplify-chat-interface-patterns.html`. Don't delete anything from it yet (see Phase 6).

**Checkpoint 3:** show me the five foundation pages and the trimmed core Color and Elevation pages.

## Phase 4 — Components

### Amplify icon (new) — `docs/amplify/components/amplify-icon.html`

Follow the four-step `CLAUDE.md` workflow. The doc page path is the Amplify components folder.

1. **Component.** No new component. The glyph is `<ats-icon name="amplify">`, with `amplify-line` as the line variant, from `components/projects/ats-ui/assets/icons/`. Check how `bowling-alley.css` (`.ats-bowling-alley__amplify-glyph`) and `relevance-signals.ts` colour or fill the icon. Document what the code actually does.
2. **Showcase route** `components/projects/showcase/src/app/pages/amplify-icon/`:
   - No params → matrix of both variants × sizes in use (12, 14, 16, 24) × colour treatments found in step 1.
   - Embed params: `variant`, `size`, `treatment`. Apply defaults in a `computed` (see the `CLAUDE.md` gotcha).
   - Register in `app.routes.ts` and the home list.
3. **Doc page** (Components type), sections:
   - Overview — what it marks. Link to About Amplify UI → "Identifying Amplify with the icon".
   - Variants:
     - **Filled** (`amplify`) — the default.
     - **Line** (`amplify-line`) — unselected or disabled states, or when less emphasis is needed.
     - Show both with live examples. Find a real unselected/disabled use in the lib if there is one. If there isn't, say so in a note; don't invent one.
   - Names — `bhi-amplify` in Novo and `<ats-icon name="amplify">` in ats-ui are the same icon. Show both in a `<doc-code>` block.
   - Sizes and colour, with live `<doc-example>`s.
   - Where it's used — the list from About.
   - Do and don't.
   - Accessibility — decorative when it sits next to a text label (`aria-hidden`). An icon-only control needs an accessible name. Check `icon.html` for the existing pattern and match it.
   - Token gaps — the gradient fill if it has no token.
   - Figma — find the icon in the Figma file. Ignore hidden layers.
4. **Links** — in `index.html` and the `SITE` list (done in Phase 1b; check them).

### Relevance signals (new) — `docs/amplify/components/amplify-chat-relevance-signals.html`

1. **Component** — already exists: `components/projects/ats-ui/src/lib/amplify-chat/cards/relevance-signals.ts` (`ats-amplify-chat-relevance-signals`, Figma "relevance-signals" 6152:126071). Confirm it's exported via `cards/index.ts` → `public-api.ts`. Change no code.
2. **Showcase route** `pages/amplify-chat-relevance-signals/`:
   - No params → matrix: 1, 3 and many signals; default and custom `label`; default and added/subtle background, if that state exists in the component CSS. Check `chat-list-item.css` first. The v2 mockup has a `.card.added .signals` state.
   - Embed params: `signals` (comma-separated), `label`.
   - Register the route.
3. **Doc page** (Components type). Source: the `#relevance-signals` section of `docs/amplify/components/amplify-chat-cards.html` (moved in Phase 1a), plus the component's JSDoc. Sections:
   - Overview
   - Anatomy — sparkle icon, label, chips, gradient border
   - Content rules: short and factual; the examples already in the docs ("Director-level", "Department Match: Project Management", "Previously contacted")
   - "Relevance signals belong to Prospect. Relevancy dots belong to candidate search. They never appear in the same reply." (keep verbatim)
   - Label — "Relevance Signals" is the default. The `label` input sets a contextual label, e.g. "Hiring signals" (v2 prospect flow). Show both with live examples. Add a do/don't: keep the label short, and describe why the record was picked.
   - Usage inside Cards, with a `<doc-example>` of the `prospect-contact` card
   - Accessibility
   - Figma node
4. **Cards page** — replace the full `#relevance-signals` section in `amplify-chat-cards.html` with a one-line summary and a link to the new page. Keep the `id="relevance-signals"` anchor so existing links still land.

### Existing Amplify component pages

- Already moved in Phase 1a. Change only what's needed:
  - `<title>` suffix: "— Amplify components — design documentation" stays.
  - Each page gets the eyebrow "Amplify · Components" if `doc-page` supports eyebrows on component pages. Check the skill first.
- `button.html` and `icon-container.html`: add a line in the Amplify section linking back to `/docs/amplify/index.html`.

**Checkpoint 4:** show me both new component pages, their showcase routes (matrix and one embed each), and the updated Cards page.

## Phase 5 — Patterns

All pattern pages are `<doc-page>` documents (eyebrow "Amplify · Pattern").

| Page | Source | Notes |
|------|--------|-------|
| Response structure | Patterns page `#response-structure`, `#components` (intro only), `#choosing-a-format` | Keep the format-choice table. Link to each component page instead of repeating `#prose`, `#lists`, `#data-table`, `#cards`, `#selection`, `#draft-block`, `#literal-value-block`. Move any rule found only on the patterns page, and not on the component page, onto the component page. List those moves for me. |
| Records and sources | Patterns page `#records` | Link to Sources and Relevance signals. |
| Status and loading | Patterns page `#status` | Add a "To be written." callout for a generating/loading indicator component. |
| Record actions in chat | `amplify-chat-record-actions.html` (list) and `amplify-chat-record-actions-cards.html` (card) | One doc-page with two sections, **List variant** and **Card variant**. Move each mockup's "Design rationale" text into its section. The mockups are standalone HTML (not `doc-page`), so keep both files and link each with "Open the interactive mockup". Don't rebuild them. |
| Adding prospect contacts | `amplify-chat-prospect-add-flow-v2.html` | Move its "Design rationale" into the doc-page; link the v2 mockup. Keep the mockup's "Illustrative — sample data" notice. Link to Relevance signals. |
| Workflow examples | Patterns page `#examples` (Prioritize open jobs, Match candidates to a job, Look up a company, Build pipeline) | Move as is. |
| Amplify in the page layout | `bowling-alley.html` (Amplify tab; Amplify is a tab, not an overlay), `record-header.html` (Amplify button), `form-pages-design-decisions.html` (right pane is Amplify-first; chat panel narrows the page), `dropdown.html` (Escape inside an Amplify pop-over) | Summary of entry points and placement, each linking to its source. Don't remove anything from the source pages. |

Update links: `docs/amplify/components/amplify-chat-selection.html` links to the record actions mockup twice (repathed in Phase 1a). Point both at `../patterns/record-actions.html`.

**Checkpoint 5:** show me the seven pattern pages and the list of rules moved onto component pages.

## Phase 6 — Resources and cleanup

1. **`docs/amplify/resources.html`** — move the "Amplify references" and "Amplify Chat in New UI" Figma blocks from `docs/resources.html` (`#amplify-references`, `#amplify-chat`). Core Resources keeps one line with a link.
2. **`docs/amplify/background.html`** — move "Open questions and directional items", "Appendix A: research summary" and "Appendix B: current state analysis". Move the HTML versions (`#appendix-current-state` etc.). Use the MD only where the HTML has no version.
3. **Retire the chat interface patterns page.** Once every section has a new home:
   - Give me a table: original section ID → new location.
   - Replace the page body with a short "This page has moved" list linking each old section to its new page. Keep the old anchor IDs on that list so deep links still land.
   - Don't delete the file.
   - Update its nav and index entries (already removed in Phase 1b).
4. **Retire prospect flow v1.**
   - Search for links to `amplify-chat-prospect-add-flow.html` (not `-v2`) and repoint them to the new pattern page.
   - Then ask me before deleting the file. If I say no, replace its body with a "Superseded by v2" notice and a link.
5. **MD downloads** (`docs/resources/*.md`). Leave them as they are. They're downloads for AI tools, not site pages.
6. **Proposal page** (`docs/amplify/amplify-docs-structure-proposal.html`):
   - Remove the "Reference model" section.
   - Remove the "Rovo equivalent" column in "What is missing".
   - Remove every other Rovo/Atlassian mention.
   - Update it with the decisions above:
     - v2 kept
     - Surfaces and elevation combined
     - Button/Icon Container as links
     - Amplify icon page
     - Relevance signals page
     - Signals label varies by context, with "Relevance Signals" as the default
     - Filled icon is the default; the line icon is for less emphasis; `bhi-amplify` = `name="amplify"`
     - Amplify component pages moved to `docs/amplify/components/`
     - Correct the "Pop-over chat surface" gap: Docked chat already covers docked ↔ pop-over (`components/CLAUDE.md`).
   - Don't link it in the nav.

**Checkpoint 6:** show me the section-mapping table, then ask about deleting v1.

## Phase 7 — Verification

Run all of these and report the results:

1. `npm run build`, then `npm run docs`. Both must finish without errors.
2. **Broken links.** Write a throwaway script, outside `docs-site/`, that crawls every `href` in `docs-site/**/*.html` and the `SITE` list. Report any internal link to a missing file or a missing `#anchor`.
3. **Orphans.** Every `docs/amplify/**/*.html` page is reachable from the `SITE` list. Check that no `docs/components/amplify-*.html` files remain. Check that each `vercel.json` redirect points at a file that exists. Each page should be reachable from the `SITE` list, except the proposal page and the standalone mockups. The mockups must be linked from a pattern page.
4. **No outside inspiration.** Run `grep -rniE "rovo|atlassian" docs-site --include=*.html --include=*.js --include=*.css` (excluding `examples/`). It must return nothing.
5. **No dividers.** No `<hr>` in new or edited pages.
6. **Live embeds.** Every `<doc-example>` on the two new component pages renders in the browser. Take a screenshot to check, since the preview tab may not auto-size (see `CLAUDE.md`).
7. **Nothing duplicated.** For each component that had a section on the old patterns page, confirm the rules now live only on the component page.
8. **Checklist.** List every page you created, edited or retired. Mark each one "awaiting approval". Don't commit.

## Open gaps to carry forward

Leave these as "To be written." callouts in context. Don't write their content:

- Gradient tokens (Color)
- Generating/loading indicator component (Status and loading)
- Feedback, error and correction states (retry, regenerate, reporting a bad answer, AI disclaimers)
- Illustration and empty states (still to be decided whether they're in scope)
- Motion (out of scope; don't add a page)
