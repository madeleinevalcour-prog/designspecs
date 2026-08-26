# Modern UI Design System

The complete foundation reference for the Modern UI design system — principles and the token foundations (color, spacing, elevation, typography) that govern every surface built on it.

Source files: **Modern UI Components** (Component Migration — `QxXJfpYajGitTbThkkQCXm`) and **Modern UI Design Tokens** (Subatomic — `QfUcff23xkvDja8vI1Hccd`). All token values are pulled directly from these files.

## Contents

- Principles
- Color
- Spacing
- Elevation
- Typography

## Principles

### Why the redesign happened

The old UI was losing deals. In the SMB segment — Bullhorn's largest customer base by volume — feedback from lost deals and churned accounts pointed to one theme: the interface was not perceived as modern, clean, or AI-forward next to competing products. Look and feel, alongside perceived feature value, showed up repeatedly in both win rate and first-year retention.

The gap was one of perception and daily experience, not capability. The platform's depth was not in question; what customers saw when they logged in was. Modern UI closes the distance between what customers expect from a modern platform and what they experience today, and it does it without disturbing the workflows, data, and configuration that make the platform valuable.

### What the system is built to resolve

Perception is fixed by what customers see and feel every time they log in, so the foundation has to do two things at once: read as modern and clean, and make daily work faster. The guidelines that follow are built to deliver both from the same decisions.

The platform's primary users are high-volume, KPI-driven, and keyboard-first. Their work is transactional and repetitive — running searches, moving records, entering and reading data at speed — and their central frustration is friction: slow, multi-click paths to information, and interfaces that look and behave inconsistently from one workflow to the next. For this user, every unnecessary click is a candidate that can be lost to a competitor.

That shapes how the foundation resolves the perception gap. A clean, uncluttered surface is not only what reads as modern — it is also what lets a high-volume user find and act on the right information without hunting. Consistency is not only a mark of a considered product — it directly removes the confusion of inconsistent workflows the persona names as a pain. Carved, tonal depth makes dense screens legible so more information fits without feeling congested. Disciplined spacing keeps those dense surfaces calm rather than cramped. In each case the decision that makes the platform look modern is the same decision that makes it faster to use. The foundations below are where that dual payoff is specified.

### The three principles

Three principles govern the system: **clean, modern, and consistent**. They are the commitments the redesign is built on and the standard every foundation and component is measured against. Each is carried by a set of supporting principles — the specific, repeated decisions across the foundations that make the top-level commitment real rather than aspirational.

#### Clean

No visual noise that does not carry information. A clean surface is what reads as modern and what lets a high-volume user find and act on the right information without hunting.

- **Density that stays calm.** Serve high-volume work without fatigue. Density comes from disciplined, consistent rhythm on a tight scale — not from shrinking type or cramming surfaces. Tighten space within a group and open it between groups, so grouping reads through proximity rather than through added chrome.
- **Depth is carved, not stacked.** Separate surfaces with tonal layering, border color, and diffuse, clearly defined elevation levels that place each surface in the page's depth order. Structure comes from tone and edge first; elevation reinforces hierarchy rather than decorating it. This is what keeps dense screens legible instead of congested.
- **Establish clear figure and ground.** Data is the figure; chrome is the ground. Keep working surfaces tonally distinct from the frame around them so the eye lands on content first. When every surface sits in the same lightness band, the interface flattens and reading slows — the tonal steps and carved borders exist to prevent exactly that.

#### Modern

Current with what customers expect from a leading platform, so the interface closes the perception gap the moment a user logs in.

- **Accessible by construction.** Meet WCAG 2.2 AA. Never signal state or meaning with color alone — pair every color cue with text, shape, weight, or icon so it survives color-blindness and assistive technology. A modern platform is one everyone can use; accessibility is a property of the foundation, not a later pass.
- **One restrained, deliberate visual language.** A single typeface (Inter), role-bound type weights, and a color system that reserves saturation for status and meaning. Restraint is what reads as current — the interface looks considered because color and weight are spent only where they carry information, not for decoration.
- **State is expressed, never implied.** Every interactive element has a defined treatment for each state — default, hover, active, focus, disabled, error — built into the system. Focus is a visible ring paired with a heavier border; active and error shift weight and border, not just color. A platform that responds clearly to every action is what feels modern and trustworthy in use.

#### Consistent

The same element looks and behaves the same everywhere it appears. Consistency is not decoration — inconsistent, system-flavored UI across workflows is a named user pain, and it removes friction directly by making the interface predictable from one workflow to the next.

- **Tokens are the system.** Every value ships as a token or component variant, never a per-screen decision. The architecture layers primitive values, then semantic tokens that name a role, then component tokens. Components bind to the semantic layer, never to a raw value. The test for correct placement: if the underlying primitive changed, would this token update automatically? If not, it is misplaced. This is what makes consistency hold and future retuning possible at all.
- **Choose by role, not by value.** Tokens are named for what they are for — a background, a container's padding, a card title — not for the value they resolve to. Two tokens can share a value and still carry different intent; naming by role keeps that intent legible at the point of use and safe to retune later, so the same role always resolves the same way.
- **Meaning is encoded consistently.** A signal means the same thing wherever it appears: the status families (negative, warning, success, positive) map to fixed meanings, entity accents identify their record type on every surface they touch, and weight marks the selected state the same way on tabs and navigation. Once a user learns a cue, it holds across the product.

### How to use this system

