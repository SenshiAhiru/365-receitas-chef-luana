import { readFile, writeFile } from 'node:fs/promises';

const photos = JSON.parse(await readFile('public/receitas/photos/credits.json', 'utf8'));
const recipes = JSON.parse(await readFile('private-source/recipes.json', 'utf8'));

function soupPhoto(title) {
  if (/abóbora|mandioquinha|batata-doce/.test(title)) return 'pumpkinsoup';
  if (/cenoura/.test(title)) return 'carrotsoup';
  if (/abobrinha|brócolis|espinafre|ervilha/.test(title)) return 'greensoup';
  if (/beterraba/.test(title)) return 'beetsoup';
  if (/tomate/.test(title)) return 'tomatosoup';
  if (/milho/.test(title)) return 'cornsoup';
  if (/cogumelo/.test(title)) return 'mushroomsoup';
  return 'whitesoup';
}
function photoKey(recipe) {
  const t = recipe.title;
  if (recipe.category === 'cremes') {
    if (t.startsWith('Sopa de lentilha')) return 'lentilsoup';
    if (t.startsWith('Creme de feijão-branco')) return 'beansoup';
    return soupPhoto(t);
  }
  if (recipe.category === 'bebidas') {
    if (/cacau/.test(t)) return 'smoothiechocolate';
    if (/morango/.test(t)) return 'smoothieberry';
    if (/manga|mamão|pêssego/.test(t)) return 'smoothiemango';
    if (/abacaxi/.test(t)) return 'smoothiegreen';
    return 'smoothiebanana';
  }
  const mapping = [
    ['Mingau','porridge'], ['Aveia de geladeira','overnight'], ['Panquequinha','pancakes'], ['Quinoa cremosa','quinoa'], ['Tapioca','tapioca'],
    ['Pão caseiro','bread'], ['Pãozinho','breadroll'], ['Crepioca','crepioca'], ['Pão de frigideira','socca'], ['Muffin salgado','savorymuffin'], ['Panqueca salgada','savorypancake'],
    ['Arroz de forno','bakedrice'], ['Bowl de quinoa','quinoabowl'], ['Escondidinho','shepherd'], ['Polenta','polenta'], ['Arroz de frigideira','friedrice'], ['Lasanha','lasagna'], ['Torta salgada','chickenpie'],
    ['Bolinho assado','potato'], ['Croquete','lentilpatty'], ['Batata-doce recheada','sweetpotato'], ['Barquinhas','lettucewrap'], ['Omelete','frittata'], ['Cookies','cookie'],
    ['Bolo de cenoura','carrotcake'], ['Brownie','brownie'], ['Docinho','chocolateballs'], ['Muffin','muffin'], ['Crumble','crumble'], ['Creme','custard'], ['Pudim de chia','chia'], ['Gelado','nicecream'],
    ['Homus','hummus'], ['Patê','beanpaste'], ['Molho de tofu','tofusauce'], ['Vinagrete','vinaigrette'], ['Purê','mash'],
  ];
  return mapping.find(([prefix]) => t.startsWith(prefix))?.[1];
}
for (const recipe of recipes) {
  const key = photoKey(recipe), photo = photos[key];
  if (!photo) throw new Error(`Missing equivalent photo for ${recipe.id}: ${recipe.title} (${key})`);
  recipe.image = photo.path;
  if (photo.author) recipe.imageCredit = { key, author: photo.author, source: photo.source, license: photo.license, licenseUrl: photo.licenseUrl };
  else delete recipe.imageCredit;
}
await writeFile('private-source/recipes.json', JSON.stringify(recipes, null, 2));
console.log(`Mapped ${recipes.length} recipes to ${new Set(recipes.map(r => r.image)).size} equivalent food photos.`);
