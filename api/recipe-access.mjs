import { session, cookie, signSession, planForCode, permittedOrigin, allowAttempt, limits, json } from '../lib/recipe-access.mjs';
export function GET(request) {
  try {
    const current = session(request);
    return current ? json({ plan: current.plan, count: limits[current.plan] }) : json({ error: 'Entre com seu código de acesso.' }, 401);
  } catch { return json({ error: 'O acesso está temporariamente indisponível. Tente novamente em instantes.' }, 503); }
}
export async function POST(request) {
  if (!permittedOrigin(request)) return json({ error: 'Origem não autorizada.' }, 403);
  if (!allowAttempt(request)) return json({ error: 'Muitas tentativas. Aguarde um minuto e tente novamente.' }, 429, { 'Retry-After': '60' });
  try {
    const raw = await request.text();
    if (raw.length > 1024) return json({ error: 'Código inválido.' }, 400);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: 'Código inválido.' }, 400); }
    const plan = planForCode(body.code);
    if (!plan) return json({ error: 'Esse código não foi reconhecido. Confira o código recebido após a compra.' }, 401);
    return json({ plan, count: limits[plan] }, 200, { 'Set-Cookie': cookie(request, signSession(plan)) });
  } catch { return json({ error: 'Não foi possível entrar agora. Tente novamente em instantes.' }, 503); }
}
export function DELETE(request) {
  if (!permittedOrigin(request)) return json({ error: 'Origem não autorizada.' }, 403);
  return json({ ok: true }, 200, { 'Set-Cookie': cookie(request, '', true) });
}
