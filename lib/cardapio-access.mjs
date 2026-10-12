import { createHmac, timingSafeEqual } from 'node:crypto';
const lifetime = 7 * 86400;
const attempts = new Map();
function secret() {
 const value = process.env.RECIPE_SECRET;
 if (!value || Buffer.from(value, 'base64').length !== 32) throw Error('Access unavailable');
 return Buffer.from(value, 'base64');
}
function signature(value) { return createHmac('sha256', secret()).update('cardapio:' + value).digest('base64url'); }
function equal(a,b) { const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y); }
export function validCode(code) { return typeof code==='string' && code.length<=128 && !!process.env.CARDAPIO_ACCESS_CODE && equal(code.trim(),process.env.CARDAPIO_ACCESS_CODE); }
export function signSession(now=Date.now()) { const body=Buffer.from(JSON.stringify({aud:'cardapio',exp:Math.floor(now/1000)+lifetime})).toString('base64url');return body+'.'+signature(body); }
export function session(req,now=Date.now()) {
 const token=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('m3s_cardapio='))?.slice(13);
 if(!token)return null;const [body,sig,extra]=token.split('.');if(!body||!sig||extra||!equal(signature(body),sig))return null;
 try{const v=JSON.parse(Buffer.from(body,'base64url'));return v.aud==='cardapio'&&v.exp>now/1000?v:null;}catch{return null;}
}
export function cookie(req,token,clear=false) { return `m3s_cardapio=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear?0:lifetime}${new URL(req.url).protocol==='https:'?'; Secure':''}`; }
export function allowAttempt(req) { const now=Date.now();for(const [k,v]of attempts)if(v.until<now)attempts.delete(k);const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'local';const r=attempts.get(ip)||{count:0,until:now+60000};r.count++;attempts.set(ip,r);return r.count<=12; }