- **Bind to tokens, never to raw values.** Apply the semantic token or named style that describes the role — a background, a border, a text style, an elevation level. A raw hex, pixel value, or hand-built shadow on a component is a defect; rebind it to the token that names the intent.
- **Choose by role, not by value.** Pick `title/sm` because the text is a card title, `padding/*` because the space is inside a container. Two tokens resolving to the same value still carry different intent, and the role keeps that intent legible at the point of use and safe to retune later.
- **Build depth in order.** Tonal layering and border color first, elevation level second, to place a surface in the page hierarchy. Border width is a state signal (1px default, 2px active/focus/error), not a depth tool.
- **Do not introduce off-system values.** If a layout seems to need a value between two steps, the layout is wrong before the scale is. Resolve it with the nearest token rather than a one-off.
- **Flag, do not invent.** Where a value is genuinely unresolved, mark it as such rather than filling the gap with a guess. The foundation pages call out open decisions and known gaps explicitly; keep that discipline.

### How Modern UI differs from the old UI

Modern UI is a redesign of the platform's visual foundation. Application functionality, recruitment processes, fields, workflows, data, custom fields, page layouts, and configurations are unchanged and transfer automatically. What changes is the visual and structural foundation:

- **Navigation moves to the left.** Standard menu actions move from the top navigation bar to a permanent, collapsible left sidebar (the bowling alley). This frees vertical space for reading candidate files and record details, and frees horizontal space when the search slideout or the Amplify chat slideout is open.
- **A rebuilt token foundation.** Spacing, typography, color, and icons are all rebuilt on the design token system rather than set ad hoc. The typographic base shifts from a 10px to a 16px rem base.
- **Carved, tonal depth.** The old surfaces tended to land in one lightness band, flattening the figure/ground relationship. Modern UI pushes structure through tonal layering, carved 1px borders, and defined elevation levels so data reads as figure and chrome as ground.
- **Consistency enforced in the system.** Where the old UI drifted between workflows, Modern UI ships every foundation value as a token or component variant, so the same element is the same everywhere.

### What customers get

- **More usable screen space.** The collapsible left navigation returns vertical and horizontal room to the work itself — candidate files, record details, search results.
- **Faster daily work.** A cleaner, denser-but-calmer interface helps high-volume users move through records and find what matters with less friction and fewer clicks.
- **A modern, credible platform.** The interface now matches what customers expect from a leading product, directly answering the perception gap behind competitive losses.
- **No disruption.** Data, workflows, settings, custom fields, and configurations transfer automatically. Core recruitment processes work exactly as before, so retraining is minimal — largely a heads-up on where the navigation moved.
- **No added cost.** The refresh is included in every existing subscription tier, across all editions of the ATS/CRM, at no additional cost.
- **Every user, not just recruiters.** Sales, back office, and management all work on the same rebuilt foundation.

### The foundations

The sections that follow document the token foundations that enforce these principles. Each pulls its values directly from the source files, shows the primitive and semantic layers, and states the usage rules that keep work in system.

- **Color** — the neutral scale, utility and status families, entity accents, and the semantic background, border, text, and icon tokens.
- **Spacing** — the 8-based scale and the padding, gap, and layout tokens built on it.
- **Elevation** — the diffuse elevation levels that order the page front to back, plus focus, radius, and border-width.
- **Typography** — Inter, the role-based text styles, and the role-bound weight system.


## Color

### How color is structured

Color follows a three-tier token architecture. Each tier has a distinct job, and components only ever bind to the top tier.

- **Primitives** — raw color values with no assigned meaning. The neutral scale, utility color scales, named brand colors, and entity accents. Never bind a component directly to a primitive.
- **Semantic tokens** — role-based tokens (background, border, text, icon) that alias a primitive to a purpose. This is the layer components bind to.
- **Component tokens** — where a component needs a value the semantic layer does not express, it aliases a semantic token. Color has few of these; most components bind straight to semantic tokens.

The governing test for placement: *if the primitive value changed, would this token update automatically?* If yes, the token is aliased correctly. If a component holds a raw value, it is misplaced and must be rebound to a semantic token.

Naming convention: `color/[role]/[variant]` for semantic tokens, `color/[family]/[step]` for primitives. Slashes denote the group hierarchy in the token file.

### Primitives

Raw values. Two collections hold them: `core` (neutrals, utility scales, transparency) and base values (brand and entity colors). Listed for reference and traceability — components must not bind to these.

#### Neutral scale

The structural backbone of the interface. Surfaces, borders, and text all resolve to this scale. It is a cool near-neutral, not warm.

| Token | Value |
| --- | --- |
| `color/gray/0` | `#ffffff` |
| `color/gray/50` | `#fcfdfd` |
| `color/gray/75` | `#f7f8f8` |
| `color/gray/100` | `#ebedef` |
| `color/gray/200` | `#dee0e3` |
| `color/gray/300` | `#c2c5cb` |
| `color/gray/400` | `#9ba1a9` |
| `color/gray/500` | `#89909a` |
| `color/gray/600` | `#78808a` |
| `color/gray/700` | `#677079` |
| `color/gray/750` | `#525b63` |
| `color/gray/800` | `#3d464d` |
| `color/gray/900` | `#2f2f33` |

#### Utility scales

Full 100–900 scales for the four status families. Semantic status tokens alias into these.

| Family | Steps | Value range (100 → 900) |
| --- | --- | --- |
| Blue (positive) | 100–900 | `#e6f1ff`, `#accdf8`, `#76a9ed`, `#4a89dc`, `#296cc3`, `#1450a0`, `#073674`, `#011e44`, `#000a17` |
| Green (success) | 100–900 | `#f3ffe6`, `#bde294`, `#8cc152`, `#78b732`, `#63a61b`, `#4d8a0c`, `#366504`, `#203d01`, `#0c1700` |
| Yellow (warning) | 100–900 | `#fff5e6`, `#ffe0ac`, `#ffc973`, `#f6b042`, `#d89122`, `#b0710e`, `#7e4f04`, `#492d01`, `#170e00` |
| Red (negative) | 100–900 | `#ffe6e8`, `#f8a9b1`, `#ec717e`, `#da4453`, `#c12535`, `#9f111f`, `#700610`, `#400107`, `#120002` |

#### Transparency

