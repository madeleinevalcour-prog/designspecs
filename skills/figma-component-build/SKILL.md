---
name: "figma-component-build"
description: "Build a component or component set in the Component Migration Figma library so its structure, names, properties and sub-components match code. Covers four sources: an existing Novo component inspected in production, an existing Novo component read from the novo-elements GitHub source, a net-new component from an HTML prototype, and a net-new component the designer hand-built that needs its variants built out. Use when the user asks to build, rebuild, port, migrate or create a component in Figma, make variants, build out states, or turn a prototype or a hand-built frame into a component set for the Modern UI / Novo redesign."
---

# Figma component build

Build a component set in the **Component Migration** library file (`QxXJfpYajGitTbThkkQCXm`) that mirrors code: the same name, the same parts, the same inputs, the same sub-components. Designers should never need to detach it.

This skill stops at a finished, bound component set. Tokens, annotation and documentation are separate skills (see Step 8).

Before any `use_figma` call, load `figma-use`. Before the first write, also load `figma-generate-library`. Pass both in `skillNames`.

## Step 0: Pick the source

Ask which applies if the user hasn't said.

| Source | When | Go to |
|---|---|---|
| **A1. Novo in production** | Rebuilding an existing Novo component. The user has the live app open | Step 2A1 |
| **A2. Novo source on GitHub** | Rebuilding an existing Novo component, e.g. `https://github.com/bullhorn/novo-elements/tree/master/projects/novo-elements/src/elements/checkbox` | Step 2A2 |
| **B1. HTML prototype** | Net-new component. A Claude-built HTML prototype exists (a file, a `prototypes/` folder in Design Specs, or pasted code) | Step 2B1 |
| **B2. Hand-built base** | Net-new component. The designer built one state by hand and wants the variants built out | Step 2B2 |

For A1 and A2, structure comes from Novo and visuals come from the Modern UI foundations. Load `modern-ui-design-system` for token values. Novo's SCSS colors and sizes are the old look; don't copy them.

## Rules

- **Use existing components.** Icons, buttons, chips, checkboxes and every other part that already exists go in as library instances. Never draw or imitate them.
- **No detaching, ever.** Not in the build, not in examples. If content needs to vary freely, add a slot.
- **Bind everything.** Fills, strokes, spacing, radius and effects bind to variables. Text uses text styles; elevation uses effect styles. If no token matches, don't use a raw value silently. Add it to the missing list and ask.
- **Names come from code.** Don't invent component, property, layer or value names. If the source doesn't give one, ask.
- **Don't invent behavior.** States, sizes and options come from the source. Anything unclear goes on the missing list as a question.
- **Ignore hidden layers** when reading any Figma node.
- **Reuse before creating.** Search the library first (Step 1). Update an existing component rather than making a second one.
- **Confirm before writing.** Show the plan (Step 4) and wait for approval.

## Conventions

