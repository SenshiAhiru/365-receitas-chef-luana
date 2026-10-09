import { session, recipes, limits, json } from '../lib/recipe-access.mjs';
export function GET(request) {
  try {
    const current = session(request);
    if (!current) return json({ error: 'Entre para acessar suas receitas.' }, 401);
    const allowed = recipes().filter(recipe => recipe.id <= limits[current.plan]);
    const id = new URL(request.url).searchParams.get('id');
    if (id) {
      const recipe = allowed.find(recipe => String(recipe.id) === id);
      return recipe ? json(recipe) : json({ error: 'Receita indisponível neste plano.' }, 404);
    }
    return json({ plan: current.plan, count: allowed.length, recipes: allowed.map(({ ingredients, steps, tips, ...summary }) => summary) });
  } catch { return json({ error: 'Não foi possível carregar as receitas. Tente novamente.' }, 503); }
}
