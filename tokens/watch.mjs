// Watch the token-source JSONs and rebuild the CSS layers on change, so the only
// step after editing tokens is re-exporting/overwriting the JSON — no command.
//   npm run tokens:watch   (leave running alongside `npm start`)
// Watches the tokens/ folder (not the files directly) so it survives file replacement
// from a drag-and-drop / atomic export.
import { watch } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const repoRoot = dirname(fileURLToPath(import.meta.url)); // tokens/
const SOURCES = new Set(['subatomic.json', 'component-migration.json']);

const build = () => spawnSync('node', ['build.mjs'], { cwd: repoRoot, stdio: 'inherit' });

let timer;
watch(repoRoot, (_evt, filename) => {
  if (!SOURCES.has(filename)) return;
  clearTimeout(timer);
  timer = setTimeout(() => { console.log(`\n↻ ${filename} changed — rebuilding tokens…`); build(); }, 150);
});

build();
console.log('👀 watching subatomic.json + component-migration.json — re-export to rebuild. Ctrl+C to stop.');
