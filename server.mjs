import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
try { process.loadEnvFile('.env.local'); } catch {}
const access = await import('./api/recipe-access.mjs');
const recipes = await import('./api/recipes.mjs');
const root = path.resolve('public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/api/recipe-access' || pathname === '/api/recipes') {
    const handler = (pathname === '/api/recipe-access' ? access : recipes)[req.method];
    if (!handler) { res.writeHead(405).end(); return; }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, ...(chunks.length ? { body: Buffer.concat(chunks) } : {}) });
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  const route = pathname === '/' ? '/index.html' : ['/receitas','/receitas/'].includes(pathname) ? '/receitas/index.html' : pathname;
  const file = path.resolve(root, '.' + route);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(content);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4187, '127.0.0.1', () => console.log('http://127.0.0.1:4187'));