These match the newer components in the file (`novo-card`, `novo-card-header`, `amplify-chat/chat-card`). Older ones (Button's Title Case properties, `Property 1` on `checkbox+label` and `novo-card`) predate them. Flag those when you touch them; don't copy them.

**Component set name**
- The code component name in kebab case. For Novo, the selector: `novo-card-header`.
- If the family already exists in the file under a name without the `novo-` prefix (e.g. `checkbox`, `checkbox+label`), match the family and flag the mismatch.
- Families use a slash: `amplify-chat/chat-card`.
- Sub-components get their own component set, named the same way: `novo-card-header`, `novo-card-actions`.

**Properties:** names and values are the code inputs, lowercase kebab.

| Code | Figma property | Example |
|---|---|---|
| Enumerated `@Input()` / `input()` | `VARIANT`, same name and values | `theme=primary`, `size=small` |
| Interaction state (CSS `:hover`, `:focus-visible`, `:active`, `[disabled]`) | `VARIANT` named `state`: `default`, `hover`, `focus`, `active`, `disabled` | `state=hover` |
| Boolean state input (`checked`, `indeterminate`, `selected`) | `VARIANT` when it changes the visuals; values `true` / `false` | `checked=true` |
| `*ngIf` / `@if` around a part | `BOOLEAN` named `show-<part>` | `show-footer` |
| A string rendered as text (`label`, `title`) | `TEXT`, same name | `label` |
| An icon input or icon class | `INSTANCE_SWAP` named `icon`, preferred values from the Iconography page | `icon` |
| `<ng-content>` / projected content | `SLOT`, named after the content | `card-content` |

- One variant property per input. Don't merge two inputs into one property (`disabled and checked`); combine them as separate properties instead.
- Use only the combinations that are real. If `disabled` has no hover, don't build `state=hover, disabled=true`.

**Layers**
- Name each layer after its element or class in the code template, without the component prefix: `novo-checkbox-group` → `group`. Don't keep `Frame 12` or `Rectangle`.
- Nested components keep their component name: `novo-card-actions`, `checkbox`.
- Text layers take the name of their property: `label`, `header-text`.
- Every variant must have the same layer tree and names. Overrides only carry across variant swaps when the names match.

**Icons:** Novo uses `bhi-*` classes. Each icon component's description holds its class (`bhi-checkbox-empty`; some use `bhi_` with an underscore). Find the icon by searching for the class, then insert it as an instance.

**Description:** set it on the component set. Write it in this order:
1. What the component is.
2. The order of its parts.
3. What each property value means.
4. The token family it binds to.
5. The code selector, plus the source link for A2.

Use `amplify-chat/chat-card` as the model.

## Step 1: Check what exists

Run these in one batch:
- `search_design_system` (entity `component`) in Component Migration for the component name and each likely sub-component.
- Components in the Design Specs repo at `components/projects/ats-ui/src/lib/<name>/`. If a port exists, read its selector, inputs and `state` values, and match them.
- Variables for the family (`search_design_system`, entity `variable`, e.g. `checkbox/`).

Report what exists, what's partly built and what's missing.

## Step 2: Read the source

The goal is the same for every source: a **parts tree** (elements, nesting, which parts are sub-components), a **properties list** (inputs and states) and **layout values** (direction, gap, padding, radius, colors) for each part.

### 2A1. Novo in production

Uses the Claude in Chrome tools. Claude can't sign in for the user.
1. Ask the user to open the screen with the component in their browser and to say which instance to inspect.
2. Use `find` or `read_page` to locate the element. Then use `javascript_tool` to return a compact tree for that element:
   - tag
   - classes
   - text content
   - visible children only
   - computed `display`, `flex-direction`, `gap`, `padding`, `border-radius`, `color`, `background-color`, `border`, `font-size`, `font-weight`, `line-height`
3. For states, ask the user to hover, focus or open the component, or set the state from the console when the class is known (e.g. `.disabled`). Re-read after each one.
4. Use the class names as layer names. The selector is the custom element tag (`novo-*`).
5. Computed values are the old look. Use them for structure and sizing intent only, then map to Modern UI tokens.

### 2A2. Novo source on GitHub

- The repo is `bullhorn/novo-elements`. The default branch is **`next`**, not `master`. Rewrite `tree/master` links.
- GitHub folder pages don't render through `web_fetch`. Use:
  - List a folder: `https://api.github.com/repos/bullhorn/novo-elements/contents/<path>`
  - Read a file: `https://raw.githubusercontent.com/bullhorn/novo-elements/next/<path>`
- Read:
  - The component `.ts`: `selector`, `@Input()`s with their types and defaults, the `template` (or `.html`), and `host` classes.
  - The `.scss`: states (`:hover`, `:focus`, `.disabled`, `.checked`), sizes and modifier classes.
  - Other components in the same folder, which are often sub-components (e.g. `CheckList.ts` beside `Checkbox.ts`).
- Ignore inputs that don't change visuals (`id`, `name`, `tabIndex`, `aria-*`). List them as skipped.

Worked example, `checkbox/Checkbox.ts`:
- Selector `novo-checkbox`.
- Template: `div.novo-checkbox-group` > `input` (hidden native) + `label` > `i` (icon: `bhi-checkbox-empty` / `-filled` / `-indeterminate`) + `span` (the `label` input, or `<ng-content>`).
- Visual inputs: `checked`, `indeterminate`, `disabled`, `label`, `layoutOptions.iconStyle` (`box` | circle).
- In Figma:
  - Layers: `group` > `label` > `icon` (icon instance) + `label` text.
  - Properties: `checked`, `indeterminate`, `state`, `label` (TEXT), and `icon-style` if circle is in scope.
  - The `<ng-content>` fallback becomes a slot only if real usages project content. Ask.

### 2B1. HTML prototype

- Read the HTML and CSS. In Design Specs, prototype sources live in `prototypes/<name>/`. Never read the built `index.html` files; they inline everything.
- Map the DOM to layers as in 2A2: classes become layer names, repeated blocks become sub-components, conditionally rendered parts become `BOOLEAN`s, and free content regions become slots.
- CSS variables map to Figma variables: `var(--color-border-subtle)` is the Figma path with `-` → `/`. Hyphens inside names make this ambiguous, so confirm each one with `search_design_system` (entity `variable`).
- Raw CSS values with no variable go on the missing list.
- Properties come from the prototype's controls, data attributes or modifier classes. If they aren't clear, ask.

### 2B2. Hand-built base

1. Get the node from the link. Run a read-only inventory over it, skipping hidden layers:
   - layer tree with types and names
   - auto layout settings
   - bound variables and raw values
   - text styles
   - nested instances with their main component names
   - any vectors or shapes that look like drawn icons or controls
2. Report problems before building:
   - default layer names
   - raw values
   - drawn parts that should be instances
   - detached instances (a frame named like a library component)
3. Ask for the variant matrix: which properties, which values and which states. Suggest one from similar components in the file, but let the designer decide.
4. For each state, get the deltas from tokens that already exist (`color/border/hover`, `color/background/hover`, the focus ring). If a state's look isn't defined anywhere, ask. Don't design it.

## Step 3: Map to Figma

Using the conventions above, write down:
- The component set name and each sub-component (exists or to build).
- Properties: name, type, values and default.
- The layer tree for one variant.
- The variant list. Count it; if it's over about 60, check with the user before building every combination.
- Tokens per part: fill, stroke, gap, padding, radius, text style.
- Missing: tokens, text styles, effect styles, icons, sub-components and open questions.

## Step 4: Confirm

Show the map as a short table set, then wait:

| Property | Type | Values | Default | From |
|---|---|---|---|---|
| `state` | VARIANT | default, hover, focus, disabled | default | SCSS `:hover`, `:focus-visible`, `.disabled` |
| `checked` | VARIANT | false, true | false | `@Input() checked` |
| `label` | TEXT | — | "Label" | `@Input() label` |

Also list the layer tree, the sub-components to build first, and everything missing.

## Step 5: Place the work

Every component gets a page made from one of the two templates, which sit directly under the Tracking System page:

| Source | Template page | Page ID |
|---|---|---|
| A1, A2 (existing Novo) | `TEMPLATE - Existing - [Component Name] - [Status]` | `6915:23` |
| B1, B2 (net-new) | `TEMPLATE - New - [Component Name] - [Status]` | `6915:24` |

Each template has one section, named `[component-name]`, with three bordered group frames:
- **`Header`:** contains the following.
  - An eyebrow text.
  - The `[component-name]` title.
  - A Status Chip instance.
  - A `notes` row of `annotation` `Type=Note` instances. `OVERVIEW` is always there; Existing adds a Novo source line, and New adds a `WHY THIS COMPONENT` note.
- **`Main component`:** a `MAIN COMPONENT` Note with a `placeholder (delete)` frame below it.
- **`Sub-components`:** a `SUB-COMPONENTS` Note with two `placeholder (delete)` frames.

**Set up the page**
1. Ask whether the component's page already exists. If it doesn't, ask before creating one. Only with approval:
   - Duplicate the right template page.
   - Name it `<Name> - In Progress`.
   - Place it under the matching group in the page list (`In Progress` or `Components - Not Started:`). Ask if you're unsure where.
2. Fill in the header from the source:
   - Rename the section and title to the component set name.
   - Set the Status Chip to `In Progress`.
   - In the Overview body, replace the placeholders you have facts for:
     - the description
     - related components
     - Jira (if given)
     - for Existing pages, the Novo source (the production URL or GitHub folder from Step 2)
     - for New pages, the Why note's product area and reason, as given by the designer
   - Leave any placeholder you don't have a fact for, and list it in the report.
3. Leave the Documentation link as a placeholder until the docs page exists.

**Build into it**
- Build the main component set inside `Main component`, and each sub-component set inside `Sub-components`.
- Delete each `placeholder (delete)` frame as you fill its area.
- Grow the group frames to fit, keeping 40 padding.
- Keep 48 between groups and 120 between the two columns.
- Resize the section to its contents plus 80.
- If the page has no template section (an older page), place the work to the right of the existing content, away from (0,0), and suggest moving it into the template.

## Step 6: Build

Build bottom-up in retry-safe batches. Return every created node ID.
1. **Sub-components first.** Build them as their own component sets, or reuse them if they exist, so the parent nests real instances.
2. **Base variant.**
   - A `COMPONENT` with auto layout, built from instances and bound frames.
   - Bind every value from Step 3 and apply text styles.
   - Add slots with `component.createSlot()`, then name and size each slot. `GRID` layout isn't allowed in slots.
3. **Variants.**
   - Clone the base for each combination, then apply only that variant's deltas: re-bind fills and strokes, swap the icon, toggle parts.
   - Name each one `prop=value, prop=value` in the same property order every time.
   - Run `figma.combineAsVariants(variants, parent)`.
4. **Properties.** Read and add them on the component set only:
   - `addComponentProperty(name, 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP', default)`
   - Link layers with `componentPropertyReferences` (`visible`, `characters`, `mainComponent`).
   - Set `INSTANCE_SWAP` preferred values to the relevant icons.
5. **Arrange.**
   - Grid inside the set: columns = `state`, rows = the other variant combinations.
   - 24 between variants, 24 padding on the set.
   - Match how finalized sets in the file are laid out if they differ.
6. **Description.** Set it on the component set (see Conventions).

## Step 7: Verify

- **Structure:** run one read-only check across all variants:
  - same layer tree and names in every variant
  - no unbound fills, strokes, gaps, paddings or radii
  - no text without a text style
  - no vectors outside icon instances
  - no detached library parts
  - property names and values match the plan
- **Visual:** take one screenshot of the set. Check for clipped text, collapsed widths and overlaps. Fix, then take one more screenshot.
- **Report:**
  - what was built (with node IDs)
  - what was reused
  - the missing list
  - older components you flagged (e.g. `Property 1`)

## Step 8: Hand off

Tell the user the next steps, in order:
1. `figma-component-tokens` to create the component's Tier 3 tokens and rebind.
2. `figma-section-annotation` to annotate states and behavior. It needs a section.
3. `create-design-documentation` for the Figma and docs-site page.
4. If it's going into the prototyping library: port it to `ats-ui` with a showcase route and doc page, per the Design Specs `CLAUDE.md` workflow.
5. Update the page name and status chip to In Review once they're happy with it.

## Plugin API notes

- Library components: `figma.importComponentByKeyAsync(key)` or `importComponentSetByKeyAsync(key)`, using keys from `search_design_system`.
- Library variables: `figma.variables.importVariableByKeyAsync(key)`. Library styles: `figma.importStyleByKeyAsync(key)`, then `node.setTextStyleIdAsync(id)` or `setEffectStyleIdAsync(id)`.
- Never read `componentPropertyDefinitions` from a variant. Use the set.
- `addComponentProperty` returns the name with a `#id` suffix. Use that exact string in `componentPropertyReferences`.
- `setBoundVariableForPaint` returns a new paint. Reassign `fills` and `strokes`.
- Load fonts before any text edit. Inter styles are `Semi Bold`, not `SemiBold`.
- Switch pages once per call with `await figma.setCurrentPageAsync(page)`.
- Keep return values under about 20KB. Summarize trees.
