// Convert Figma "Variables Import/Export" JSON (DTCG-style, with $type/$value/
// $scopes and {dot.path} aliases) into layered CSS custom properties.
//
// Usage:  node tokens/build.mjs [subatomic.json] [component-migration.json]   (paths relative to tokens/)
//
// Output (3 live layers; aliases kept as var() so the whole chain stays live —
// change a primitive and everything downstream re-resolves):
//   css/primitives.css  <- subatomic collections "core" + "Tier 1 | base values"
//   css/semantic.css     <- subatomic collection  "Tier 2 | semantic tokens"
//   css/components.css   <- component-migration (Tier 3 | component tokens)
//
// GRAYSCALE MODES: the "core" collection ships multiple modes (default, warm,
// bh-orange, bh-blue). Only the gray / charcoal families differ between them.
// The default mode is emitted on :root; each other mode is emitted as a
// `:root[data-core-mode="<mode>"]` override containing ONLY the vars that differ.
// Set data-core-mode on <html> to switch grayscale — because the semantic and
// component tokens are declared on :root and alias the gray primitives via var(),
// overriding the primitives at :root re-resolves the entire chain.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = __dirname; // tokens/ — JSON inputs live here, CSS goes to tokens/css/

const PRIMITIVE_COLLECTIONS = ['core', 'Tier 1  |  base values'];
const SEMANTIC_COLLECTIONS = ['Tier 2  |  semantic tokens'];
const MULTIMODE_COLLECTION = 'core';   // the collection whose modes we expose as toggles
const BASE_MODE = 'default';           // mode emitted on :root

// Normalise a token path into a CSS var name. Applied identically to definitions
// AND alias targets so they always match.
function toVar(path) {
  const slug = path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `--${slug}`;
}

// Flatten a mode tree into [{ path, type, value, scopes }] leaves.
function flatten(node, prefix, out) {
  for (const key of Object.keys(node)) {
    const v = node[key];
    if (!v || typeof v !== 'object') continue;
    const path = prefix ? `${prefix}/${key}` : key;
    if ('$value' in v) out.push({ path, type: v.$type, value: v.$value, scopes: v.$scopes || [] });
    else flatten(v, path, out);
  }
  return out;
}

// Return { name, modes: { <modeName>: leaves[] } } for a collection object.
function collectionModes(collectionObj) {
  const name = Object.keys(collectionObj)[0];
  const modes = collectionObj[name].modes;
  const byMode = {};
  for (const modeName of Object.keys(modes)) byMode[modeName] = flatten(modes[modeName], '', []);
  return { name, modes: byMode };
}

// Convert a token's $value into a CSS value string (aliases -> var()).
function toCssValue(token) {
  const { type, value, scopes } = token;
  if (typeof value === 'string') {
    const m = value.match(/^\{(.+)\}$/);
    if (m) return `var(${toVar(m[1].replace(/\./g, '/'))})`;
  }
  if (type === 'color') return String(value);
  if (type === 'float') return scopes.includes('FONT_WEIGHT') ? String(value) : `${value}px`;
  return String(value);
}

function emit(records) {
  const lines = [];
  let lastTop = null;
  for (const r of records) {
    const top = r.path.split('/')[0];
    if (top !== lastTop) { lines.push(`${lastTop === null ? '' : '\n'}  /* ${top} */`); lastTop = top; }
    lines.push(`  ${toVar(r.path)}: ${r.css};`);
  }
  return lines.join('\n');
}

const withCss = (leaves) => leaves.map((t) => ({ ...t, css: toCssValue(t) }));

// ---- load ----
const subatomicArg = process.argv[2] || 'subatomic.json';
const componentsArg = process.argv[3] || 'component-migration.json';
const subatomic = JSON.parse(readFileSync(resolve(repoRoot, subatomicArg), 'utf8'));

const byCollection = {};
for (const c of subatomic) byCollection[collectionModes(c).name] = collectionModes(c);

// ---- primitives (core[default] + Tier 1) + grayscale-mode overrides ----
function gatherBase(collectionNames) {
  const recs = [];
  for (const name of collectionNames) {
    const col = byCollection[name];
    if (!col) { console.warn(`⚠️  collection not found: "${name}"`); continue; }
    const mode = col.modes[BASE_MODE] || col.modes[Object.keys(col.modes)[0]];
    recs.push(...withCss(mode));
  }
  return recs;
}
const primitives = gatherBase(PRIMITIVE_COLLECTIONS);

// SHIMS: aliases the export references but doesn't define as a resolvable variable
// (white lives only under a deprecated path in this export). White is mode-invariant,
// so defining it here is safe and keeps the ~8 downstream white-background tokens live.
const SHIMS = [{ path: 'color/grayscale/white', type: 'color', value: '#ffffff', scopes: [] }];
primitives.push(...withCss(SHIMS));

// per-mode overrides for the multimode collection: only leaves that differ from BASE_MODE
const core = byCollection[MULTIMODE_COLLECTION];
const baseLeaves = withCss(core.modes[BASE_MODE]);
const baseCss = new Map(baseLeaves.map((r) => [r.path, r.css]));
const modeOverrides = Object.keys(core.modes)
  .filter((m) => m !== BASE_MODE)
  .map((m) => ({
    mode: m,
    recs: withCss(core.modes[m]).filter((r) => baseCss.get(r.path) !== r.css),
  }));

