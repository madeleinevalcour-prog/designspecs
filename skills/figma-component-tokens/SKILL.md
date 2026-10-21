---
name: "figma-component-tokens"
description: "Create component-level Figma variables (Tier 3 component tokens) for a component in the Component Migration library and rebind the component to them, following the file's existing naming, description and aliasing conventions. Use when the user asks to create variables, component tokens, or tokens for a component, tokenize a component, or \"make variables like the others\" for a Figma component or component set in the Component Migration file."
---

# Figma component tokens

Create component-level variables (component tokens) for a Figma component, then rebind the component to them. Each component token aliases the token the component was already bound to, so nothing changes visually. The component just gets its own named layer of tokens.

Variables live in the **Component Migration** library file, in the local collection **`semantic tokens`** (mode `default`). Load the `figma-use` skill before any `use_figma` call (and `figma-generate-library` if available).

## Step 0: Check the input

- **A component or component set:** continue.
- **A section, page or frame:** list the components in it and ask which ones to tokenize.
- **A file that uses Component Migration as a library:** stop. Library variables can only be created in the library file itself, so ask for the same component's link in the Component Migration file.
- **Collection check:** confirm the local collection `semantic tokens` exists with `figma.variables.getLocalVariableCollectionsAsync()`. If it doesn't, stop and ask.

## Rules

- **Values never change.** Every new token aliases the value already in use. Check sizes and colors before and after.
- **Only this component's own nodes.** Tokenize the variants and the plain frames inside them. Don't rebind anything inside nested instances (buttons, chips, icons, other components); those keep their own tokens.
- **Leave styles alone.** Effect styles (elevation) and text styles stay as styles. Don't turn them into variables.
- **Don't invent tokens.** If a raw value has no matching variable, flag it and ask.
- **Ignore hidden layers.**
- **Confirm before writing.** Show the plan table (step 4) to the user before creating anything.

## Conventions (match the existing tokens)

Look at existing tokens for the same family first and copy them. For example, list local variables starting with `amplify-chat/` and read a few names, descriptions, scopes and alias targets.

### Name

`<family>/<component>/<group>/<property>[/<part-or-variant>]`

| Part | Rule |
|---|---|
| `family` | The component family prefix used in the file, e.g. `amplify-chat`. For core components, the family is the component itself, e.g. `card/...`. If unclear, ask |
| `component` | The Figma component name in kebab case, e.g. `prompt-card`, `chat-input` |
| `group/property` | `spacing/gap`, `spacing/padding-horizontal` (left + right), `spacing/padding-vertical` (top + bottom), `border/radius` (all four corners), `color/background`, `color/border`, `color/content/<part>` |
| Inner parts | Put the part before the property: `spacing/header/gap`, `spacing/content/gap`, `spacing/grid/padding-horizontal`, `spacing/tab-bar/gap` |
| Variants | When a value differs by variant, add the variant: `color/border/hover`, `color/border/focus`, `spacing/padding-vertical/docked` |

- **Variant naming:** when a property has variant suffixes, name the base one `/default` too (`color/border/default`, `color/border/hover`). A variable and a group can't share a name.
- **One token per property:** share one token across variants and parts when the value and meaning are the same.

### Value

- **Bound to a semantic or base token:** alias that token directly.
- **Bound to another component's token** (e.g. a card was bound to `amplify-chat/chat-list-item/...`): alias what that token aliases. Don't chain one component's tokens through another's.
- **Raw value:** find the matching variable by value and purpose (`search_design_system`, entity `variable`), e.g. raw 48 → `spacing/48`. If there's no clear match, ask.

### Description

`<Family label> <component> <figmaProperty>. Direct alias to <target name>. Preserves the original binding.`

- Example: `Amplify chat prompt-card itemSpacing. Direct alias to list-item/spacing/content/gap. Preserves the original binding.`
- For raw values, end with `Replaces a raw <n>px value.` (plus where it's used, if helpful) instead of "Preserves the original binding."

### Other settings

- Collection `semantic tokens`, mode `default`.
- `resolvedType` matches the target (`FLOAT` or `COLOR`).
- Scopes: `['ALL_SCOPES']`.

## Step 1: Inventory

Run a read-only script over every variant of the component. Walk the variant and its plain child frames, and stop at nested instances. For each node, report:

- **Bound variables** (`node.boundVariables`) with variable names. Check `itemSpacing`, `counterAxisSpacing`, the paddings, the four corner radii, `gridRowGap`/`gridColumnGap`, fills, strokes and effects.
- **Raw values** for the same properties when they aren't bound.
- **Effect styles** (to leave alone).

Keep output short (one line per node). Scripts can only return about 20KB, so inventory one or two representative variants first if the set is large.

## Step 2: Reuse check

List local variables already named `<family>/<component>/...`. Reuse and update them rather than creating duplicates.

## Step 3: Map

For each bound or raw property, decide the token name, alias target and description using the conventions above. Group properties that should share a token: left and right padding, top and bottom padding, all four corners, row and column gap, and the same fill used on several parts.

## Step 4: Confirm

Show a table and wait for approval:

| Token | Aliases | Applied to |
|---|---|---|
| `amplify-chat/prompt-card/color/border/default` | `color/border/subtle` | Default strokes |

Also list:
- raw values with no match
- anything skipped (nested instances, effect styles)

## Step 5: Create and bind

In one script:
1. Get the collection and its `modeId`, and import remote targets with `figma.variables.importVariableByKeyAsync(key)`. Local targets use `getVariableByIdAsync`.
2. Create or reuse each variable:
   - `figma.variables.createVariable(name, collection, type)`.
   - `setValueForMode(modeId, figma.variables.createVariableAlias(target))`.
   - Set `scopes` and `description`.
3. Rebind:
   - **Numbers:** `node.setBoundVariable(field, variable)` for each field. Corners are bound one by one: `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius`.
   - **Paints:** `node.fills = node.fills.map(p => figma.variables.setBoundVariableForPaint(p, 'color', v))`, same for `strokes`.
   - **Effect colors** (e.g. a focus ring drawn as an inner shadow): `figma.variables.setBoundVariableForEffect(effect, 'color', v)`.
4. Return the created, reused and rebound names.

## Step 6: Verify

- Re-run the inventory. Every intended property should now point at the new tokens.
- Compare sizes (width, height, padding) with the first inventory; they must match.
- Take a screenshot of the component set to confirm it looks the same.
- Report the token list and anything flagged.

## Step 7: Code handoff (Design Specs repo)

If the component exists, or will exist, in the Design Specs repo (`ats-ui`):

1. **Token CSS:** tell the user to re-export the collection from Figma (Variables Pro), replace `tokens/component-migration.json`, and run `npm run tokens` and then `npm run check`. Claude can't run the export.
2. **CSS var names:** the Figma path with `/` → `-`, e.g. `--amplify-chat-prompt-card-color-border-default`.
3. **Before the re-export:** code should use the new var with a fallback to the aliased token, e.g. `var(--amplify-chat-prompt-card-color-border-default, var(--color-border-subtle))`. The look stays the same until the export lands.
4. **Naming mismatches:** if the live Figma names differ from the names in the current export (older exports added the aliased token's name to the end), warn that a re-export may rename existing CSS variables. `npm run check` will list any that break.

## Plugin API notes

- Switch pages once per script with `await figma.setCurrentPageAsync(page)`.
- Remote variables aren't returned by `getLocalVariablesAsync()`. Find them with `search_design_system` and import them by key.
- Return values must stay under about 20KB. Summarize rather than dumping whole trees.

