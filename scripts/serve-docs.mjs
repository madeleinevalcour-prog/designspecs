// Local static server for docs-site/ — mirrors vercel.json: /examples/* falls
// back to the Angular showcase's index.html so deep links work.
//   npm run docs   (builds the examples first)   ·   PORT=4400 by default
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../docs-site');
const port = Number(process.env.PORT ?? 4400);
const types = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json', '.md': 'text/markdown',
};

async function resolveFile(urlPath) {
  const file = join(root, normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, ''));
  try {
    const s = await stat(file);
    return s.isDirectory() ? join(file, 'index.html') : file;
  } catch {
    return urlPath.startsWith('/examples/') ? join(root, 'examples/index.html') : null;
  }
}

createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url, 'http://x').pathname);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`Docs at http://localhost:${port}/`));
