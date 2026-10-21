# Figma doc kit (optional)

**Only use this when the user asks for a full documentation page in Figma.** The
default for Figma is lighter: on-canvas annotation with the
`figma-section-annotation` skill, next to the component on its template page,
with the full documentation on the docs site.

A Figma doc page uses the same components and styling as the component template
pages, so documentation in Figma reads as one system with the template and the
annotations. Don't build a separate kit.

Load the `figma-use` skill before any `use_figma` call. Ignore hidden layers.

## Sources in Component Migration (`QxXJfpYajGitTbThkkQCXm`)

| Page | Node | What to take from it |
| --- | --- | --- |
| Tracking System | `2:8` | The components: `annotation` and Status Chip |
| TEMPLATE - Existing - [Component Name] - [Status] | `6915:23` | The layout and styling: section, group frames, header, text, placeholders |
| TEMPLATE - New - [Component Name] - [Status] | `6915:24` | Same, with the Why this component note |

Read the template page before building, and copy what's there. If it has changed
since this was written, the page wins.

## Components (instances only; never draw them)

**`annotation`** (component set `337:33162`, key `e1505bb3276e149019d395eb8be4adc7a9e92c4e`)
- The variant property is `Type`.
- Text layers: `eyebrow` (Inter Semi Bold 10, uppercase) and `body` (Inter Regular 13).

| Variant | Use on a doc page |
| --- | --- |
| `Type=Note` | Section headings, body copy blocks, overview, to dos. Resize to 300–520 wide |
| `Type=left` / `Type=right` | Point at a part of a component (anatomy, states). 372 wide including the leader |
| `Type=JSON` / `Type=change` | Not used for doc pages unless the user asks |

**Status Chip** (component set `3:23`, key `eff8699725323840a7aeba19340c2a0ffbe67ea0`)
- Property `Status`: `Not Started`, `In Progress`, `In Review`, `Finalized`, `Blocked`, `No Design Required`, `Deprecated`.
- Use it next to the page title, matching the page name.

## Styling (from the template pages)

**Variables**
- Group frame stroke: subatomic `color/border/subtle` (key `d96a57a44d5a81a4b87b456e1f45e67d90084a3b`).
- Text: the local `doc` collection.
  - Title: `doc/ink/primary`
  - Eyebrow: `doc/ink/secondary`
  - Placeholder text: `doc/ink/muted`
  - Dashed placeholder stroke: `doc/border/hairline`
- Never bind doc chrome to product tokens other than the border above, and never bind a product component to a `doc/*` token.

**Text:** the file has no local text styles for doc chrome, so use Inter directly at these sizes.

| Text | Font | Color |
| --- | --- | --- |
| Eyebrow | Inter Semi Bold 11, letter spacing 6%, uppercase | `doc/ink/secondary` |
| Page title | Inter Semi Bold 32 | `doc/ink/primary` |
| Placeholder label | Inter Regular 13 | `doc/ink/muted` |
| Everything else | Inside `annotation` instances | — |

**Structure**
- One **section** per doc page, named after the subject.
- Content sits in **group frames**: 1px stroke bound to `color/border/subtle`, radius 16, no fill, `clipsContent = false`, 40 padding.
- **Header group:**
  - A vertical auto layout with 24 gap, spanning the full content width.
  - It holds the eyebrow, a `title` row (title + Status Chip, 16 gap, centered), and a `notes` row of `Type=Note` instances (24 gap).
- **Content groups:**
  - Plain frames with no auto layout, so component sets can be placed freely.
  - Each starts with a `Type=Note` heading 40 from the top-left, with content 24 below it.
- **Placeholders** for content still to come:
  - a dashed frame (6/6 dash, `doc/border/hairline`, radius 8) holding a centered placeholder label
  - name it `placeholder (delete)`
- **Spacing:**
  - 80 from the section edges
  - 48 between groups
  - 120 between columns
  - resize the section to its contents plus 80

## Building a doc page

1. Ask which page to build on. Usually it's the component's own page, below its template section; otherwise ask.
2. Create a section beside or below the existing content, away from (0,0).
3. Build the header group, then one group per documentation section the user agreed (overview, anatomy, variants and states, usage, behavior, and so on).
4. Show the product component as a real library instance or the component set itself. Never redraw it.
5. Use `left` or `right` annotations for parts and states, and Notes for prose. Place them as the `figma-section-annotation` skill does.
6. Take one screenshot, check for overlaps and clipped text, and fix them.

## Accuracy

- Read real token names, state names and measurements from the component; don't type approximate values.
- If something is undecided, write a To do Note instead of guessing.
- If both a Figma doc page and a site page exist, they must match: same sections, tokens and wording.
