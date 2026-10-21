---
name: "figma-section-annotation"
description: "Annotate the states, variants and in-context screens inside a Figma SECTION on the canvas, using the Component Migration library's Behavior Annotation component and bordered group frames. Use when the user shares a Figma section link and asks to annotate, document on canvas, label states, or add behavior notes to components in the Component Migration file or any file that uses it as a library. Requires a section: if given a single component, frame, page or whole file, ask the user to put the work in a section and share that section's link first."
---

# Figma section annotation

Annotate the states and in-context screens of a component directly on the Figma canvas, beside the design. Works in the Component Migration file and in any file that uses it as a library.

This is on-canvas annotation only, not a separate documentation frame or a website page.

Load the `figma-use` skill before any `use_figma` call.

## Step 0: Require a section

The work must be in a Figma **section**. Check before doing anything else.

1. Get the node from the link (`node-id=1-2` → `1:2`). Read its `type` with a read-only `use_figma` call, or `get_metadata`.
2. **If the node is a `SECTION`:** continue.
3. **If the link has no node-id** (the whole file or a page): stop. Ask the user to group the component and its examples in a section and share the section's link.
4. **If the node is a component, component set, frame or instance:**
   - Walk up its parents.
   - If it sits inside a section, ask: "This sits in the section '<name>'. Should I annotate that whole section?" Continue only once they confirm.
   - If it isn't in a section, stop. Ask the user to put the component and its examples (states, in-context screens) in a section and share that link.

Don't create the section for them, and don't move their work into one, unless they ask.

## Rules

- **Don't edit components.** Never change a component or its variants to annotate them. Only add annotation instances, move nodes within the section, and wrap them in group frames.
- **Ignore hidden layers.**
- **Use existing components.** Every annotation is a library instance. Never draw labels, leader lines or dots.
- **Don't invent facts.** Read state names, bound variables, measurements and behavior from the design. If something is undecided, write a To do note rather than guessing.
- **Keep the writing tight.** Short, direct, verb-first, no filler or marketing words.
- **Ask before deleting.** Don't delete existing annotations the user made. Update or reposition them, and ask before removing any.

## Library assets

Resolve these at runtime so the skill works in any file.

**Behavior Annotation** (component set named `annotation`, Component Migration library; it lives on the Tracking System page, node `337:33162`)
- Set key `e1505bb3276e149019d395eb8be4adc7a9e92c4e`.
- How to get it:
  - Run `figma.importComponentSetByKeyAsync(key)`.
  - If that fails in the library file itself, use `figma.getNodeByIdAsync('337:33162')`, or find the local `COMPONENT_SET` named `annotation`.
  - If neither works, tell the user the Component Migration library needs to be enabled in their file, and stop.
- The variant property is **`Type`**. Find variants by name, e.g. `set.children.find(c => c.name === 'Type=Note')`.

| Variant | Size | Use |
|---|---|---|
| `Type=left` | 372 wide (240 card + 130 leader + 10 dot) | Points at a target to its right; the dot sits on the target's left edge |
| `Type=right` | 372 wide | Mirrored, for a target to its left |
| `Type=Note` | 240 wide, resize to 300–520 | Group headings, to-dos, notes about a whole frame. No leader |

The set also has `Type=JSON` and `Type=change`. This skill doesn't use them.

Each variant has two text layers: `eyebrow` (Inter Semi Bold, uppercase) and `body` (Inter Regular). Load both fonts before editing text.

**Group border color:** subatomic `color/border/subtle`, variable key `d96a57a44d5a81a4b87b456e1f45e67d90084a3b`. Import it with `figma.variables.importVariableByKeyAsync(key)`.

## Step 1: Inventory the section

Run a read-only `use_figma` call that lists the section's direct children: id, type, name, x, y, width, height, and the eyebrow text of any existing annotations. Then sort the children into groups:

| Group | What it is |
|---|---|
| Component states | A component set and its variants |
| Single state | A frame showing one state, e.g. favorited |
| Composed state | Instances arranged to show an interaction, e.g. a card with its menu open |
| Container states | A component set of a larger container, e.g. empty, loading, no results |
| In-context screen | A full screen showing the component in use |

