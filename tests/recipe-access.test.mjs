import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
try { process.loadEnvFile('.env.local'); } catch {}
process.env.RECIPE_SECRET ||= randomBytes(32).toString('base64');
process.env.RECIPE_ESSENTIAL_CODE = 'test-basic-code';
process.env.RECIPE_COMPLETE_CODE = 'test-complete-code';
const { GET: getAccess, POST: login, DELETE: logout } = await import('../api/recipe-access.mjs');
const { GET: getRecipes } = await import('../api/recipes.mjs');
const { signSession, recipes } = await import('../lib/recipe-access.mjs');
const request = (url, cookie = '') => new Request('https://example.com' + url, { headers: { cookie } });
const authenticate = code => login(new Request('https://example.com/api/recipe-access', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.com' }, body: JSON.stringify({ code }) }));

test('Anonymous visitors cannot fetch catalog or individual recipes', async () => {
 assert.equal(getRecipes(request('/api/recipes')).status,401);
 assert.equal(getRecipes(request('/api/recipes?id=500')).status,401);
});
test('Wrong code and cross-origin login fail', async () => {
 assert.equal((await authenticate('invalid')).status,401);
 const response = await login(new Request('https://example.com/api/recipe-access',{method:'POST',headers:{Origin:'https://other.example'},body:JSON.stringify({code:'test-complete-code'})}));
 assert.equal(response.status,403);
});
test('Session is HttpOnly, Secure, signed and expires', async () => {
 const response = await authenticate('test-basic-code');
 const cookie = response.headers.get('set-cookie');
 assert.equal(response.status,200);
 for(const value of ['HttpOnly','Secure','SameSite=Lax']) assert.ok(cookie.includes(value));
 assert.equal(getAccess(request('/api/recipe-access',cookie)).status,200);
 const token=signSession('complete'); const tampered=token.slice(0,-1)+(token.endsWith('a')?'b':'a');
 assert.equal(getAccess(request('/api/recipe-access',`m3s_session=${tampered}`)).status,401);
 const expired=signSession('complete',Date.now()-8*86400000);
 assert.equal(getAccess(request('/api/recipe-access',`m3s_session=${expired}`)).status,401);
});
test('Logout removes session and rejects cross-origin requests', () => {
 assert.ok(logout(request('/api/recipe-access')).headers.get('set-cookie').includes('Max-Age=0'));
 assert.equal(logout(new Request('https://example.com/api/recipe-access',{method:'DELETE',headers:{Origin:'https://bad.example'}})).status,403);
});
test('Essential plan receives 365 summaries and cannot access any premium detail', async () => {
 const cookie=(await authenticate('test-basic-code')).headers.get('set-cookie');
 const response=getRecipes(request('/api/recipes',cookie));assert.equal(response.status,200);
 const body=await response.json();assert.equal(body.recipes.length,365);
 assert.ok(body.recipes.every(r=>r.id<=365&&!r.ingredients&&!r.steps));
 for(let id=366;id<=500;id++)assert.equal(getRecipes(request(`/api/recipes?id=${id}`,cookie)).status,404);
 assert.equal(getRecipes(request('/api/recipes?id=1',cookie)).status,200);
});
test('Complete plan has exactly 500 unique fully specified recipes', async () => {
 const cookie=(await authenticate('test-complete-code')).headers.get('set-cookie');
 const response=getRecipes(request('/api/recipes',cookie));assert.equal(response.status,200);
 assert.equal((await response.json()).recipes.length,500);
 const all=recipes();assert.equal(new Set(all.map(r=>r.title)).size,500);
 for(const r of all){
  assert.ok(r.ingredients.length>=3&&r.steps.length>=3&&r.tips.length>=1,r.title);
  assert.ok(r.time>0&&r.servings>0,r.title);
  assert.ok(r.ingredients.every(i=>Number.isFinite(i.amount)&&i.amount>0),r.title);
  assert.ok(!r.ingredients.some(i=>/farinha de trigo|leite de vaca|melado|açúcar refinado/i.test(i.name)),r.title);
  assert.ok(readFileSync('public'+r.image).length>0,r.image);
  assert.match(r.image, /\.(jpg|png|webp)$/i, 'Every recipe has a food photo');
  if (r.image.startsWith('/receitas/photos/')) {
   assert.ok(r.imageCredit?.author && r.imageCredit?.license, r.image);
   assert.ok(r.imageCredit.source.startsWith('https://'), r.image);
  }
 }
 assert.equal(getRecipes(request('/api/recipes?id=500',cookie)).status,200);
});
