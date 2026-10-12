// A culinary planning sequence, not a personalized nutritional prescription.
export function makePlan(catalog) {
 const base=catalog.filter(r=>r.id<=365);
 const breakfast=base.filter(r=>r.category==='cafe');
 const lunch=base.filter(r=>r.category==='refeicoes');
 const snack=base.filter(r=>['lanches','paes','doces'].includes(r.category));
 const soups=base.filter(r=>r.category==='cremes');
 const themes=['Comece com o simples','Organize sua despensa','Varie os preparos','Mais cor à mesa','Uma semana prática','Sabores para compartilhar','Retome seus favoritos','Explore novas combinações','Do mercado à cozinha','Preparo sem correria','Uma rotina com variedade','Seu jeito de cozinhar','Leve o hábito adiante'];
 const days=Array.from({length:90},(_,i)=>({day:i+1,week:Math.floor(i/7)+1,meals:{breakfast:breakfast[(i*7)%breakfast.length].id,lunch:lunch[(i*9)%lunch.length].id,snack:snack[(i*11)%snack.length].id,dinner:i%3===0?soups[(i*4)%soups.length].id:lunch[(i*9+23)%lunch.length].id}}));
 const pools={breakfast:breakfast.map(r=>r.id),lunch:lunch.map(r=>r.id),snack:snack.map(r=>r.id),dinner:[...lunch,...soups].map(r=>r.id)};
 const ids=new Set(Object.values(pools).flat());
 return {version:1,days,weeks:themes.map((title,i)=>({week:i+1,title,start:i*7+1,end:Math.min(90,(i+1)*7)})),pools,recipes:base.filter(r=>ids.has(r.id))};
}
