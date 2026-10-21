---
name: "modern-ui-design-system"
description: "Authoritative reference for Bullhorn's Modern UI (Novo) design system — principles plus the color, spacing, elevation, and typography foundations with exact tokens and values. Use when designing, reviewing, evaluating, or writing content for the Modern UI, Novo, or Amplify, and to check work against the foundations and flag deviations."
---

# Modern UI design system

The source of truth for Bullhorn's redesigned visual foundation (Novo). Use it as authoritative reference when designing, reviewing, or producing anything for the Modern UI or Amplify — and to check work against the foundations, not just describe them.

## When to use
- Designing a new screen, component, flow, or UI for the Modern UI / Novo.
- Reviewing or critiquing an existing Modern UI design, mockup, or implementation.
- Writing or generating content, specs, or code that must match the design system.
- Any Amplify-related design (the Amplify color treatment lives in the color foundation).

## Enforce, don't just reference
When evaluating or producing work, actively check it against the foundations and flag every deviation, naming the rule it breaks and the correct token/value. Preserve nuance and anything marked "to be confirmed" — never flatten it or invent a value to fill a gap.

## Principles
Three principles drive the redesign: **clean** (calm, dense surfaces; separation from tonal borders and spacing, not heavy lines), **modern** (restraint reads as current; every interactive state is explicitly defined), **consistent** (choose by role, enforced in the system, not per-screen). Build depth in order: tonal layering and border color first, elevation level second.

## Color
Three-tier architecture: **primitives** (raw values, never bound directly) → **semantic tokens** (`color/[role]/[variant]`, the layer components bind to) → **component tokens** (rare). Test: if the primitive changed, the token should update automatically. A raw hex or primitive binding in a component is a defect.

Neutral scale (`color/gray/*`, cool near-neutral): 0 `#ffffff` · 50 `#fcfdfd` · 75 `#f7f8f8` · 100 `#ebedef` · 200 `#dee0e3` · 300 `#c2c5cb` · 400 `#9ba1a9` · 500 `#89909a` · 600 `#78808a` · 700 `#677079` · 750 `#525b63` · 800 `#3d464d` · 900 `#2f2f33`.

Status families (full 100–900 scales; base ~500): blue/positive `#296cc3`, green/success `#63a61b`, yellow/warning `#d89122`, red/negative `#c12535`. Use by meaning: negative=errors/destructive, warning=caution, success=completion, positive(blue)=informational/default emphasis. Never signal state with color alone — always pair with icon, text, or shape.

Key semantic tokens (bind to the name, never the hex):
- Text: headline `#2f2f33`, body `#3d464d`, secondary `#525b63`, subtle `#677079` (lightest safe for body copy), link `#296cc3`, disabled `#89909a` (below body target — disabled states only).
- Background: default `#ffffff`, subtle `#f7f8f8`, hover `#e6f1ff`, overlay `#2f2f33` @0.08.
- Border: subtle `#dee0e3`, default `#c2c5cb`, input `#89909a`, focus `#4a89dc` (aliases border/utility/positive — keep aliased).
- Icon mirrors the text hierarchy.
Contrast targets: 4.5:1 normal text, 3:1 large text / non-text UI (WCAG 2.2 AA).

Entity colors: per record-type accent, primitives only today (e.g. job `#bb5566`, candidate `#44bb77`, contact `#ffaa44`, company `#3399dd`, lead `#aa6699`, opportunity `#662255`, placement `#0b344f`). Known gap (to be confirmed): no semantic accent layer yet; components bind the primitive directly.

Amplify color — delivered as **paint styles, not variables**; reserved exclusively for Amplify/AI elements (a meaning cue, not decoration). Four applications, in Figma order:
- **Background**: translucent radial for Amplify container surfaces (`Background/Amplify Radial - Translucent`).
- **Border**: green-to-blue gradient border (`Border/Amplify Gradient`, `- Translucent`); can pair with the Amplify background on a container.
- **Button**: broad diagonal radial, stops `#37fc97 · #95f7d0 · #23afdc · #009bdf · #125783` (`Buttons/Amplify Radial`, `- Hover` = +`#2f2f33` @20%, `- Translucent`).
- **Icon**: concentrated radial glow, green core lower-left — NOT interchangeable with the button radial (`Icon/Amplify Radial`, `- Hover`, `- Translucent`). Stops `#37fc97,#66fab4,#95f7d0,#5cd3d6,#40c1d9,#23afdc,#12a5de,#009bdf,#0979b1,#125783`.
Do not rebuild, approximate, or apply the treatment to anything unrelated to Amplify.

## Spacing
An 8-based scale, applied through padding, gap, and layout tokens — never off-scale numbers. Steps: 0, 2, 4, 8, 16, 24, 32, 48 (and up). Choose the token, not a raw pixel value.

## Elevation
Depth = diffuse, low-alpha shadows placed by named **level**, chosen by where a surface sits in the page order (not by how much shadow looks right), reinforced by border color and tonal shifts. Levels: `general/level 1` (barely raised) · `level 2` (main focus area — headers, cards, workflow; `background/default`) · `level 2 - scroll` · `level 3` (above focus — left bowling alley) · `level 3 - right` (right slideout, Amplify chat) · `level 4` (overlays — dropdowns, modals). Button elevation: `button/default`, `-hover`, `-active`, `-active-no-container` (additive).
Radius aliases the spacing scale (`border/radius/xsm`=4 … `md`=16 … `round`=999 pill). Border width is a **state signal**, not depth: 1px default, 2px active/error. Never hand-build a shadow or invent an off-scale offset/alpha.

## Typography
One typeface: **Inter**, no display face. Weight is **role-bound** — Regular 400 (body/values/reading), Medium 500 (buttons, active/selected, emphasis), Semi Bold 600 (titles/headers). No fourth weight; never vary weight by situation. Apply a named text style chosen by role, never raw size/weight.
Roles: title default 24/32, md 20/28, sm 18/24 (title case, 600) · body lg 16/24, default 14/20 (workhorse), sm 12/16 (each with a Medium variant) · input labels uppercase +0.5 tracking, field-label sentence case · button lg/default/sm (500) · meta 12/14 & 10/12 · tabs/nav Regular→Medium to mark active. Carry selected state with weight, not color alone.

## Enforce checklist
1. Colors bind to semantic tokens (no primitives/raw hex); status used by meaning; no color-only state cues; Amplify treatment only on Amplify/AI, correct radial per element.
2. Spacing, radius on the 8-based scale via tokens.
3. Elevation chosen by named level; border width = state (1/2px), not depth.
4. Text uses a named style by role; weight role-bound; no ad-hoc size/weight.

The exhaustive per-token tables, full status/transparency scales, and edge cases live in the Modern UI design documentation site and in the shareable `modern-ui-design-system.skill` bundle (`reference/modern-ui-design-system.md`). Pull exact values from there when a detail isn't above; do not approximate.