Alpha-based primitives for overlays, scrims, and layered states.

| Set | Steps | Base color |
| --- | --- | --- |
| White | 10–90 | `#ffffff` at 0.10–0.90 |
| Black | 10–90 | `#000000` at 0.10–0.90 |
| Charcoal | 04, 08, 10–90 | `#2f2f33` (04 uses `#282828`) at listed alpha |

#### Brand colors

Named brand and product colors held as primitives.

| Token | Value |
| --- | --- |
| `color/purple/lead-purple` | `#913b8d` |
| `color/purple/opps-purple` | `#6b2155` |
| `color/purple/lilac-purple` | `#a499c8` |
| `color/purple/light-purple` | `#dcd6f2` |
| `color/blue/navigation-blue` | `#202945` |
| `color/blue/sky-blue` | `#1b9ad6` |
| `color/blue/medium-blue` | `#125783` |
| `color/blue/light-blue` | `#aae1f4` |
| `color/blue/blue-gray` | `#314158` |
| `color/green/automation-green` | `#49b790` |
| `color/green/dark-green` | `#00956c` |
| `color/green/light-green` | `#a5d6be` |
| `color/orange/bullhorn-orange` | `#ff6b00` |
| `color/orange/valencia-orange` | `#ca5728` |
| `color/orange/coral-orange` | `#ff9045` |
| `color/yellow/honey-yellow` | `#ffce5c` |
| `color/yellow/golden-yellow` | `#ffb400` |
| `color/yellow/light-yellow` | `#ffda85` |

### Entity colors

Each record type carries its own accent color. The entity color is used as the accent in certain components when that component is attached to a particular entity type — for example, the icon in an entity card, or the active-state treatment on a record tab. It identifies which entity a surface belongs to at a glance.

| Entity | Token | Value |
| --- | --- | --- |
| Job | `color/entity/job` | `#bb5566` |
| Candidate | `color/entity/candidate` | `#44bb77` |
| Contact | `color/entity/contact` | `#ffaa44` |
| Company | `color/entity/company` | `#3399dd` |
| Lead | `color/entity/lead` | `#aa6699` |
| Opportunity | `color/entity/opportunity` | `#662255` |
| Placement | `color/entity/placement` | `#0b344f` |
| Submission | `color/entity/submission` | `#a9adbb` |
| Sendout | `color/entity/sendout` | `#747884` |
| Note | `color/entity/note` | `#747884` |
| Task | `color/entity/task` | `#4f5361` |
| Contract | `color/entity/contract` | `#454ea0` |
| Job code | `color/entity/job-code` | `#606d79` |
| Earn code | `color/entity/earn-code` | `#606d79` |
| Invoice statement | `color/entity/invoice-statement` | `#606d79` |
| Billable charge | `color/entity/billable-charge` | `#606d79` |
| Payable charge | `color/entity/payable-charge` | `#606d79` |

**Known gap (to be confirmed):** entity colors currently exist only as primitives. There is no semantic-layer token aliasing them to an accent role (no `color/accent/entity/*`). Components that use an entity accent bind to the primitive directly, which the architecture otherwise disallows. A semantic accent layer is the correct long-term home for these; not yet built.

### Amplify gradient

Amplify has a dedicated radial gradient that signals Amplify functionality and AI-assisted features. Wherever it appears, it marks that a surface or control is powered by Amplify or AI — it is a meaning cue, not a decorative fill, and it should not be used for anything else.

The gradient is delivered as a **paint style**, not a variable. Figma cannot store a gradient in a variable, so this treatment sits outside the primitive → semantic token structure that governs the rest of color. It is applied as the named paint style directly; there is no token to bind to.

| Paint style | Type | Composition |
| --- | --- | --- |
| `Amplify Radial` | Radial gradient | Green through blue to deep blue — stops: `#37fc97` (0), `#a5f7d0` (~0), `#23afdc` (0.47), `#09a0de` (0.56), `#009bdf` (0.65), `#125783` (0.97) |
| `Amplify Radial Hover` | Radial gradient + solid overlay | Same gradient stops as `Amplify Radial`, with a `#065e89` solid overlay on top for the hover state |

Notes:
- Apply the named paint style — do not rebuild the gradient by hand or approximate the stops.
- Reserve this treatment exclusively for Amplify and AI-assisted features so the cue stays meaningful. Using it decoratively elsewhere would dilute what it signals.
- Because it lives outside the variable system, it will not update through a primitive change the way token-bound color does. Any change to the Amplify treatment is a direct edit to the paint style.

### Semantic tokens

The layer components bind to. Each token aliases a primitive and names a role. The resolved value is shown for reference and contrast checking — bind to the token name, never the hex.

#### Background

Surface fills, from the base canvas through hover, subtle, and disabled states.

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/background/default` | `color/gray/0` | `#ffffff` |
| `color/background/muted` | `color/gray/50` | `#fcfdfd` |
| `color/background/subtle` | `color/gray/75` | `#f7f8f8` |
| `color/background/subtle-hover` | `color/gray/100` | `#ebedef` |
| `color/background/medium` | `color/gray/300` | `#c2c5cb` |
| `color/background/hover` | `color/utility/blue/100` | `#e6f1ff` |
| `color/background/disabled` | `color/gray/50` | `#fcfdfd` |
| `color/background/scroll` | `color/transparency/white/white-90` | `#ffffff` at 0.90 |
| `color/background/overlay` | `color/transparency/charcoal/charcoal-08` | `#2f2f33` at 0.08 |

`background/hover` resolves to the same value as `background/utility/positive` (`#e6f1ff`). This is intentional — the hover state reuses the positive-utility tint. Bind to `background/hover` for hover, not the utility token.

#### Background — utility (status)

