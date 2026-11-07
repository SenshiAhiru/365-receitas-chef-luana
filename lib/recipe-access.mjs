import { createHmac, timingSafeEqual, createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const limits = { essential: 365, complete: 500 };
const lifetime = 60 * 60 * 24 * 7;
const attempts = new Map();
const catalogs = new Map();
const files = {
  'pt-BR': new URL('../private/recipes.enc.json', import.meta.url),
  en: new URL('../private/recipes.en.enc.json', import.meta.url),
  es: new URL('../private/recipes.es.enc.json', import.meta.url)
};

function key() {
  const value = process.env.RECIPE_SECRET;
  if (!value || Buffer.from(value, 'base64').length !== 32) throw new Error('Recipe access is not configured');
  return Buffer.from(value, 'base64');
}
function signature(value) { return createHmac('sha256', key()).update(value).digest('base64url'); }
function equal(a, b) {
  const x = Buffer.from(a || ''), y = Buffer.from(b || '');
  return x.length === y.length && timingSafeEqual(x, y);
}
export function signSession(plan, now = Date.now()) {
  const body = Buffer.from(JSON.stringify({ plan, exp: Math.floor(now / 1000) + lifetime })).toString('base64url');
  return `${body}.${signature(body)}`;
}
export function session(request, now = Date.now()) {
  const token = (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith('m3s_session='))?.slice(12);
  if (!token) return null;
  const [body, sig, extra] = token.split('.');
  if (extra || !body || !sig || !equal(signature(body), sig)) return null;
  try {
    const value = JSON.parse(Buffer.from(body, 'base64url').toString());
    return limits[value.plan] && value.exp > now / 1000 ? value : null;
  } catch { return null; }
}
export function cookie(request, token, clear = false) {
  const secure = new URL(request.url).protocol === 'https:';
  return `m3s_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : lifetime}${secure ? '; Secure' : ''}`;
}
export function planForCode(code) {
  if (typeof code !== 'string' || code.length > 128) return null;
  const entered = code.trim();
  if (process.env.RECIPE_COMPLETE_CODE && equal(entered, process.env.RECIPE_COMPLETE_CODE)) return 'complete';
  if (process.env.RECIPE_ESSENTIAL_CODE && equal(entered, process.env.RECIPE_ESSENTIAL_CODE)) return 'essential';
  return null;
}
export function permittedOrigin(request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}
export function allowAttempt(request) {
  // Best-effort per-instance throttling; shared access codes are not individual buyer verification.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const record = attempts.get(ip) || { count: 0, until: now + 60000 };
  record.count++;
  attempts.set(ip, record);
  return record.count <= 12;
}
export function recipes(requestedLanguage = 'pt-BR') {
  const language = Object.hasOwn(files, requestedLanguage) ? requestedLanguage : 'pt-BR';
  if (!catalogs.has(language)) {
    const envelope = JSON.parse(readFileSync(files[language], 'utf8'));
    const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    catalogs.set(language, JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString('utf8')));
  }
  return catalogs.get(language);
}
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}