// ---- semantic (Tier 2) ----
function gatherSingle(collectionNames) {
  const recs = [];
  for (const name of collectionNames) {
    const col = byCollection[name];
    if (!col) { console.warn(`⚠️  collection not found: "${name}"`); continue; }
    recs.push(...withCss(col.modes[Object.keys(col.modes)[0]]));
  }
  return recs;
}
const semantic = gatherSingle(SEMANTIC_COLLECTIONS);

// ---- components (Tier 3) from the component-migration export ----
let components = [];
if (existsSync(resolve(repoRoot, componentsArg))) {
  const cm = JSON.parse(readFileSync(resolve(repoRoot, componentsArg), 'utf8'));
  for (const c of cm) components.push(...withCss(collectionModes(c).modes[Object.keys(collectionModes(c).modes)[0]]));
} else {
  console.warn(`⚠️  component-migration file not found: "${componentsArg}" — skipping Tier 3`);
}

// ---- token reconciliation (manual — reviewed with the design owner) --------------
// The export sometimes ships component tokens that alias variables which have since
// been DELETED upstream, or that point at the wrong variable. We reconcile here rather
// than in the generated CSS (which is overwritten every build). These rules are
// self-neutralising: once the same fix lands in Figma, the matching token/alias simply
// won't appear (DROP) or will already be correct (REMAP), so the rule becomes a no-op.
//
// DROP_TARGETS: alias targets confirmed deleted upstream. Any token whose value is just
// an alias to one of these is dropped (it has no real value left). Confirm with the
// design owner before adding a name here.
const DROP_TARGETS = new Set([
  '--color-do-not-use-deprecated-grayscale-white',
  '--color-do-not-use-deprecated-lightest-blue',
  '--button-color-base-border-default',
]);
// REMAP: repoint a component token's alias to a still-existing variable (by var name).
const REMAP = {
  '--list-color-border-default': '--color-border-default',        // was → (removed) dropdown-container border
  '--list-border-width-default': '--border-width-border-default', // was → a color token (dropdown-container); should be a width
};
// NOTE kept intentionally dangling until built: --dropdown-container-color-border-default
// (the dropdown component is coming; its tokens will define it).

for (const r of components) {
  const v = toVar(r.path);
  if (REMAP[v]) r.css = `var(${REMAP[v]})`;
}
const dropped = [];
components = components.filter((r) => {
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(r.css);
  if (m && DROP_TARGETS.has(m[1])) { dropped.push(`${r.path} -> ${m[1]}`); return false; }
  return true;
});
if (dropped.length) {
  console.warn(`🗑️  reconciliation: dropped ${dropped.length} token(s) aliasing deleted targets:`);
  dropped.forEach((d) => console.warn('   ', d));
}

// ---- validate alias targets resolve somewhere ----
const defined = new Set([...primitives, ...semantic, ...components,
  ...modeOverrides.flatMap((o) => o.recs)].map((r) => toVar(r.path)));
const unresolved = [];
for (const r of [...primitives, ...semantic, ...components]) {
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(r.css);
  if (m && !defined.has(m[1])) unresolved.push(`${r.path} -> ${m[1]}`);
}
if (unresolved.length) {
  console.warn(`⚠️  ${unresolved.length} unresolved alias(es) (ok if they point at deprecated/not-current tokens):`);
  unresolved.slice(0, 15).forEach((u) => console.warn('   ', u));
}

const header = (title, source, note) =>
  `/* =====================================================================
   ${title}
   AUTO-GENERATED from ${source} by scripts/build-tokens.mjs — do not edit by hand.
   ${note}
   ===================================================================== */\n`;

// primitives.css = base :root + one override block per non-default grayscale mode
const modeBlocks = modeOverrides
  .map((o) => `\n/* grayscale mode: ${o.mode} — toggle with <html data-core-mode="${o.mode}"> */\n:root[data-core-mode="${o.mode}"] {\n${emit(o.recs)}\n}\n`)
  .join('');
writeFileSync(
  resolve(repoRoot, 'css/primitives.css'),
  `${header('LAYER 1 — PRIMITIVES (core + Tier 1 base values)', subatomicArg, 'Raw values + grayscale modes. Reference these only via the semantic layer.')}:root {\n${emit(primitives)}\n}\n${modeBlocks}`
);
writeFileSync(
  resolve(repoRoot, 'css/semantic.css'),
  `${header('LAYER 2 — SEMANTIC TOKENS (Tier 2)', subatomicArg, 'Intent-based tokens; alias into primitives. Components/screens author against these or Tier 3.')}:root {\n${emit(semantic)}\n}\n`
);
writeFileSync(
  resolve(repoRoot, 'css/components.css'),
  `${header('LAYER 3 — COMPONENT TOKENS (Tier 3)', componentsArg, 'Per-component tokens; alias into semantic (Tier 2). New prototypes author against these.')}:root {\n${emit(components)}\n}\n`
);

console.log(`✅ primitives: ${primitives.length} tokens + ${modeOverrides.length} grayscale mode(s) [${modeOverrides.map((o) => o.mode).join(', ')}] → css/primitives.css`);
console.log(`✅ semantic:   ${semantic.length} tokens → css/semantic.css`);
console.log(`✅ components: ${components.length} tokens → css/components.css`);
