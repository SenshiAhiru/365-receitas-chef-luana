import { json, permittedOrigin } from '../lib/recipe-access.mjs';
import { session, validCode, signSession, cookie, allowAttempt } from '../lib/cardapio-access.mjs';
export function GET(req) { try{return session(req)?json({ok:true}):json({error:'Entre com seu código de acesso.'},401);}catch{return json({error:'Acesso temporariamente indisponível.'},503);} }
export async function POST(req) {
 if(!permittedOrigin(req))return json({error:'Origem não autorizada.'},403);
 if(!allowAttempt(req))return json({error:'Aguarde um minuto antes de tentar novamente.'},429,{'Retry-After':'60'});
 try{const raw=await req.text();if(raw.length>1024)return json({error:'Código inválido.'},400);let data;try{data=JSON.parse(raw);}catch{return json({error:'Código inválido.'},400);}if(!validCode(data?.code))return json({error:'Código não reconhecido. Confira o acesso recebido após a compra.'},401);return json({ok:true},200,{'Set-Cookie':cookie(req,signSession())});}catch{return json({error:'Não foi possível entrar. Tente novamente.'},503);}
}
export function DELETE(req){if(!permittedOrigin(req))return json({error:'Origem não autorizada.'},403);return json({ok:true},200,{'Set-Cookie':cookie(req,'',true)});}
