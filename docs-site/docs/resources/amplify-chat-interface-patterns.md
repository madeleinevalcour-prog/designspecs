# Amplify chat interface patterns

How Amplify chat looks and behaves: the structure of a response, the components a response is built from, how chat works across surfaces, and the text, spacing and layout rules behind them. Uses Modern UI (Novo) styles and components only.

## Overview

- What this covers: chat surfaces and behavior, the anatomy of an Amplify response, response components (prose, lists, data tables, cards, draft and literal value blocks), selection and bulk actions, text styles, records and sources, status and clarifying questions, spacing and layout, and user messages.
- Who it's for: designers and PMs designing Amplify chat into their area, engineers building the chat renderer, and the prompt owners who control output format. A condensed developer handoff covers the build rules only.
- How to use it: start with Surfaces and behavior for where chat appears, then Response structure and Response components to decide what a reply contains. Use the later sections for exact styles, tokens and behavior.
- Not covered: composer redesign, Prompt Library, Tools menu, and Digital Worker output outside chat.
- Figma: the `amplify-chat/*` components in the "new amplify chat components" section of the Component Migration file.
- Text style, color, spacing, radius and elevation names come from the Modern UI Design System reference (`[role]/[size]` naming, for example `body/default`).
- The research and the current state analysis behind these patterns are in the appendices at the end.

### Why this matters for recruiters

- Recruiters use chat mid-workflow and switch context constantly (Amplify Design Reference, Users). A response has to be scannable in seconds.
- Core chat jobs: find candidates, prioritize job orders, build pipeline, match candidates to jobs, look up companies and contacts. Almost every answer is a set of records plus a recommendation.
- A response should make three things obvious: the answer, the records it came from, and what to do next.

## Surfaces and behavior

Amplify chat can appear as a full page, docked beside the current page, or as a pop over, depending on the workflow and where the user starts from. All three are one assistant: they share the same conversation and context, so the user can move between them without starting over.

### Surfaces

| Surface | What it is |
| --- | --- |
| Docked chat | The persistent panel that stays with the user as they move around Bullhorn. It doesn't need to be reopened on each new record or page |
| Full-page chat | The expanded, standalone chat. A valid entry point to a workflow, not just an overflow view of the dock |
| Pop over | An alternate presentation of docked chat, switched with a button in the top left of the panel. A resizable, movable window over the page, with all the same functionality. No scrim: the user can keep working with the page underneath |

- Docked is the default presentation.

### Principles

1. Context persists across navigation. The conversation and its working context (records in play, an active search, applied filters, stated intent) carry across page changes. Example: a search built on a job record carries to the candidate list intact.
2. Chat can drive cross-page workflows, in both directions. Docked chat can take the user to the next page in their task; full-page chat can be the starting point that brings them into a record or list. Directional: the detailed interaction patterns are still being defined.
3. Chat follows the user everywhere. On pages without area-specific context, chat falls back to global chat behavior instead of disappearing. Directional: confirm the fallback per page.
4. History is always reachable. Users can return to a past conversation from the dock and carry it into a new context.
5. The surfaces stay aligned. Docked and full-page chat feel like one assistant, consistent with global chat UX (H4, consistency).

### Applying this to other product areas

1. Identify the workflows chat should support, and which cross more than one page.
2. For each workflow, list the context that must survive navigation: records, searches, filters, selections, intent.
3. Define entry points: docked, full page, or both, and where each takes the user.
4. Map page-to-page handoffs: what state passes at each transition and what the destination does with it.
5. Mark which pages support context-aware chat and which fall back to global chat.
6. Confirm the experience is continuous across docked and full-page chat.

## Response structure

Every reply follows the same top-to-bottom order, so replies are predictable to scan and the answer always comes first (NN/g truncated pyramid; Gestalt continuity).

Always present:

| Element | What it is | Style |
| --- | --- | --- |
| Identity | Amplify icon and "Amplify" name label | Icon `Icon/Amplify Radial`; name `body/sm-medium`, `color/text/secondary` |
| Answer | The first line states the result in one sentence, with no filler opener. If Amplify can't help, it says so here, with the cause and a fix | `body/default`, `color/text/body`; record names as inline entity links |
| Message controls | Copy, thumbs up, thumbs down, Save prompt, in that order | Existing icon buttons |

Optional, depending on the content:

| Element | When to include it |
| --- | --- |
| Section heading | Only when the reply has 3 or more parts the recruiter will scan between. One heading level only |
| Evidence | A response component: [data table](#data-table), [cards](#cards), or [list](#lists) |
| Selection bar | When the table or cards offer a bulk action and at least one row or card is selected. See [Selection and bulk actions](#selection-and-bulk-actions) |
| Rationale | One line under the evidence on how it was ranked or filtered |
| Draft or literal value block | When Amplify writes something to edit ([draft block](#draft-block)) or to copy exactly ([literal value block](#literal-value-block)) |
| Sources row | When the answer uses records. Not shown for clarifying questions, general product help or "nothing found" replies |
| Follow-up chips | 2–3 next steps, instead of asking "Want me to…?" in prose |

Temporary states:

- While generating: a status line names the current step ("Searching open jobs…") with a Stop control. It is replaced by the reply.
- Memory or preference changes: a status line with View and Undo, not text in the answer.

Never in a reply: filler openers, feedback requests in prose, more than 3 clarifying questions, numbered headings, or a retry control.

The smallest reply is identity, a one-sentence answer and the controls. Everything else is added only when the content needs it (Rams 10, as little design as possible).

## Response components

### Choosing a format

Pick the component based on what the recruiter will do with the answer.

| Content | Format | Why |
| --- | --- | --- |
| A single fact or short answer | [Prose](#prose): 1–2 sentences | Rams 10 |
| Steps, a plan, or a ranked shortlist without extra fields | [Lists](#lists) | Order is meaningful |
| 2–10 records compared on the same fields | [Data table](#data-table): 4 columns docked, 6 full page | Gestalt, continuity and similarity |
| Records that need explaining or acting on one by one | [Cards](#cards): 3 by default, 5 max | H7, efficiency; Amplify principle 3 |
| More than 10 records | [Data table](#data-table) with the first 10, a count and a "Show more" chip | H1 |
| An email, note or JD to edit | [Draft block](#draft-block) | Amplify principle 2 |
| Text to copy exactly (Boolean string, field value, template) | [Literal value block](#literal-value-block) | H5 |

### Prose

- Paragraphs use `amplify-chat/text`: `type=paragraph` for plain text, `type=paragraph-with-links` when the text names records (see [Records and sources](#records-and-sources)).
- The first paragraph is the answer. Keep paragraphs to 2–3 sentences (NN/g).
- Emphasis, headings and text styles: see [Text styles](#text-styles) and [Headings and emphasis](#headings-and-emphasis).

### Lists

- Use a numbered list only when the order means something: rank, priority, or sequence of steps. Use bullets for everything else (H2, match between system and the real world).
- One idea per item. Keep items under two lines where possible.
- Nest no more than one level deep. If you need more, use a table or cards.
- Don't carry numbering across sections. Each list starts at 1.
- A list needs at least 2 items. A single item is a sentence.
- Avoid runs of very short fragments. Claude's formatting guidance warns against "a series of overly short bullet points". Merge them into a sentence or a table row.
- Numbered lists use `amplify-chat/numbered-list` and `amplify-chat/list-item`.

### Data table

- Component: `amplify-chat/data-table` (Figma: https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=6271-183099), with `default` and `selected` variants.
- Use it to compare or scan 2–10 records on the same short fields. Show at most 10 rows; with more results, show "Showing 10 of N" in `meta/default` and a "Show more" chip.

Record preview and links:

- When the table references records, each row includes the preview icon (binoculars) after the checkbox column.
- The preview icon opens the record slideout. Chat stays open beside it, so the recruiter can check a record without losing the conversation (Amplify principle 2: AI adds control, never removes it).
- The record name is an entity link. Clicking it opens the record's full page.
- Two actions, two destinations: preview for a quick check, link for full work (H7, flexibility and efficiency).

- Render every chat table with `amplify-chat/data-table`, which is built on `novo-data-table`. Where the component can't be used, match its styling exactly. Don't build a custom markdown table style (Modern UI "consistent": choose by role, enforced in the system; H4, consistency and standards).
- Styling comes from the component and its tokens. Don't override them:

| Part | Style or token | Value |
| --- | --- | --- |
| Header text | `input/label/md` | Regular 400 · 12/14 · 0.5 tracking · Uppercase |
| Cell text | `input/value/default` | Regular 400 · 14/20 |
| Header text color | `data-table/color/content/header` | `#525b63` |
| Cell text color | `data-table/color/content/default` | `#3d464d` |
| Row icons | `data-table/color/icon/default` | `#677079` |
| Row background | `data-table/color/background/default` | `#ffffff` |
| Row divider | `data-table/color/border/default`, `border/width/sm` | `#dee0e3`, 1px |
| Cell padding | `data-table/spacing/padding-vertical` · `padding-horizontal` | 8 · 16 |
| Gap between cells | `data-table/spacing/gap-cell` | 16 |
| Row min height | `data-table/spacing/min-height` | 40 |

- Row dividers only. No vertical lines and no outer frame (Gestalt, continuity: the columns line up the data; Modern UI "clean").
- Left-align all columns, including IDs and phone numbers, as the component does.
- Column limits: 4 at most in the docked chat (slideout), 6 at most in full-page chat. Put the record name in the first column. Columns have no minimum width. The 128 min-width in Figma is a Figma error and doesn't exist in the built component.
- No sort or filter controls on chat tables. Header cells show the label only. The table is a summary of the answer, and deeper work happens in the full list view (Rams 10, as little design as possible; H8).
- Checkboxes appear only when the reply offers a bulk action. See [Selection and bulk actions](#selection-and-bulk-actions).
- Show empty values as "Not on file" in `color/text/disabled`, not "—" (Amplify principle 5, full range of data quality).
- Don't bold cell values. Status goes in the existing status/tag component with an icon or text, never color alone.

Cell types used in chat (existing `novo-data-table-cell` variants):

| Cell | When to use | Styling |
| --- | --- | --- |
| Default | Plain values: title, location, date, ID | `input/value/default` · `data-table/color/content/default` |
| Link | Record names (candidate, job, contact, company) that open the record | Entity link, default size: `body/default-medium`, `link-text/color/default`, hover `link-text/color/hover`. Entity circle (`color/entity/*`) before the label, gap `link-text/spacing/gap/default` (4) |
| Relevancy dots | Match strength in candidate and job search results | 5 dots, filled for the score and outlined for the rest. Filled `color/blue/medium-blue`, empty `color/utility/blue/100` with a 1px border (`border/width/border-default`), gap `spacing/gap/xsm` (4) |

- Use the link cell for the record-name column instead of plain text (H6, recognition over recall; Amplify principle 3, show your work).
- Put relevancy dots in their own column with a short header such as "MATCH". Give each cell a text alternative such as "3 of 5" for screen readers. Filled vs outlined is a shape cue, so it doesn't depend on color alone (Modern UI color rule).
- Explain what drove the relevancy score in the rationale line under the table: "Match based on skills, title, and location" (Amplify principle 3 and principle 4, "Amplify suggests").

### Cards

- Component: `amplify-chat/chat-cards`, a stack of `amplify-chat/chat-list-item` cards built on the Modern UI list-item, with `default` and `selected` variants.

When to use cards instead of a table:

Use cards (`amplify-chat/chat-cards`) when any of these is true:

| Situation | Why cards | Principle |
| --- | --- | --- |
| Each record needs a reason it was picked, such as relevance signals | A reason doesn't fit in a table cell | Amplify principle 3, show your work |
| A record has several values of one kind: signals, tags, contact methods | Several chips per record break table columns | Gestalt, common region |
| The recruiter will act on records one by one: select, draft outreach, add to pipeline | Actions sit next to the record they affect | H7, efficiency |
| The records are of different types (a candidate, a contact and a job) | They don't share columns | H4, consistency |

Use a table when:

- The recruiter is comparing or scanning records on the same 2–6 fields.
- Each value is short: a name, date, ID, status or relevancy dots.
- There are more than 5 records.

When it's unclear, use a table. It's denser and easier to compare (Rams 10, as little design as possible).

Card limits:

| Rule | Recommendation | Why |
| --- | --- | --- |
| Default | 3 cards | Each card is about 150px tall. In full-page chat, 3 cards plus the answer fit in the roughly 680px between the header and the composer. Docked chat is shorter |
| Maximum | 5 cards | Past 5, the answer and sources row move well off screen, and comparing cards gets harder than scanning a table (NN/g truncated pyramid) |
| More results | Show the top 3, then a "Show N more" follow-up chip. Above 5, switch to a table (10-row cap) or link to the full list view | Detail on demand. Chat summarizes; the list view is for full review |
| Order | Rank by relevance, and state how in the rationale line ("Ranked by department match and seniority") | Amplify principle 4, honest expectations |

- The research doesn't set a card count. The 3 and 5 come from the component height, the visible chat area and the truncated pyramid principle. Check them with recruiters.
- Match indicators belong to their feature: relevancy dots come from candidate search, and the "Strong Match" chip comes from Prospect. They are produced by different features and never appear in the same reply.
- Show any one set of records in one format only: cards or a table, not both.

### Selection and bulk actions

Data tables and cards share the same selection pattern.

- Show checkboxes only when the reply offers a bulk action, such as adding prospect contacts to the ATS. Without a bulk action, leave them out (Rams 10).
- The header checkbox (tables) selects all visible rows.
- When one or more rows or cards are selected, a selection bar appears at the bottom of the table or card stack (the `selected` variant):
  - Left: the selection count, for example "5 of 5 selected".
  - Right: a primary split button that names the action and the count, for example "Add 5 Contacts". The dropdown holds related actions.
- The count in the button updates as the selection changes. With nothing selected, the bar is hidden.
- The action runs only when the recruiter clicks it. Selecting never writes to the ATS on its own (Amplify principle 2: AI assists, it does not replace judgment; H5, error prevention).

### Draft block

- Three sections separated by `card/color/border/default` dividers:
  - Subject row: "Subject:" in `body/sm-medium` `color/text/secondary`, then the subject in `body/default` `color/text/body`. Hide it for drafts with no subject, such as notes.
  - Body: the draft in `body/default` `color/text/body`.
  - Actions row: existing Buttons. Copy and Edit are Secondary, Small. Use draft is Primary, Small. Hide the row only when the draft is read-only.
- Container: `color/background/default`, 1px `card/color/border/default`, `border/radius/xsm` (4).
- Amplify never sends a draft without the recruiter choosing an action (Amplify principle 2, AI assists and does not replace judgment).

### Literal value block

- Any text the recruiter will copy and use exactly as written is a literal value. The model outputs it as a fenced code block, and the renderer maps it to the literal value block. This is the same pattern Claude and ChatGPT use for code blocks.
- Use it for Boolean search strings, exact field values, and short templates with placeholders. Full email drafts, notes, and JDs use the draft block, because the recruiter edits them rather than pasting them unchanged.
- Container: `color/background/muted` with a 1px `card/color/border/default` border and `border/radius/xsm` (4).
- States: at rest the block shows the value only. On hover, the border changes to `chip/color/border/default/hover` and the copy action appears at the right (existing `icon-button-no-container`, theme=secondary, copy icon). Copy takes the exact string and nothing else (H5, error prevention).
- The content renders unchanged: no smart quotes, no markdown parsing, and no changes to operators or parentheses. Curly quotes break Boolean strings.
- Long values wrap within the block. Wrapping is visual only: copy takes the original string with no added line breaks.
- The separate tonal block shows where the exact text starts and ends (Gestalt, common region; H6).
- Use inline code for short values inside a sentence (`JOB-10482`). It has no copy action.

## Text styles

Every markdown element the model can output maps to one Modern UI text style. Nothing renders at a raw size or weight (Modern UI typography: style chosen by role, weight tied to role).

| Element (markdown) | Text style | Composition | Color token | Notes |
| --- | --- | --- | --- | --- |
| Section heading (`##`) | `title/sm` | Semi Bold 600 · 18/24 · Title case | `color/text/headline` | The largest style a response can use. It sits one step below the slideout title (`title/md`), matching the card-title role. Never use `title/default` or `title/md` in a response |
| Sub-heading (`###`) | `body/default-medium` | Medium 500 · 14/20 | `color/text/headline` | The smaller heading style for chat. Use rarely. `####` and below render as `body/default` |
| Paragraph | `body/default` | Regular 400 · 14/20 | `color/text/body` | The workhorse reading style |
| Bold (`**`) | `body/default-medium` | Medium 500 · 14/20 | `color/text/body` | Medium is the system's "emphasis within body" weight. Never 600 or 700. The color stays the same, so weight carries the emphasis |
| Italic (`*`) | `body/default` | Regular 400 · 14/20 | `color/text/body` | Render as plain text. Modern UI has no italic style |
| Bulleted / numbered list | `body/default` | Regular 400 · 14/20 | Text `color/text/body` · marker `color/text/secondary` | See [Lists](#lists) |
| Table header | `input/label/md` | Regular 400 · 12/14 · 0.5 tracking · Uppercase | `data-table/color/content/header` | Matches the `amplify-chat/data-table` header cell. See [Response components](#response-components) |
| Table cell | `input/value/default` | Regular 400 · 14/20 | `data-table/color/content/default` | Matches the `amplify-chat/data-table` cell. Record names use the link cell (entity link). See [Response components](#response-components) |
| Entity record link (anywhere in a reply) | Link text component, default size: `body/default-medium` | Medium 500 · 14/20 | `link-text/color/default` · hover `link-text/color/hover` | Always starts with an entity-color circle (`color/entity/*`), gap `link-text/spacing/gap/default` (4). Weight, color, and the circle together, so the link doesn't rely on color alone. See [Records and sources](#records-and-sources) |
| Sources row, citation markers | `meta/default` | Medium 500 · 12/14 | `color/text/secondary` | See [Records and sources](#records-and-sources) |
| Result counts, timestamps, "Not on file" outside tables | `meta/default` | Medium 500 · 12/14 | `color/text/subtle` | `color/text/subtle` is the lightest color safe for readable text |
| Assistant / user name label | `body/sm-medium` | Medium 500 · 12/16 | `color/text/secondary` | |
| Status line ("Searching open jobs…") | `body/sm` | Regular 400 · 12/16 | `color/text/secondary` | Not link blue. See [Status and clarifying questions](#status-and-clarifying-questions) |
| Follow-up chips, message actions | `button/sm` | Medium 500 · 12/16 | Per the existing button component | Use existing components. Don't restyle them |
| User message | `body/default` in a bubble, radius `border/radius/sm` | Regular 400 · 14/20 | `color/text/body` | Bubble fill `color/background/subtle-hover` |
| Literal value block (fenced code block, ```) | `body/default` on `color/background/muted`, 1px `card/color/border/default`, radius `border/radius/xsm` | Regular 400 · 14/20 | `color/text/body` | For Boolean strings, exact field values, and templates. See [Response components](#response-components) |
| Inline literal value (inline code, `` ` ``) | `body/default` on `color/background/subtle`, radius `border/radius/xsm` | Regular 400 · 14/20 | `color/text/body` | For short values in a sentence, such as a job code. No copy action |
| Error or limitation line | `body/default` | Regular 400 · 14/20 | `color/text/body` plus a status icon in `color/icon/utility/negative` or `warning` | Pair the icon with text. Never color alone |

- `body/default` (14/20) is the product's workhorse reading size. Linear and Attio also use 14px body text in dense work surfaces. `body/lg` is not used in chat (Modern UI: choose the style by role).
- `meta/default` is Medium by definition. Don't override it to Regular.
- Emphasis comes from weight, never from color alone (Modern UI color usage rules).
- Use `input/label/*` only in table headers, through `amplify-chat/data-table`. The 0.5 tracking is tuned for uppercase labels (Modern UI typography usage rules).

## Headings and emphasis

Headings:

- Default to no headings. Most answers are one short paragraph plus a list, table, or cards (NN/g: answer first; Claude formatting guidance: prose first).
- Use `##` only when a response has 3 or more distinct parts that the recruiter will scan between, for example "Top priority", "Needs attention", "Can wait".
- One heading level per response. `###` is only for a label inside a section, never a second tier of structure.
- Headings are short labels in title case (Modern UI title rule), 2–5 words, with no trailing punctuation.
- Don't number headings ("1) Three CSM roles"). Numbering belongs to lists, not structure (H4, consistency).
- Don't open with a heading. The first line is always the answer.

Emphasis:

- At most one bold phrase per paragraph or list item, and only for the fact the recruiter acts on: a name, count, date, or status.
- Don't bold labels and values in the same line.
- Don't use bold as a heading. If it acts like a heading, it's a `###` or it isn't needed.
- Don't use ALL CAPS, underline, or colored text for emphasis.

## Records and sources

- Every Bullhorn record in a reply (candidate, job, contact, company, placement, lead, opportunity, prospect) is a link that opens the record. The recruiter should never have to copy an ID into Find (H6, recognition over recall; Amplify principle 3, show your work).
- The link text is the record name, not the ID. Show the ID as meta text only when it tells two records apart, such as two "PepsiCo" entries.
- Every entity record link uses the existing link text component (Figma `link-text`) with a circle in the entity's color before the label: `color/entity/candidate`, `color/entity/job`, `color/entity/contact`, `color/entity/company`, and so on. The circle shows the record type at a glance, the same way entity accents work elsewhere in Modern UI (Gestalt, similarity: same record type, same color).
- Link text sizes from the component:

| Size | Text style | Circle-to-label gap | Use in chat |
| --- | --- | --- | --- |
| Large | `body/lg-medium` · 16/24 | `link-text/spacing/gap/large` (8) | Not used in chat |
| Default | `body/default-medium` · 14/20 | `link-text/spacing/gap/default` (4) | Prose, lists, cards, table link cells |
| Small | `body/sm` · 12/16 | `link-text/spacing/gap/small` (4) | Only inside `body/sm` or `meta/default` contexts, such as the expanded sources list |

- Color: `link-text/color/default` (`#296cc3`) at rest, `link-text/color/hover` (`#1450a0`) on hover. The circle stays the same entity color in both states.
- Use the component. Don't rebuild the circle or restyle the link.
- Inside a paragraph, the entity link sits inline in the sentence, and punctuation follows it directly. In the product, render the link text component inline. In Figma, use `amplify-chat/text` with `type=paragraph-with-links`. Figma can't place a component inside a text layer, so that variant styles the link words directly: `body/default-medium` in `link-text/color/default` with a real hyperlink, and a "●" in the entity color joined to the name with a no-break space so the circle never sits alone at the end of a line. It matches the component visually but doesn't inherit changes from it.
- When the answer depends on specific records or fields, show a sources row under the reply: `meta/default` text reading "Based on 14 job orders · Updated today" that expands to the list. HubSpot Breeze, Ashby, and ChatGPT all do this (Amplify principle 3; general-design-review AI governors, citations).
- Name the fields a ranking used, for example "Ranked by start date, submissions, and client priority" (Amplify principle 3). Don't claim a reason the data doesn't support (Amplify principle 4, "Amplify suggests" not "Amplify determined").

## Status and clarifying questions

Status and loading:

- Replace "Amplify is thinking…" with a specific status: "Searching open jobs…", then "Ranking 14 job orders…". Attio shows tool activity the same way (H1, visibility of system status; Amplify principle 8, be honest about errors and limitations).
- Style: `body/sm`, `color/text/secondary`, next to the Amplify icon (`Icon/Amplify Radial` paint style). Don't use link blue, because blue means clickable (Gestalt, similarity).
- Show a Stop control while the reply is generating (H3, user control).
- When Amplify can't answer, say so in the first line, then name the cause and a fix: "No open jobs found for Verizon. Check the job status filter or ask about all jobs." (NN/g; H9, recognize and recover from errors).

Clarifying questions:

- Ask at most 3 questions per turn. If more are needed, ask the most important ones first and state an assumption for the rest (NN/g: ask sparingly; Claude guidance: one question per reply when possible).
- Where the answer is a choice, use a question card with preset options and an "Other" field, as HubSpot Breeze does (H6, recognition over recall; H7, efficiency).
- Keep question text to one line. Don't list example answers inline in bold.
- Say why you're asking only when the reason isn't obvious.

## Spacing and layout

All values bind to Modern UI semantic spacing tokens. Use `gap/*` between items in the same container and `padding/*` for space inside a container (Modern UI spacing usage rules).

| Relationship | Token | Value |
| --- | --- | --- |
| Between list items | `spacing/gap/xsm` | 4 |
| Paragraph to paragraph | `spacing/gap/sm` | 8 |
| Heading to its content | `spacing/gap/sm` | 8 |
| Sources row to follow-up chips | `spacing/gap/sm` | 8 |
| Paragraph to a block (list, table, cards, draft) | `spacing/gap/md` | 16 |
| Reply to sources row | `spacing/gap/md` | 16 |
| Above a section heading | `spacing/gap/lg` | 24 |
| Between turns | `spacing/gap/xlg` | 32 |
| List indent | `spacing/padding/md` | 16 |
| Table cell | `data-table/spacing/padding-vertical`, `data-table/spacing/padding-horizontal` | 8 / 16 |
| User bubble | `spacing/padding/sm` vertical, `spacing/padding/md` horizontal | 8 / 16 |
| Literal value block | `spacing/padding/sm` top, right, bottom · `spacing/padding/md` left · `spacing/gap/md` between value and copy action | 8 / 16 / 16 |
| Draft block sections (subject, body) | `spacing/padding/sm` vertical, `spacing/padding/md` horizontal · subject label-to-value `spacing/gap/sm` | 8 / 16 / 8 |
| Draft block actions row | `spacing/padding/sm` all sides · `spacing/gap/sm` between buttons | 8 / 8 |

- The space inside a group is always smaller than the space between groups (Gestalt proximity; Modern UI spacing rule). For example, heading to content (`gap/sm`) is tighter than the space above the heading (`gap/lg`).
- Don't use off-scale values. `spacing/12` exists but isn't needed here.
- Prose max width is about 70ch, roughly 520–560px at `body/default`. Tables and cards can use the full message column (Baymard; WCAG 1.4.8). This is a layout constraint, not a Modern UI token.

Column width:

| Element | Width |
| --- | --- |
| Chat column (messages and composer) | 800px max, centered |
| Prose (answers, paragraphs, lists) | About 70ch, roughly 560px max, left-aligned in the column |
| Tables, cards, draft and literal value blocks | Full column width |
| User bubble | Up to 440px, right-aligned |
| Narrow windows | Column = available width minus `spacing/margin` (24) on each side |
| Docked chat | No separate column. Content fills the panel minus its side padding; the prose cap still applies |

- Messages, tables and the composer share the same left and right edges, so the conversation reads as one column (Gestalt, continuity).
- Two widths do two jobs: the column is wide enough for the 6-column table limit (about 133px per column at 800px), and the prose cap keeps paragraphs readable (Baymard; WCAG 1.4.8; H8).
- 800px leaves about 190px on each side of the 1182px full-page content area, so the chat stays focused instead of stretching edge to edge (Rams 5, unobtrusive).
- Other AI chat products don't publish their column widths, so 800px is based on the reading-width research, the table column limit, and the composer width, not on a competitor value.
- The chat panel uses `general/level 3 - right` (Modern UI elevation: the named level for Amplify chat).
- The composer uses `general/level 2 - scroll` on `color/background/scroll`. This is the level for a transparent container that content scrolls behind. Its background blur keeps it legible over moving text, which fixes today's overlap (Gestalt figure-ground). Add bottom padding equal to the composer height plus `spacing/padding/md` so the last line of a reply can scroll clear.
- Radius: the user bubble uses `border/radius/sm` (8). The literal value block and inline literal value use `border/radius/xsm` (4). Each component type keeps one radius everywhere it appears (Modern UI elevation: match radius to the surface type).

## User messages

- Component: `amplify-chat/user-bubble`. `body/default` in `color/text/body`, fill `color/background/subtle-hover`, `border/radius/sm` (8), padding `spacing/padding/sm` vertical and `spacing/padding/md` horizontal.
- Right-aligned in the chat column. Hugs its content up to 440px, then wraps.
- Long messages (for example a pasted job description) are capped at 8 lines of text (160px, plus padding). Specify the cap in lines, not pixels, so it follows the type scale.
- Collapsed (`state=long text`): the last 2 lines fade out through an alpha mask, so the text keeps its token color on any bubble fill, and a "Show More" button sits below the text (H1, visibility of system status).
- Expanded (`state=long text expanded`): the full message with "Show Less" (H3, user control).
- Copy always copies the full message, not just the visible part.
- The cap keeps the user's question and the start of Amplify's reply on screen together (Rams 2, useful).

## Voice

- Use plain recruiting language: job order, submittal, placement, pipeline. Don't use internal or model terms (H2).
- Hedge only where it's true: "Amplify suggests", "Based on 14 job orders" (Amplify principle 4).
- Keep paragraphs to 2–3 sentences (NN/g).
- No emoji or exclamation marks.

## Workflow examples

### Prioritize open jobs

- Answer: "5 of your 14 open jobs need action today."
- Evidence: record cards in priority order. Card title is the job title (entity link, job circle) plus the company (entity link, company circle). Meta line: "Starts Oct 6 · 0 submittals · Client priority: High". Actions: Find matches, Open job.
- Rationale: "Ranked by start date, submittals, and client priority."
- Follow-ups: "Show all 14", "Find matches for #1", "Why this order?"

### Find candidates / match to a job

- Answer: "12 candidates match Senior Java Developer (Verizon). Top 5 below."
- Evidence: cards or a table showing name (link cell), current title, location, and a relevancy dots column, with the match reason in the rationale line. Required vs preferred skills met appear as text plus an icon, never color alone (LinkedIn Recruiter shows required vs preferred the same way).
- Actions per candidate: Add to pipeline, Open. Adding to pipeline asks for confirmation before it writes (Amplify principle 2; Attio Create/Deny pattern).

### Look up a company or prospect

- Answer: "Found 56 matches for PepsiCo in Prospect. The corporate entity is PepsiCo (Purchase, NY)."
- Evidence: a table of company (entity link, company circle), HQ, and website, with the first 10 shown and a "Show more" button.
- Follow-ups: "Open PepsiCo", "Company snapshot", "Show next 10".

### Build pipeline

- Answer: the count added and the job it was added to.
- Evidence: the list of added candidates (entity links, candidate circle), each with an undo.
- Status: "Added 6 candidates to Senior Java Developer · Undo" (H3).

## Do and don't

- Do lead with a one-sentence answer. Don't open with a heading or filler.
- Do cap headings at `title/sm` (18/24). Don't use `title/default` or `title/md` in a response.
- Do bold one fact per item, using `body/default-medium`. Don't bold several phrases in a line.
- Do link every record by name, with its entity-color circle. Don't show bare IDs as the only reference.
- Do put next steps in follow-up chips. Don't ask "Want me to…?" in prose.
- Do use the thumbs controls. Don't ask for feedback in the reply text.
- Do ask 3 or fewer clarifying questions, with options. Don't send a 12-question form as text.

## Open questions and directional items

- Literal value block: the copy action only appears on hover. Decide how keyboard and touch users reach it, for example showing it on focus or keeping it visible (H6, recognition over recall).
- Modern UI has no monospace style, so literal values render in `body/default`. Monospace is part of what makes code blocks readable in Claude and ChatGPT: it separates similar characters and keeps operators aligned. Raise this with the Modern UI system owners.
- Entity colors (`color/entity/*`) are primitive-only today, a known gap in Modern UI. The entity circle on record links binds a primitive until the semantic accent layer exists.
- The rendering pipeline has to map markdown to these styles, for example `**` to `body/default-medium`, fenced code blocks to the literal value block, and removing `####` and deeper. Prompt changes alone won't enforce this (Amplify: prompts are the main lever for output, and the renderer is the safety net).
- The body text color in the new UI (about `#2a292d`) is sampled from a screenshot and may reflect anti-aliasing. Check it in code.
- Relevancy dots now bind `color/utility/blue/100` for empty dots, replacing the deprecated token. Filled dots still bind `color/blue/medium-blue`, a brand primitive. Confirm whether a semantic token is planned (Modern UI: bind components to semantic tokens).
- Numeric columns (counts, pay rates): the component example only shows left-aligned values. Confirm the alignment rule.
- Docked chat width: the panel width isn't confirmed. Once it is, check whether 4 table columns fit or the docked limit should drop to 3.
- Cross-page workflow orchestration (Surfaces and behavior, principle 2) is an active goal; the detailed interaction patterns are still being defined.
- Chat on unsupported pages (principle 3) is directional; confirm the fallback experience per page.
- Roadmap sequencing between Dockable Chat Phase II and Phase III is implied by roadmap order, not fixed dates.
- Prospect contacts aren't ATS records yet. Confirm what their name links and preview icon open.

## Sources

- Amplify Design Reference (project knowledge)
- Modern UI Design System (full reference: typography, color, spacing, elevation)
- `novo-data-table`, Component Migration file (Figma): https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=254-6720
- `novo-data-table-header-cell`: https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=254-494
- `novo-data-table` cell variants (link, relevancy dots): https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=46-1424
- Relevancy dots: https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=709-22242
- Link text with entity circle: https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=737-11403
- Claude prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- OpenAI Model Spec: https://model-spec.openai.com/2025-12-18.html
- ChatGPT search: https://help.openai.com/en/articles/9237897-chatgpt-search
- Notion AI: https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai
- Ask Attio: https://attio.com/help/reference/attio-ai/ask-attio/chat-with-ask-attio
- HubSpot Breeze Assistant: https://knowledge.hubspot.com/ai/use-breeze-assistant
- Apollo AI Assistant: https://knowledge.apollo.io/hc/en-us/articles/39359204112397-AI-Assistant-Overview
- Ashby Assistant: https://www.ashbyhq.com/product-updates/ashby-assistant
- Ashby Candidate Assistant: https://docs.ashbyhq.com/ai-candidate-assistant
- Atlas: https://recruitwithatlas.com/
- LinkedIn Recruiter AI-assisted search: https://business.linkedin.com/hire/ai-assisted-search-and-projects
- NN/g, Less chat, more answer: https://www.nngroup.com/articles/less-chat-more-answer/
- NN/g, GenAI writing for the web: https://www.nngroup.com/articles/genai-write-for-the-web/
- Baymard, line length: https://baymard.com/research-articles/line-length-readability
- Dockable Chat: Phase II — better context switching and history (APF-266)
- Dockable Chat: Phase III — take Chat anywhere in Bullhorn (APF-278)
- Additional docked and full-page chat goals from the Amplify design lead (cross-page workflow orchestration; full-page chat as a navigation entry point)
- `amplify-chat/data-table`: https://www.figma.com/design/QxXJfpYajGitTbThkkQCXm/Component-Migration?node-id=6271-183099

## Appendix A: research summary

What leading AI chat products do. Items marked "unverified" were not stated on the source pages.

| Product | Relevant pattern |
| --- | --- |
| Claude | Formatting guidance favors prose. Markdown limited to inline code, code blocks, and `##`/`###` headings. Lists only for truly separate items. Warns against many short bullets |
| ChatGPT | Inline citations open the source, with a hover preview on desktop. A "Sources" button lists everything cited. Action results (for example "Reserve") ask for confirmation before acting |
| Notion AI | Concise answers. A source picker and @mentions set scope. Preset skills act as starting points |
| Attio (Ask Attio) | Create and update require Create / Update / Deny approval. Shows tool activity ("Searched web: 6 results"). Retry options, version arrows, stop while generating. Chip shows which record's context is in use |
| HubSpot Breeze | Numbered inline citations with a hover popover that link to the record. "[#] Sources" list under the answer. Clarifying questions shown as cards with preset options. Thumbs, copy under each message. Context sidebar |
| Apollo | Gives a recommendation or draft action, then helps apply it. Confirms before anything that uses credits. Suggested prompts, context picker |
| Ashby | Every answer cites the underlying data. Every action needs review first. Candidate Assistant has feedback, "Ask another question", history |
| Atlas | "Every match carries evidence." Reasoning behind each result is always available. Chat formatting unverified |
| LinkedIn Recruiter | Takes a JD or intake notes and turns it into filters. Results split required vs preferred qualifications. Chat formatting unverified |
| NN/g | Answer first ("truncated pyramid"). Paragraphs of 2–3 sentences. Bold key phrases. Clarifying questions used sparingly. Say plainly in the first line when the bot can't help |
| Baymard / WCAG 1.4.8 | 50–75 characters per line, 80 at most. Roughly 70ch max-width. Line height around 1.5 |

Common patterns across products:

- Lead with the answer. Detail and follow-ups come after.
- Use formatting only where it helps. Headings are small and rare.
- Structured data (records, matches) links back to its source record. Citations are standard in CRM and ATS assistants.
- Nothing is written without confirmation. Actions show as cards with confirm and deny.
- Clarifying questions are structured (cards, options), not long numbered lists.
- The same controls sit under every reply: copy, retry, thumbs up and down.
- Reading width is capped. No vendor publishes its chat type scale, so reading width and hierarchy are the only transferable specs.

## Appendix B: current state analysis

Three screenshots reviewed: two in the old UI (thinking state, Prospect table) and one in the new UI (clarifying questions). Measurements come from the screenshots at 1x and are approximate. Font sizes are inferred from glyph height and line pitch, not read from code.

### What works today

- Assistant and user turns are clearly separated: avatar and name labels, with a tinted bubble for the user (Gestalt, figure-ground and common region).
- The Prospect table has a light structure: hairline rows and left-aligned text (Gestalt, continuity). The data table guidelines align it with `amplify-chat/data-table`.
- "Showing 10 of 56 results" tells the user the result set is partial (H1, visibility of system status; Amplify principle 4, honest expectations).
- The Amplify icon identifies the AI actor consistently. The Amplify radial is used only on Amplify elements, as the Modern UI color rules require.

### Issues

| # | Issue | Where | Principle |
| --- | --- | --- | --- |
| 1 | Response headings are about 28–30px, larger than the largest Modern UI title style (`title/default`, 24/32) and larger than the "Amplify" panel title. The response outranks the app chrome | New UI | Modern UI typography (style chosen by role); H8, aesthetic and minimalist design |
| 2 | 12 clarifying questions in one reply, numbered across four sections. The recruiter has to answer them all in free text | New UI | NN/g (ask sparingly); H6, recognition over recall; H7, efficiency |
| 3 | Bold on 2–5 phrases per line. When everything is emphasized, nothing stands out | New UI | Gestalt, similarity; Rams 10, as little design as possible |
| 4 | Numbering is repeated at two levels ("1) Three CSM roles" heading, then list items 1–5), and the list numbering runs on across sections | New UI | H4, consistency and standards; Gestalt, continuity |
| 5 | Body text runs about 110–120 characters per line across a line about 900px wide | Both | Baymard/WCAG 1.4.8 (80 at most); Rams 3, aesthetic |
| 6 | The feedback request is written as prose ("If this was helpful, please leave a thumbs up/down…") instead of being a control | Both | Rams 10; H8; industry standard (controls under the message) |
| 7 | The memory confirmation ("I've saved those working preferences") is hidden in the opening prose. No way to view or undo it | New UI | H1; H3, user control; general-design-review AI governors (memory controls) |
| 8 | Record names and Prospect IDs are plain text. The user has to go and search for the record | Old UI table | H6; Amplify principle 3 (show your work); industry standard (citations and record links) |
| 9 | Next steps are offered as a question in prose ("Want me to open that one…or list the next page?") and not as actions | Old UI table | H7; NN/g truncated pyramid (follow-ups) |
| 10 | The floating composer covers the response text with no separation, so text is cut off behind it | Both | Gestalt, figure-ground; Modern UI elevation (layer by level) |
| 11 | "Amplify is thinking…" is in link blue, so it reads as clickable, and it does not say what Amplify is doing | Old UI | Gestalt, similarity (blue means link); H1 |
| 12 | Body text samples at about `#2a292d`, darker than `color/text/body` (`#3d464d`). It may be bound to the headline color or to a raw value. Anti-aliasing makes this uncertain | New UI | Modern UI color (bind to the semantic token) |
| 13 | Empty table values show "—" with no explanation | Old UI table | Amplify principle 5 (design for the full range of data quality) |

### Rams check (summary)

- Useful: Strong. Answers are grounded in real records.
- Understandable: Weak. The hierarchy is inverted and there are too many questions.
- Unobtrusive: Weak. Oversized headings and heavy bold compete with the recruiter's task.
- Honest: Adequate. Partial result counts are shown, but memory changes are buried.
- As little design as possible: Weak. Boilerplate prose, repeated numbering, too much bold.
- The one edit: cap response headings at `title/sm` and remove the prose feedback request.
