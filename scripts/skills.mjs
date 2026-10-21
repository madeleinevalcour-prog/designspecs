// Packages every skills/<name>/ folder into skills/<name>.skill (a zip with <name>/ at its root).
//   node scripts/skills.mjs          → rebuild the .skill files that are out of date
//   node scripts/skills.mjs --check  → exit 1 if any .skill is missing or out of date (pre-commit)
// Output is deterministic (sorted entries, fixed timestamps), so an unchanged folder gives a
// byte-identical .skill and the check is a plain comparison. No npm dependencies on purpose.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { deflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../skills/", import.meta.url));
const check = process.argv.includes("--check");

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function files(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.name !== ".DS_Store")
    .flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
}

function zip(name) {
  const dir = join(root, name);
  const entries = files(dir).map((f) => ({ path: `${name}/${relative(dir, f).split(sep).join("/")}`, data: readFileSync(f) }))
    .sort((a, b) => (a.path < b.path ? -1 : 1));
  const DOS_TIME = 0, DOS_DATE = (2026 - 1980) << 9 | 1 << 5 | 1; // fixed: 2026-01-01 00:00
  const local = [], central = [];
  let offset = 0;
  for (const { path, data } of entries) {
    const nameBuf = Buffer.from(path, "utf8"), comp = deflateRawSync(data, { level: 9 }), crc = crc32(data);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(8, 8);
    h.writeUInt16LE(DOS_TIME, 10); h.writeUInt16LE(DOS_DATE, 12); h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(comp.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(nameBuf.length, 26);
    local.push(h, nameBuf, comp);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8);
    c.writeUInt16LE(8, 10); c.writeUInt16LE(DOS_TIME, 12); c.writeUInt16LE(DOS_DATE, 14); c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(comp.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nameBuf.length, 28);
    c.writeUInt32LE(offset, 42);
    central.push(c, nameBuf);
    offset += h.length + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}

const names = readdirSync(root).filter((n) => statSync(join(root, n)).isDirectory() && existsSync(join(root, n, "SKILL.md")));
const stale = [];
for (const name of names) {
  const out = join(root, `${name}.skill`), buf = zip(name);
  const same = existsSync(out) && Buffer.compare(readFileSync(out), buf) === 0;
  if (same) continue;
  stale.push(name);
  if (!check) writeFileSync(out, buf);
}
if (check && stale.length) {
  console.error(`skills: out of date: ${stale.join(", ")}. Run  npm run skills  and stage skills/*.skill`);
  process.exit(1);
}
console.log(stale.length ? `skills: ${check ? "stale" : "rebuilt"} ${stale.join(", ")}` : `skills: ${names.length} up to date`);
