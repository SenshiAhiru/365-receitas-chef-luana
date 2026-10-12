import { recipes, json } from '../lib/recipe-access.mjs';
import { session } from '../lib/cardapio-access.mjs';
import { makePlan } from '../lib/cardapio-plan.mjs';
let content;
export function GET(req){try{if(!session(req))return json({error:'Entre para consultar seu cardápio.'},401);content ||= makePlan(recipes());return json(content);}catch{return json({error:'Não foi possível carregar o planejamento. Tente novamente.'},503);}}
