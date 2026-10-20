import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.gltf': 'model/gltf+json', '.json': 'application/json', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const base = pathname.startsWith('/vendor/') ? path.join(root, 'node_modules', 'three') : path.join(root, 'public');
    const relative = pathname.startsWith('/vendor/') ? pathname.slice(8) : pathname === '/' ? 'index.html' : pathname.slice(1);
    const target = path.resolve(base, relative);
    if (!target.startsWith(base + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(await readFile(target));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(5173, 'localhost', () => console.log('Nestle preview: http://localhost:5173'));