Status surface fills. Each family has a light fill, a hover, and a knockout set (a saturated fill for solid status treatments) with its own hover and disabled steps.

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/background/utility/negative` | `color/utility/red/100` | `#ffe6e8` |
| `color/background/utility/negative-hover` | `color/utility/red/200` | `#f8a9b1` |
| `color/background/utility/negative-knockout` | `color/utility/red/600` | `#9f111f` |
| `color/background/utility/negative-knockout-hover` | `color/utility/red/700` | `#700610` |
| `color/background/utility/negative-knockout-disabled` | `color/utility/red/300` | `#ec717e` |
| `color/background/utility/warning` | `color/utility/yellow/100` | `#fff5e6` |
| `color/background/utility/warning-hover` | `color/utility/yellow/200` | `#ffe0ac` |
| `color/background/utility/warning-knockout` | `color/utility/yellow/600` | `#b0710e` |
| `color/background/utility/warning-knockout-hover` | `color/utility/yellow/700` | `#7e4f04` |
| `color/background/utility/warning-knockout-disabled` | `color/utility/yellow/300` | `#ffc973` |
| `color/background/utility/success` | `color/utility/green/100` | `#f3ffe6` |
| `color/background/utility/success-hover` | `color/utility/green/200` | `#bde294` |
| `color/background/utility/success-knockout` | `color/utility/green/600` | `#4d8a0c` |
| `color/background/utility/success-knockout-hover` | `color/utility/green/700` | `#366504` |
| `color/background/utility/success-knockout-disabled` | `color/utility/green/300` | `#8cc152` |
| `color/background/utility/positive` | `color/utility/blue/100` | `#e6f1ff` |
| `color/background/utility/positive-hover` | `color/utility/blue/200` | `#accdf8` |
| `color/background/utility/positive-knockout` | `color/utility/blue/600` | `#1450a0` |
| `color/background/utility/positive-knockout-hover` | `color/utility/blue/700` | `#073674` |
| `color/background/utility/positive-knockout-disabled` | `color/utility/blue/300` | `#76a9ed` |

#### Border

Structural borders and dividers. Carved 1px borders and tonal shifts do the work of separating surfaces; these tokens supply them.

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/border/subtle` | `color/gray/200` | `#dee0e3` |
| `color/border/default` | `color/gray/300` | `#c2c5cb` |
| `color/border/medium` | `color/gray/400` | `#9ba1a9` |
| `color/border/input` | `color/gray/500` | `#89909a` |
| `color/border/control` | `color/gray/600` | `#78808a` |
| `color/border/disabled` | `color/gray/200` | `#dee0e3` |
| `color/border/focus` | `color/border/utility/positive` → `color/utility/blue/400` | `#4a89dc` |

`border/focus` aliases the positive-utility border rather than a primitive directly — a two-hop chain. Keep it aliased to `border/utility/positive` so a change to the positive family carries into focus rings.

#### Border — utility (status)

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/border/utility/negative` | `color/utility/red/400` | `#da4453` |
| `color/border/utility/negative-hover` | `color/background/utility/negative-hover` | `#f8a9b1` |
| `color/border/utility/warning` | `color/utility/yellow/400` | `#f6b042` |
| `color/border/utility/warning-hover` | `color/background/utility/warning-hover` | `#ffe0ac` |
| `color/border/utility/success` | `color/utility/green/400` | `#78b732` |
| `color/border/utility/success-hover` | `color/background/utility/success-hover` | `#bde294` |
| `color/border/utility/positive` | `color/utility/blue/400` | `#4a89dc` |
| `color/border/utility/positive-hover` | `color/background/utility/positive-hover` | `#accdf8` |

The `-hover` utility borders alias their matching background-hover token rather than a primitive. This keeps a status border and its surface moving together.

#### Text

Text color by role. A three-tier hierarchy — headline, body, secondary — plus subtle, link, disabled, and knockout variants for use on dark surfaces.

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/text/headline` | `color/gray/900` | `#2f2f33` |
| `color/text/body` | `color/gray/800` | `#3d464d` |
| `color/text/secondary` | `color/gray/750` | `#525b63` |
| `color/text/subtle` | `color/gray/700` | `#677079` |
| `color/text/hover` | `color/gray/900` | `#2f2f33` |
| `color/text/link` | `color/utility/blue/500` | `#296cc3` |
| `color/text/link-hover` | `color/utility/blue/600` | `#1450a0` |
| `color/text/disabled` | `color/gray/500` | `#89909a` |
| `color/text/body-knockout` | `color/gray/0` | `#ffffff` |
| `color/text/disabled-knockout` | `color/gray/75` | `#f7f8f8` |

#### Text — utility (status)

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/text/utility/negative` | `color/utility/red/600` | `#9f111f` |
| `color/text/utility/warning` | `color/utility/yellow/600` | `#b0710e` |
| `color/text/utility/success` | `color/utility/green/600` | `#4d8a0c` |
| `color/text/utility/positive` | `color/utility/blue/600` | `#1450a0` |
| `color/text/utility/knockout` | `color/gray/0` | `#ffffff` |

#### Icon

Icon fill by role. Mirrors the text hierarchy so an icon and its label sit at matching weight.

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/icon/icon` | `color/gray/800` | `#3d464d` |
| `color/icon/subtle` | `color/gray/700` | `#677079` |
| `color/icon/illustration` | `color/gray/500` | `#89909a` |
| `color/icon/disabled` | `color/gray/400` | `#9ba1a9` |
| `color/icon/icon-knockout` | `color/gray/0` | `#ffffff` |
| `color/icon/disabled-knockout` | `color/gray/50` | `#fcfdfd` |

#### Icon — utility (status)

| Token | Alias | Resolved |
| --- | --- | --- |
| `color/icon/utility/negative` | `color/utility/red/600` | `#9f111f` |
| `color/icon/utility/warning` | `color/utility/yellow/600` | `#b0710e` |
| `color/icon/utility/success` | `color/utility/green/600` | `#4d8a0c` |
| `color/icon/utility/positive` | `color/utility/blue/600` | `#1450a0` |