If the grouping isn't clear, list what you found and ask the user to confirm before annotating.

## Step 2: Read the source

- **Variants:** read each variant's name, bound variables (fills, strokes, effects, padding, gap, radius) and size. Report real token names.
- **In-context screens:** measure where the component sits relative to the thing that opens it: gap, width, direction, and what it overlays.
- **Unknowns:** don't guess. Collect anything unknown for a To do note.

## Step 3: Write and place annotations

**What each group gets**

| Group | Annotations |
|---|---|
| Component states | A Note heading above the set. A `left` annotation per variant, eyebrow = the state name |
| Single state | One `left` annotation |
| Composed state | One `left` annotation pointing at the main instance |
| Container states | A Note heading above the set, a To do Note beside it if anything is open, and a `left` annotation per variant |
| In-context screen | A Note heading above the frame. Notes to its right for screen-wide behavior: keyboard, opening direction, button state |

**Content**
- **Eyebrow:** the state or topic, uppercase. For example `DEFAULT`, `HOVER`, `KEYBOARD FOCUS`, `EMPTY – FAVORITES`, `IN CONTEXT: ACTIVE CHAT`, `TO DO: DOCKED CHAT`.
- **Body:** one to three short sentences, in this order:
  1. What's different in this state, with real token names.
  2. Behavior: what click, Enter, Esc or the arrow keys do.
  3. Layout facts a developer would otherwise guess: widths, gaps, where it opens.
- **Group heading:** what the set is, plus one rule that applies to all its variants.
- **To do:** one sentence naming what still needs designing.
- **Length:** if an annotation runs into the next one, shorten the text before moving anything.

**Placement**
- **`left` annotation:**
  - `x = target.x − 372`.
  - `y = target.y + target.height / 2 − annotation.height / 2`.
  - For tall targets, center on `target.y + min(target.height / 2, 120)` so the label sits by the header.
  - Variant positions are relative to their component set, so add the set's x and y.
- **Group heading Note:** left-aligned with the content, 24 above it.
- **To do Note:** 24 to the right of the heading, bottom-aligned with it.
- **Screen-level Notes:** 40 to the right of the frame, level with the part they describe.

## Step 4: Group frames

Wrap each group (its heading, content and annotations) in its own frame:
- A plain frame: no auto layout, `clipsContent = false`, no fill.
- Stroke 1px, bound to `color/border/subtle`. Corner radius 16.
- 40 padding around the bounding box of its contents.
- Name it after the group, e.g. `Prompt card states`, `In context: active chat`.
- To move nodes in: append each one to the frame, then restore its position with `node.x = oldX − frame.x` and `node.y = oldY − frame.y`.
- If a group is already a single bordered frame, keep it and bind its stroke to the same variable.

## Step 5: Arrange the section

- Two columns. Left: component states, then single states, then composed states, then container states. Right: in-context screens.
- 80 from the section's top and left edges, 48 between groups, 120 between the columns.
- Resize the section to its contents plus 80 with `section.resizeWithoutConstraints(w, h)`.

## Step 6: Verify

- Take a screenshot of the section.
- Run an overlap check on the section's direct children. Overlapping group frames are a failure: fix them, then take one more screenshot.
- Report what you added, any To do notes, and anything you couldn't read from the design.

## Re-annotating after design changes

When the user changes the design later:
1. Re-read the affected variants.
2. Update the annotation text, without editing the components.
3. Re-center each `left` annotation on its target, and move headings back to 24 above their content.
4. Grow each group frame to fit and re-run the arrangement and verification.

## Plugin API notes

- Switch pages once per script with `await figma.setCurrentPageAsync(page)`.
- Bind colors with `figma.variables.setBoundVariableForPaint(paint, 'color', variable)`.
- `appendChild` returns nothing. Keep a reference to the node and set properties on that, not on the return value.
- Read-only calls first; batch related writes into one call.
- Return every created and moved node ID.

