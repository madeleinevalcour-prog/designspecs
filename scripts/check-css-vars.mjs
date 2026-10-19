// Fails if any CSS custom property is used (var(--x)) but defined nowhere it can come from.
//   npm run check
// Catches token renames that a component or a generated prototype wasn't updated for —
// an undefined var() drops the property silently (no padding, border, gap…).
// Scopes, each checked on its own:
//   - every docs-site/prototypes/*/index.html (self-contained: tokens + component CSS inlined)
//   - the ats-ui library: tokens/css + components/projects/ats-ui/src/lib (css, ts, html)
// A name counts as defined if it's declared (`--x:`) or set from script (setProperty('--x', …),
// [style.--x] bindings). var(--prefix-${…}) names built at runtime are skipped.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const walk = (dir, exts) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return walk(p, exts);
    return exts.some((e) => n.endsWith(e)) ? [p] : [];
  });

const DEF = [/(--[\w-]+)\s*:/g, /setProperty\(\s*['"`](--[\w-]+)/g, /style\.(--[\w-]+)/g];
const USE = /var\(\s*(--[\w-]+)/g;

function check(label, files) {
  const defined = new Set();
  const used = new Map(); // name → first file
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const re of DEF) for (const m of text.matchAll(re)) defined.add(m[1]);
    for (const m of text.matchAll(USE)) {
      const name = m[1];
      if (name.endsWith('-')) continue; // var(--color-entity-${x}) — built at runtime
      if (!used.has(name)) used.set(name, relative(root, f));
    }
  }
  const missing = [...used].filter(([n]) => !defined.has(n));
  if (missing.length) {
    console.error(`✗ ${label}: ${missing.length} undefined CSS variable(s)`);
    for (const [n, f] of missing.slice(0, 40)) console.error(`    ${n}   (${f})`);
    if (missing.length > 40) console.error(`    … and ${missing.length - 40} more`);
  } else console.log(`✓ ${label}`);
  return missing.length;
}

let failures = 0;

const protoDir = join(root, 'docs-site/prototypes');
if (existsSync(protoDir)) {
  for (const name of readdirSync(protoDir)) {
    const f = join(protoDir, name, 'index.html');
    if (existsSync(f)) failures += check(`prototype ${name}`, [f]);
  }
}

failures += check('ats-ui library + tokens', [
  ...walk(join(root, 'tokens/css'), ['.css']),
  ...walk(join(root, 'components/projects/ats-ui/src/lib'), ['.css', '.ts', '.html']),
]);

if (failures) {
  console.error('\nA token was probably renamed. Point the references at the new name; for prototypes, re-run `npm run prototypes` (never edit their generated index.html).');
  process.exit(1);
}