**Open decision (to be confirmed):** whether icon fill at the container level should bind to `color/icon/icon-knockout` or a new `color/icon/on-entity` token. The `on-entity` token does not yet exist. Until resolved, knockout icons on entity-accented surfaces bind to `icon-knockout`.

### Usage rules

- Bind components to semantic tokens only. A raw hex or a primitive binding in a component is a defect — rebind to the semantic token that names the role.
- Use the status families consistently: negative for errors and destructive actions, warning for caution, success for completion and positive confirmation, positive (blue) for informational and default interactive emphasis.
- Never signal state with color alone. Pair every color cue with an icon, text, or shape so it survives color-blindness and screen readers.
- Structural separation comes from border tokens and background-tone shifts, not from color fills. Reserve saturated fills for status and knockout treatments.
- Knockout tokens (`body-knockout`, `icon-knockout`, `text/utility/knockout`) are for content on dark or saturated surfaces only. Do not use them on light backgrounds.

### Accessibility

Contrast targets: 4.5:1 for normal text, 3:1 for large text and non-text UI elements (WCAG 2.2 AA).

The text hierarchy on the default white background (`#ffffff`) is built to clear these targets: headline (`#2f2f33`), body (`#3d464d`), and secondary (`#525b63`) all pass 4.5:1 on white. `text/subtle` (`#677079`) passes 4.5:1 on white and is the lightest text safe for body-size copy on the default surface. `text/disabled` (`#89909a`) is intentionally below the body-text target — reserve it for disabled states, never for readable content, and always pair it with a non-color disabled cue.

Verify any text-on-status-surface pairing before shipping. Status text tokens (the `600` steps) are tuned for their light fills; confirm the specific pairing rather than assuming.


## Spacing

### How spacing is structured

Spacing follows a two-tier token architecture. Layout uses a single primitive scale, and components bind to named semantic tokens that alias into it.

- **Primitive scale** — a fixed set of raw pixel values (`spacing/0`–`spacing/128`). No assigned meaning. Never bind a component directly to a primitive.
- **Semantic tokens** — named padding and gap steps, plus layout tokens (gutter, columns, margin), each aliasing a primitive. This is the layer components bind to.

The governing test for placement: *if the primitive scale changed, would this token update automatically?* If a component holds a raw pixel value, it is misplaced and must be rebound to a semantic token.

Naming convention: `spacing/[role]/[step]` for semantic tokens, `spacing/[n]` for primitives, where `n` is the pixel value.

### The scale is built on 8

The primitive scale is an 8-based system. Below 8 it steps in 2s (`0, 2, 4`) for fine adjustments; from 8 up it steps in multiples of 8 (`8, 16, 24, 32, 48, 64, 80, 96, 128`). The single exception is `spacing/12`, retained for cases where an 8 gap is too tight and 16 too loose.

A single shared scale is what makes spacing read as intentional rather than arbitrary. Every gap and pad on screen resolves to one of these steps.

### Primitives

The raw scale. Listed for reference and traceability — components must not bind to these.

| Token | Value (px) |
| --- | --- |
| `spacing/0` | 0 |
| `spacing/2` | 2 |
| `spacing/4` | 4 |
| `spacing/8` | 8 |
| `spacing/12` | 12 |
| `spacing/16` | 16 |
| `spacing/24` | 24 |
| `spacing/32` | 32 |
| `spacing/40` | 40 |
| `spacing/48` | 48 |
| `spacing/64` | 64 |
| `spacing/80` | 80 |
| `spacing/96` | 96 |
| `spacing/128` | 128 |

Note: `spacing/40` and `spacing/64`+ exist in the primitive scale but are not currently aliased by any padding or gap semantic token. They are available for layout-level spacing (page margins, large section breaks) where a semantic step does not reach.

### Semantic tokens

The layer components bind to. Padding and gap share the same t-shirt sizing and the same underlying values — they are split by role so intent is legible at the binding site. The distinction: **padding** is the space around content inside a container; **gap** is the space between items within the same content container.

#### Padding

Space around content inside a container — between the container's edge and its content.

| Token | Alias | Resolved (px) |
| --- | --- | --- |
| `spacing/padding/none` | `spacing/0` | 0 |
| `spacing/padding/xxsm` | `spacing/2` | 2 |
| `spacing/padding/xsm` | `spacing/4` | 4 |
| `spacing/padding/sm` | `spacing/8` | 8 |
| `spacing/padding/md` | `spacing/16` | 16 |
| `spacing/padding/lg` | `spacing/24` | 24 |
| `spacing/padding/xlg` | `spacing/32` | 32 |
| `spacing/padding/xxlg` | `spacing/48` | 48 |

#### Gap

Space between items within the same content container, horizontal or vertical.

| Token | Alias | Resolved (px) |
| --- | --- | --- |
| `spacing/gap/none` | `spacing/0` | 0 |
| `spacing/gap/xxsm` | `spacing/2` | 2 |
| `spacing/gap/xsm` | `spacing/4` | 4 |
| `spacing/gap/sm` | `spacing/8` | 8 |
| `spacing/gap/md` | `spacing/16` | 16 |
| `spacing/gap/lg` | `spacing/24` | 24 |
| `spacing/gap/xlg` | `spacing/32` | 32 |
| `spacing/gap/xxlg` | `spacing/48` | 48 |

#### Layout

Page-level spacing tokens for the grid.

| Token | Alias | Resolved (px) | Role |
| --- | --- | --- | --- |
| `spacing/gutter` | `spacing/24` | 24 | Space between grid columns |
| `spacing/columns` | `spacing/12` | 12 | Column-level spacing unit |
| `spacing/margin` | `spacing/24` | 24 | Outer page margin |

### Usage rules

- Bind components to semantic tokens only. A raw pixel value in a component is a defect — rebind to the padding, gap, or layout token that names the role.
- Choose the token by role, not by value. Use `padding/*` for space around content inside a container and `gap/*` for space between items within the same container, even though they resolve to the same numbers. The role makes intent legible and keeps future retuning safe.
- Set within-group rhythm tighter than between-group spacing. The ratio is what creates grouping: use a smaller gap step within a section and a larger one between sections, so proximity does the work of separating groups (Gestalt — proximity).
- Reserve the large primitive steps (`spacing/64` and up) for page margins and major section breaks, not for spacing between fields or controls.
- Do not introduce off-scale values. If a layout needs a value between two steps, the layout is wrong before the scale is — resolve it with the nearest step rather than a one-off.

### Density note

The scale supports a dense, calm interface: tight, consistent within-group rhythm on the small steps, with generous between-group spacing on the larger steps. Density comes from disciplined use of the small steps, not from abandoning the scale. Keep the rhythm consistent so high-information surfaces stay scannable rather than cramped.

### Related — not covered here

`border/radius/*` and `border/width/*` alias the spacing scale but are a separate concern (surface shape and structural definition). They are documented in the Elevation section below, not here.

Depth in this system leans on border *color*, not border width. Width carries a single job — indicating state, not depth: 1px for most states, 2px for active, focus, and error. The tonal border color and background-tone shifts do the work of separating surfaces.


## Elevation

### How depth is built in this system

Depth is expressed through diffuse, clearly defined elevation styles that layer the interface front to back. Each style is a soft, low-alpha shadow tuned to place a surface at a specific level in the page hierarchy — not a hard drop shadow. Combined with border color and background-tone shifts, these styles establish which surfaces sit behind, at, and in front of the main focus area.

Elevation is organized as a set of numbered levels. The level is the primary decision: it maps a surface to its place in the page's depth order. The named button and focus styles are role-specific applications of the same approach.

Two supporting mechanisms work alongside elevation:

- **Border color** creates contrast and separation at the edge. Tonal border tokens (`color/border/subtle`, `color/border/default`, `color/border/medium`) define surface boundaries.
- **Border width** indicates state, not depth. Width changes only to mark a state change — it never gets heavier to push a surface forward.

Border-width state convention:

| Width | Token | State |
| --- | --- | --- |
| 1px | `border/width/border-default` | Default, and most states |
| 2px | `border/width/border-sm` | Active, focus, error |

### Elevation levels

The page depth order. Each level places a surface relative to the main focus area and, where noted, corresponds to a specific background semantic token. Apply the level that matches where the surface sits in the hierarchy, not by how much shadow looks right.

All shadow colors are low-alpha near-blacks (`#282828` at 0.04 and `#2f2f33` at 0.08), kept diffuse so the elevation reads as a soft, clearly defined lift rather than a hard-edged drop shadow.

| Level | Composition | Corresponds to | Use |
| --- | --- | --- | --- |
| `general/level 1` | Drop shadow, y 2, blur 4, `#282828` at 0.04 | — | The lightest lift, for a surface just barely raised off the plane. |
| `general/level 2` | Drop shadow, y 4, blur 8, `#2f2f33` at 0.08 | `background/default` | The main focus area of the page — headers, cards, workflow surfaces. |
| `general/level 2 - scroll` | Level 2 shadow + background blur 4 | `background/scroll` | Transparent containers that content scrolls behind. The background blur keeps them legible over moving content. |
| `general/level 3` | Two drop shadows (y 4 blur 8 `#2f2f33` 0.08; x 2 y 4 blur 8 `#282828` 0.04) | — | Surfaces above the main focus area — the bowling alley (left nav). |
| `general/level 3 - right` | Two drop shadows (y 4 blur 8 `#2f2f33` 0.08; x -2 y 4 blur 8 `#282828` 0.04) | — | Above-focus surfaces on the right side of the screen — slideout, Amplify chat. The negative X offset throws the shadow toward the screen edge. |
| `general/level 4` | Two drop shadows (y 4 blur 8 `#282828` 0.04; x 8 y 12 blur 16 `#2f2f33` 0.08) + background blur 4 | Used with `background/overlay` in some cases | The overlay level — dropdowns, modals, menus, overlays. The highest level, for surfaces that take focus over everything below. |

Notes:
- Levels 3 and 4 stack two shadows: a soft ambient layer plus a directional layer that gives the surface its sense of position (above, right, or floating over the page).
- `level 3 - right` mirrors `level 3` horizontally — the directional shadow points left (negative X) because the surface is anchored to the right edge.
- The `- scroll` and `level 4` styles include a background blur, so they must sit over content to read as intended.

### Button elevation

Buttons carry their own elevation styles so their resting, hover, and pressed states are consistent everywhere a button appears. These build on the same diffuse-shadow approach.

| Style | Composition | Use |
| --- | --- | --- |
| `button/default` | Drop shadow, y 2, blur 4, `#282828` at 0.04 | Default button shadow on any surface. |
| `button/hover` | `button/default` + drop shadow x 4 y 8 blur 12, `#2f2f33` at 0.08 | Hover state — adds a larger, softer lift on top of the resting shadow. |
| `button/active` | `button/hover` + inner shadow y 4 blur 8, `#2f2f33` at 0.08 | Pressed state — the inner shadow reads as the button being pushed in. |
| `button/active-no-container` | Inner shadow only, y 4 blur 8, `#2f2f33` at 0.08 | Active state for buttons that do not carry an exterior shadow. |

The button styles are additive: hover keeps the default shadow and adds to it; active keeps the hover shadow and adds the inner press. Use `active-no-container` for flat or embedded buttons where an exterior shadow would be wrong, so the press still registers.

### Focus rings

Focus is an effect style built as a two-layer stack of zero-blur drop shadows: an outer spread for the offset halo and an inner spread for the ring itself — a ring-with-offset. This is the visible half of the 2px state convention: focus is one of the states that shifts to a heavier, higher-contrast treatment.

| Style | Inner ring (spread 2) | Outer offset (spread 4) | Use |
| --- | --- | --- | --- |
| `inputs/focus` | `#ffffff` | `#202945` (navigation-blue) | Inputs and form controls. |
| `checkbox-focus` | `#ffffff` | `#4a89dc` (utility blue 400) | Checkboxes. |

Notes:
- Each ring is two zero-radius drop shadows at spread 4 (outer) and spread 2 (inner), offset 0,0. The inner white layer separates the ring from the control so focus stays visible against the input edge.
- Apply the focus ring together with the 2px border-width state. Focus is never signaled by color alone.

### Radius

Corner radius shapes surfaces. It aliases the spacing scale, so radius steps move with the base scale. Radius is a shape concern, applied per surface type for consistency.

| Token | Alias | Resolved (px) |
| --- | --- | --- |
| `border/radius/none` | `spacing/0` | 0 |
| `border/radius/xxsm` | `spacing/2` | 2 |
| `border/radius/xsm` | `spacing/4` | 4 |
| `border/radius/sm` | `spacing/8` | 8 |
| `border/radius/md` | `spacing/16` | 16 |
| `border/radius/lg` | `spacing/24` | 24 |
| `border/radius/xlg` | `spacing/32` | 32 |
| `border/radius/xxlg` | `spacing/48` | 48 |
| `border/radius/round` | — | 999 (fully round) |

`border/radius/round` is a fixed large value (999), not an alias — it produces a pill or circle regardless of element size. Use it for fully-round elements (avatars, pills, icon buttons), not as a large corner radius.

### Border width

Width is a state signal, not a depth signal. Depth comes from the elevation levels and border color; width changes only to mark state.

| Token | Value (px) | Role |
| --- | --- | --- |
| `border/width/border-default` | 1 | Default and most states |
| `border/width/border-sm` | 2 | Active, focus, error |
| `border/width/border-md` | 4 | Available; not used for surface state |
| `border/width/border-lg` | 8 | Available; not used for surface state |

### Usage rules

- Choose elevation by level, not by look. Match the surface to its place in the page depth order (level 1 barely raised, level 2 the focus area, level 3 above focus, level 4 overlays).
- Apply elevation as the named effect style. Do not hand-build a shadow on a component or invent an off-scale offset or alpha.
- Use the direction-specific level 3 style that matches the surface's anchor — `level 3` for the left-side bowling alley, `level 3 - right` for right-side slideouts and chat.
- Apply `- scroll` and `level 4` only over content, since they rely on a background blur to read.
- Do not use border width to create depth. Width marks state (1px default, 2px active/focus/error); the elevation levels and border color mark depth.
- Pair a focus ring with the 2px border-width state, and never signal focus, active, or error with color alone.
- Match radius to the surface type consistently — a given component type carries one radius everywhere it appears.


## Typography

### How typography is structured

Typography is delivered as a set of composed text styles, each tied to a role. A text style bundles font family, size, weight, line height, letter spacing, and case into one named value. Components apply the style; they never set the underlying properties individually.

- **Primitives** — the raw type values: the font family, the font-size scale, the line-height scale, weights, and letter-spacing steps. Never apply a primitive directly to a component.
- **Text styles** — role-based compositions (title, body, input, button, and so on) built from the primitives. This is the layer components apply.

The system is organized by role, not by an abstract size scale. A style is chosen by what the text is (a card title, a field value, a button label), not by picking a size. This keeps type decisions consistent and legible at the point of use.

Rationale: shipping type as role-based styles rather than loose sizes is what makes consistency hold across workflows. Inconsistent, system-flavored UI across the product is a named recruiter pain point (Chloe Davis persona), and consistency only holds when it is enforced in the system rather than left as a per-screen decision (Nielsen #4, consistency and standards). Binding every piece of text to a named role style is the enforcement mechanism.

Naming convention: `[role]/[size]` or `[role]/[variant]`, matching the group hierarchy in the token file.

### One typeface

The entire system is set in **Inter** (`typography/font-family/inter`). There is no secondary or display face. A single typeface across the product keeps dense, high-information surfaces consistent and calm.

Rationale: the redesign target is high-throughput warmth — dense and fast enough for a high-volume recruiter, yet calm and refined. One typeface serves the density side of that tension: it removes a variable that would otherwise add visual noise to information-dense screens, and it supports the calm-density goal that the competitive research identified as the open lane in the market. As little design as possible, applied to type (Rams #10).

### Weights are role-bound

Weight is fixed by role, not chosen situationally. Three weights are in use across every text style:

| Weight | Value | Inter style | Role |
| --- | --- | --- | --- |
| Regular | 400 | Regular | Body text, values, most reading text |
| Medium | 500 | Medium | Buttons, active/selected states, emphasis within body |
| Semi Bold | 600 | Semi Bold | Titles and headers |

Heavier weights (700 Bold, 800 Extrabold, 900 Black) exist as primitives but are not used in any current text style. Do not introduce a fourth weight or vary weight by situation — the role determines the weight.

Rationale: weights are role-bound and fixed by design — 400 for most text, 500 for buttons, 600 for headers, with no fourth weight and no situational variation. Fixing weight to role means the same kind of text always looks the same everywhere it appears, which is the consistency the system exists to enforce (Nielsen #4). It also lets weight do reliable work as a signal: because weight never varies for decoration, a shift to Medium reads unambiguously as a state or emphasis change (Gestalt — similarity; matched elements read as the same class, a break reads as meaningful).

### Text styles

The layer components apply. Every style is Inter. Weight, size, line height, letter spacing, and case are shown as composed.

#### Title

Headers and titles, set in Semi Bold with title case. Size steps down by surface.

| Style | Weight | Size | Line height | Case | Use |
| --- | --- | --- | --- | --- | --- |
| `title/default` | Semi Bold | 24 | 32 | Title | Page and primary titles |
| `title/md` | Semi Bold | 20 | 28 | Title | Slideout titles |
| `title/sm` | Semi Bold | 18 | 24 | Title | Card titles |

#### Body

Reading text and content. Regular by default, with a Medium variant at each size for emphasis. Three sizes cover large, default, and small contexts.

| Style | Weight | Size | Line height | Case |
| --- | --- | --- | --- | --- |
| `body/lg` | Regular | 16 | 24 | Original |
| `body/lg-medium` | Medium | 16 | 24 | Original |
| `body/default` | Regular | 14 | 20 | Original |
| `body/default-medium` | Medium | 14 | 20 | Original |
| `body/sm` | Regular | 12 | 16 | Original |
| `body/sm-medium` | Medium | 12 | 16 | Original |

`body/default` (14/20) is the workhorse reading size for the product.

Rationale: a compact default body size with a tight, consistent line height serves the calm-density goal — enough information on screen for a high-volume user without the surface feeling cramped or fatiguing. Density comes from disciplined, consistent rhythm, not from shrinking type past legibility; `body/default` is the size the rest of the reading hierarchy is tuned around.

#### Input — labels

Field labels. The `lg`/`md`/`sm` labels are uppercase with 0.5 letter spacing, set to sit above or beside their field. `field-label` is a distinct sentence-case label variant.

| Style | Weight | Size | Line height | Letter spacing | Case |
| --- | --- | --- | --- | --- | --- |
| `input/label/lg` | Regular | 14 | 14 | 0.5 | Upper |
| `input/label/md` | Regular | 12 | 14 | 0.5 | Upper |
| `input/label/sm` | Regular | 10 | 12 | 0.5 | Upper |
| `input/label/field-label` | Regular | 12 | 14 | 0 | Original |

The uppercase label styles carry 0.5 letter spacing to keep all-caps legible; `field-label` is sentence case with no added tracking.

#### Input — values

Text the user enters or that displays as a field value.

| Style | Weight | Size | Line height | Case |
| --- | --- | --- | --- | --- |
| `input/value/default` | Regular | 14 | 20 | Original |
| `input/value/default-medium` | Medium | 14 | 20 | Original |
| `input/value/sm` | Regular | 12 | 16 | Original |
| `input/value/hyperlinks` | Medium | 14 | 20 | Original |

`input/value/hyperlinks` is Medium to distinguish a linked value from a plain one; pair it with the link color token (`color/text/link`).

#### Meta

Supporting and secondary information — timestamps, counts, helper text. Medium weight, small sizes.

| Style | Weight | Size | Line height | Case |
| --- | --- | --- | --- | --- |
| `meta/default` | Medium | 12 | 14 | Original |
| `meta/sm` | Medium | 10 | 12 | Upper |

#### Button

Button labels, Medium weight, sized to match the button size.

| Style | Weight | Size | Line height | Case |
| --- | --- | --- | --- | --- |
| `button/lg` | Medium | 16 | 24 | Original |
| `button/default` | Medium | 14 | 20 | Original |
| `button/sm` | Medium | 12 | 16 | Original |

#### Tabs

Tab labels. Regular at rest, Medium when active — weight carries the selected state.

Rationale: carrying selected state with weight rather than color alone keeps the state legible where color can't be relied on. Never signal state with color alone — pair every color cue with shape, weight, or icon so it survives color-blindness and screen readers (WCAG 2.2 AA; Gestalt accessibility cross-check).

| Style | Weight | Size | Line height | Case |
| --- | --- | --- | --- | --- |
| `tabs/default` | Regular | 14 | 20 | Original |
| `tabs/active` | Medium | 14 | 20 | Original |

#### Bowling alley

Left-navigation text styles. Regular at rest, Medium when active, following the same weight-for-state pattern as tabs.

| Style | Weight | Size | Line height | Case | Use |
| --- | --- | --- | --- | --- | --- |
| `bowling-alley/main` | Regular | 16 | 20 | Original | Main nav item at rest |
| `bowling-alley/main-active` | Medium | 16 | 20 | Original | Main nav item, active |
| `bowling-alley/entity` | Regular | 14 | 16 | Original | Entity-level nav item |
| `bowling-alley/tabs-active` | Medium | 14 | 16 | Original | Record tabs, selected state |

### Primitives

The raw values text styles compose from. Listed for reference and traceability — apply text styles, not primitives.

#### Font size

A 10–104 scale. Product UI uses the lower end (10–24); the larger sizes exist for display contexts not currently used in text styles.

`10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104`

#### Line height

Matched to the size scale, extending to 112.

`12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112`

#### Letter spacing

`-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2`

Only `0` and `0.5` are used in current text styles — `0.5` on the uppercase input labels, `0` everywhere else.

#### Weight

`400 Regular, 500 Medium, 600 Semi Bold, 700 Bold, 800 Extrabold, 900 Black` — of which only 400, 500, and 600 are in use (see Weights are role-bound).

#### Text transform

`none, uppercase, capitalize, lowercase`

### Usage rules

- Apply the named text style, never the underlying size, weight, or line height. A component setting type properties directly is a defect — apply the role style instead.
- Choose the style by role, not by size. Use `title/sm` for a card title because it is a card title, not because 18px looks right.
- Do not vary weight by situation. Weight is bound to role: Regular for reading text, Medium for buttons and active states, Semi Bold for titles. No fourth weight.
- Use weight to carry selected state on tabs and navigation — Regular at rest, Medium active — rather than a color change alone.
- Keep the uppercase label styles for labels only; their 0.5 letter spacing is tuned for all-caps and should not be reused elsewhere.
- Pair `input/value/hyperlinks` with the link color token so linked values read as links by both weight and color.


