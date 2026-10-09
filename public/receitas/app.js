const $ = (selector, root = document) => root.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  leaf: '<path d="M20 3C8 2 1 8 5 16s16 2 15-13ZM5 20 16 9"/>',
  book: '<path d="M12 5C9 2 4 3 3 4v16c3-2 6-2 9 0 3-2 6-2 9 0V4c-3-2-6-2-9 1v15"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  pot: '<path d="M4 10h16l-2 10H6L4 10ZM2 10h20M8 6V3m4 3V2m4 4V3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  cup: '<path d="M4 7h12v8a5 5 0 0 1-10 0L4 7Zm12 1h2a3 3 0 0 1 0 6h-2M3 22h16M7 2v2m5-2v2"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`; }
const categories = [
  { id: 'cafe', title: 'Café da manhã', icon: 'sun' }, { id: 'paes', title: 'Pães e massas', icon: 'book' },
  { id: 'refeicoes', title: 'Almoço e jantar', icon: 'pot' }, { id: 'lanches', title: 'Lanches e salgados', icon: 'cup' },
  { id: 'doces', title: 'Bolos e sobremesas', icon: 'heart' }, { id: 'cremes', title: 'Sopas e cremes', icon: 'pot' },
  { id: 'molhos', title: 'Molhos e acompanhamentos', icon: 'leaf' }, { id: 'bebidas', title: 'Bebidas', icon: 'cup' },
];
const category = id => categories.find(item => item.id === id);
function stored(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function persist(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { toast('Seu navegador não permitiu salvar neste aparelho.'); } }
const state = { session: null, recipes: [], page: 'home', filter: '', query: '', quick: false, sort: 'default', visible: 24, favorites: new Set(stored('m3s-favorites', [])), shopping: stored('m3s-shopping', []), detail: null, factor: 1, cookStep: 0 };
const app = $('#app'), dialog = $('#recipe-dialog'), info = $('#info-dialog');
let toastTimer, detailRequest = 0, installPrompt;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000); }
function brand() { return `<a class="brand" href="/receitas" aria-label="Método 3S, início"><span class="brand-mark">3s<span>✳</span></span><span class="brand-copy">MÉTODO 3S<small>SABOR SEM SACRIFÍCIOS</small></span></a>`; }
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  let result;
  try { result = await response.json(); } catch { throw new Error('Não foi possível conectar. Tente novamente.'); }
  if (!response.ok) { const error = new Error(result.error || 'Não foi possível completar a ação.'); error.status = response.status; throw error; }
  return result;
}
function showLogin(message = '') {
  app.innerHTML = `<main class="login"><section class="login-story">${brand()}<h1>Uma cozinha cheia de <em>possibilidades.</em></h1><p>Receitas para os seus dias. Mais variedade, mais prazer em preparar.</p><div class="login-chips"><span>Sem glúten</span><span>Sem lactose</span><span>Sem adição de açúcar</span></div><img class="login-picture" src="/assets/9XqdBay.png" alt="Bolo de cenoura — imagem ilustrativa"></section><section class="login-form-wrap">${brand()}<span class="pill">${icon('leaf')} SUA ÁREA DE RECEITAS</span><h2>Que bom ter você aqui.</h2><p>Entre na sua cozinha e descubra o que vamos preparar hoje.</p><form id="login-form"><label for="access-code">Seu código de acesso</label><div class="code-input"><input id="access-code" name="code" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" maxlength="128" placeholder="Código recebido após a compra" required aria-describedby="login-error"><button class="icon-btn" type="button" data-action="toggle-code" aria-label="Mostrar código">${icon('eye')}</button></div><p id="login-error" class="error-text" role="alert">${escape(message)}</p><button class="primary" type="submit">Entrar na minha cozinha ${icon('arrow')}</button></form><div class="login-help">${icon('lock')} Acesso exclusivo para compradores</div><p class="login-foot">Não encontrou seu código? Confira as instruções recebidas na plataforma após a compra.<br><a href="/">Conhecer o Método 3S</a> · <button class="text-btn" data-action="guide">Antes de cozinhar</button></p></section></main>`;
  $('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = $('button[type="submit"]', event.target);
    button.disabled = true; button.textContent = 'Entrando…'; $('#login-error').textContent = '';
    try { state.session = await api('/api/recipe-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: $('#access-code').value }) }); await loadCatalog(); }
    catch (error) { $('#login-error').textContent = error.message; button.disabled = false; button.innerHTML = `Entrar na minha cozinha ${icon('arrow')}`; }
  });
}
async function loadCatalog() {
  const data = await api('/api/recipes');
  state.recipes = data.recipes;
  state.session = { plan: data.plan, count: data.count };
  state.page = 'home'; state.query = ''; state.filter = ''; render();
}
function header() { return `<header class="topbar">${brand()}<div class="topbar-right"><span class="pill">${icon('spark')} ${state.session.plan === 'complete' ? 'Completo' : 'Essencial'} · ${state.session.count}</span><button class="icon-btn" data-page="account" aria-label="Minha conta">${icon('user')}</button></div></header>`; }
function nav() { return `<nav class="bottom-nav" aria-label="Navegação principal">${[['home','home','Início'],['categories','grid','Categorias'],['favorites','heart','Favoritas'],['shopping','bag','Compras'],['account','user','Minha área']].map(([page, symbol, label]) => `<button class="nav-item ${state.page === page || (page === 'categories' && state.page === 'catalog') ? 'active' : ''}" data-page="${page}" ${state.page === page ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span></button>`).join('')}</nav>`; }
function search() { return `<label class="search">${icon('search')}<input id="search" type="search" placeholder="O que você quer preparar?" aria-label="Buscar receitas por nome ou ingrediente" value="${escape(state.query)}"></label>`; }
function chips() { return `<div class="categories-strip" aria-label="Filtrar categoria"><button class="category-chip ${!state.filter ? 'active' : ''}" data-category="" aria-pressed="${!state.filter}">${icon('grid')} Todas</button>${categories.map(c => `<button class="category-chip ${state.filter === c.id ? 'active' : ''}" data-category="${c.id}" aria-pressed="${state.filter === c.id}">${icon(c.icon)} ${c.title}</button>`).join('')}</div>`; }
function cards(recipes) { return recipes.map(recipe => `<article class="recipe-card"><button class="recipe-open" data-recipe="${recipe.id}" aria-label="Abrir ${escape(recipe.title)}"><div class="recipe-image"><img src="${escape(recipe.image)}" alt="Ilustração de ${escape(category(recipe.category).title)}" loading="lazy" width="400" height="300">${recipe.id > 365 ? '<span class="extra-badge">COMPLETO</span>' : ''}</div><div class="recipe-copy"><div class="eyebrow">${category(recipe.category).title}</div><h3>${escape(recipe.title)}</h3><div class="recipe-meta"><span>${icon('clock')} ${recipe.time} min</span><span>${icon('pot')} ${recipe.servings} ${recipe.servings === 1 ? "porção" : "porções"}</span></div></div></button><button class="icon-btn save ${state.favorites.has(recipe.id) ? 'saved' : ''}" data-save="${recipe.id}" aria-label="${state.favorites.has(recipe.id) ? 'Remover dos favoritos' : 'Salvar receita'}: ${escape(recipe.title)}" aria-pressed="${state.favorites.has(recipe.id)}">${icon('heart')}</button></article>`).join(''); }
function empty(title, text, symbol = 'search') { return `<div class="empty">${icon(symbol)}<h2>${title}</h2><p>${text}</p><button class="secondary" data-page="catalog">Explorar receitas</button></div>`; }
const fold = text => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function filtered() {
  let list = state.recipes.filter(recipe => (!state.filter || recipe.category === state.filter) && (!state.quick || recipe.time <= 30) && (!state.query || fold(recipe.title + ' ' + recipe.keywords).includes(fold(state.query))) && (state.page !== 'favorites' || state.favorites.has(recipe.id)));
  if (state.sort === 'time') list.sort((a, b) => a.time - b.time);
  if (state.sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  return list;
}
function results() {
  const list = filtered();
  return `<div class="filters"><select id="sort" aria-label="Ordenar receitas"><option value="default" ${state.sort === 'default' ? 'selected' : ''}>Seleção 3S</option><option value="time" ${state.sort === 'time' ? 'selected' : ''}>Mais rápidas</option><option value="az" ${state.sort === 'az' ? 'selected' : ''}>De A a Z</option></select><button class="category-chip ${state.quick ? 'active' : ''}" data-action="quick" aria-pressed="${state.quick}">${icon('clock')} Até 30 min</button><span class="result-count" aria-live="polite">${list.length} receitas encontradas</span></div>${list.length ? `<div class="recipe-grid">${cards(list.slice(0, state.visible))}</div>${list.length > state.visible ? '<div class="load-more"><button class="secondary" data-action="more">Ver mais receitas</button></div>' : ''}` : empty('Ainda não encontramos.', 'Tente outro ingrediente ou retire um filtro.')}`;
}
function home() {
  const featured = state.recipes.find(r => r.featured) || state.recipes[0];
  const picks = state.recipes.filter(r => r.featured).slice(0, 6);
  return `<div class="greeting"><p>SUA COZINHA, DO SEU JEITO</p><h1>Hoje é um bom dia<br>para <em>comer bem.</em></h1></div>${search()}<div id="home-main">${state.query ? results() : `<section class="hero"><div class="hero-copy"><span class="eyebrow">UM POUCO DE INSPIRAÇÃO</span><h2>Simples de fazer.<br>Bom de saborear.</h2><p>Escolha uma receita, separe os ingredientes e aproveite o preparo.</p><button class="primary" data-recipe="${featured.id}">Começar por aqui ${icon('arrow')}</button></div><img src="${featured.image}" alt="Ilustração da categoria da receita em destaque"></section><div class="section-head"><h2>O que combina com hoje?</h2></div>${chips()}<div class="section-head"><h2>Para experimentar</h2><button class="text-btn" data-page="catalog">Ver todas →</button></div><div class="recipe-grid">${cards(picks.length ? picks : state.recipes.slice(0, 6))}</div><div class="note"><strong>Os seus 3S:</strong> sem glúten, sem lactose e sem adição de açúcar. Frutas e outros ingredientes podem conter açúcares naturais. <button class="text-btn" data-action="guide">Conheça os cuidados de preparo →</button></div>`}</div>`;
}
function catalogPage(favorite = false) { return `<div class="page-heading"><span class="eyebrow">${favorite ? 'SEU CADERNO PESSOAL' : 'UM MUNDO DE POSSIBILIDADES'}</span><h1>${favorite ? 'Suas favoritas.' : state.filter ? category(state.filter).title + '.' : 'Todas as receitas.'}</h1><p>${favorite ? 'Aquelas que merecem voltar à mesa.' : `${state.session.count} receitas e variações para explorar no seu ritmo.`}</p></div>${favorite && !state.recipes.some(r => state.favorites.has(r.id)) ? empty('Guarde suas próximas ideias.', 'Toque no coração de uma receita para encontrá-la aqui.', 'heart') : `${search()}${chips()}<div id="results">${results()}</div>`}`; }
function categoriesPage() { return `<div class="page-heading"><span class="eyebrow">ENCONTRE SEU PRÓXIMO PREPARO</span><h1>Para cada momento.</h1><p>Do primeiro café ao último pedacinho de sobremesa.</p></div><div class="category-grid">${categories.map(c => `<button class="category-tile" data-category="${c.id}"><img src="/receitas/art/${c.id}.svg" alt="" width="400" height="300" loading="lazy"><div><h3>${c.title}</h3><p>${state.recipes.filter(r => r.category === c.id).length} receitas ${icon('arrow')}</p></div></button>`).join('')}</div>`; }
function shoppingPage() {
  const visible = state.shopping.filter(item => state.recipes.some(r => r.id === item.recipe));
  return `<div class="page-heading"><span class="eyebrow">MENOS ESQUECIMENTOS, MAIS PRATICIDADE</span><h1>Sua lista de compras.</h1><p>Os ingredientes das receitas que você quer preparar.</p></div>${visible.length ? `<div class="detail-actions"><button class="secondary" data-action="copy-list">Copiar lista ${icon('book')}</button><button class="secondary" data-action="clear-checked">Limpar marcados ${icon('check')}</button></div>${[...new Set(visible.map(i => i.recipe))].map(id => `<section class="shopping-group"><h3>${escape(state.recipes.find(r => r.id === id)?.title || 'Receita')}</h3>${visible.filter(i => i.recipe === id).map(i => `<label class="shopping-row ${i.checked ? 'checked' : ''}"><input type="checkbox" data-shopping="${escape(i.key)}" aria-label="${escape(i.text)}" ${i.checked ? 'checked' : ''}><span>${escape(i.text)}</span><button type="button" data-remove="${escape(i.key)}" aria-label="Remover ${escape(i.text)}">${icon('close')}</button></label>`).join('')}</section>`).join('')}<p class="muted" style="font-size:12px">Quantidades separadas por receita. Sua lista fica salva neste aparelho.</p>` : empty('A lista começa na receita.', 'Abra uma receita e toque em “Adicionar à lista”. Nós organizamos os ingredientes aqui.', 'bag')}`;
}
function accountPage() { return `<div class="page-heading"><span class="eyebrow">TUDO NO SEU LUGAR</span><h1>Minha área.</h1><p>Uma cozinha que acompanha você.</p></div><section class="account-card"><span class="pill">${icon('spark')} ${state.session.plan === 'complete' ? 'Plano Completo' : 'Plano Essencial'}</span><h2 style="margin-top:18px">${state.session.count} receitas à sua disposição.</h2><p>${state.session.plan === 'complete' ? 'As 365 receitas essenciais, 135 adicionais e seus materiais de apoio.' : 'Sua coleção essencial, organizada em oito categorias.'}</p><button class="secondary" data-action="switch">Usar outro código</button></section>${state.session.plan === 'complete' ? `<div class="section-head"><h2>Seus materiais de apoio</h2></div><div class="bonus-grid"><button class="bonus-card" data-action="pantry">${icon('bag')}<h3>Despensa essencial</h3><p>Uma base para organizar suas compras.</p></button><button class="bonus-card" data-action="menu">${icon('book')}<h3>30 dias de ideias</h3><p>Sugestões para variar o cardápio.</p></button><button class="bonus-card" data-action="substitutions">${icon('leaf')}<h3>Guia de substituições</h3><p>Alternativas e seus cuidados.</p></button></div>` : ''}<section class="account-card account-links"><button data-action="install">Adicionar à tela inicial ${icon('download')}</button><button data-action="guide">Antes de cozinhar ${icon('leaf')}</button><button data-action="privacy">Seus dados neste aparelho ${icon('lock')}</button><button data-action="logout">Sair da minha cozinha ${icon('arrow')}</button></section><p class="muted" style="font-size:11px;text-align:center">Método 3S · Sabor Sem Sacrifícios<br>Conteúdo culinário proposto, ainda não testado em cozinha.</p>`; }
function render() {
  const views = { home, catalog: () => catalogPage(), favorites: () => catalogPage(true), categories: categoriesPage, shopping: shoppingPage, account: accountPage };
  app.innerHTML = `<main class="shell">${header()}<section class="fade-in">${views[state.page]()}</section></main>${nav()}`;
  $('#search')?.addEventListener('input', event => {
    state.query = event.target.value; state.visible = 24;
    if (state.page === 'home') $('#home-main').innerHTML = results(); else $('#results').innerHTML = results();
  });
}
function navigate(page) { state.page = page; state.query = ''; state.filter = ''; state.quick = false; state.visible = 24; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function ingredientText(ingredient) {
  const amount = ingredient.amount ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(ingredient.amount * state.factor) : '';
  return `${amount}${amount ? ' ' : ''}${ingredient.unit ? ingredient.unit + ' ' : ''}${ingredient.name}`;
}
async function openRecipe(id) {
  const request = ++detailRequest;
  dialog.innerHTML = `<div class="dialog-bar"><p>Preparando a receita</p><button class="icon-btn" data-action="close-recipe" aria-label="Fechar">${icon('close')}</button></div><div class="loading" style="min-height:300px"><p>Carregando…</p></div>`;
  if (!dialog.open) dialog.showModal();
  try {
    const recipe = await api(`/api/recipes?id=${id}`);
    if (request !== detailRequest || !dialog.open) return;
    state.detail = recipe; state.factor = 1; detail(); dialog.scrollTop = 0;
  } catch (error) {
    if (request !== detailRequest) return;
    dialog.innerHTML = `<div class="info-copy"><h2>Não foi possível abrir.</h2><p>${escape(error.message)}</p><button class="primary" data-action="close-recipe">Voltar</button></div>`;
    if (error.status === 401) { state.session = null; showLogin('Seu acesso expirou. Entre novamente.'); }
  }
}
function detail() {
  const r = state.detail;
  dialog.innerHTML = `<div class="dialog-bar"><button class="icon-btn" data-action="close-recipe" aria-label="Voltar">${icon('back')}</button><p>Sua próxima receita</p><button class="icon-btn save ${state.favorites.has(r.id) ? 'saved' : ''}" data-save="${r.id}" aria-label="Salvar receita" aria-pressed="${state.favorites.has(r.id)}">${icon('heart')}</button></div><div class="dialog-body"><img class="detail-image" src="${r.image}" alt="Ilustração da categoria ${category(r.category).title}"><p class="image-label">Ilustração da categoria · o resultado pode variar</p><span class="eyebrow">${category(r.category).title}</span><h1 class="detail-title">${escape(r.title)}</h1><p class="detail-description">${escape(r.description)}</p><div class="detail-stats"><div><strong>${r.time} min</strong><small>Tempo estimado total</small></div><div><strong>${r.servings * state.factor}</strong><small>Porções</small></div><div><strong>${r.difficulty}</strong><small>Dificuldade</small></div></div><div class="detail-actions"><button class="primary" data-action="add-list">${icon('bag')} Adicionar à lista</button><button class="secondary" data-action="cook">${icon('pot')} Modo preparo</button></div><div class="servings"><h2>Ingredientes</h2><div class="portion-control"><button data-action="less" aria-label="Diminuir rendimento" ${state.factor <= .5 ? 'disabled' : ''}>−</button><span>${r.servings * state.factor} porções</span><button data-action="plus" aria-label="Aumentar rendimento" ${state.factor >= 3 ? 'disabled' : ''}>+</button></div></div>${state.factor !== 1 ? '<p class="muted" style="font-size:11px">Lista ajustada. As etapas descrevem a receita base: use as quantidades desta lista. Tempo e forma podem precisar de adaptação; para ovos fracionados, bata e meça a fração.</p>' : ''}${r.ingredients.map((item, index) => `<label class="ingredient"><input type="checkbox" aria-label="Separado: ${escape(ingredientText(item))}"><span>${escape(ingredientText(item))}</span></label>`).join('')}<h2 style="margin-top:32px">Vamos preparar?</h2><ol class="steps">${r.steps.map(step => `<li><span>${escape(step)}</span></li>`).join('')}</ol><div class="tip-box"><h3>${icon('spark')} Detalhes que fazem diferença</h3>${r.tips.map(tip => `<p>${escape(tip)}</p>`).join('')}</div><div class="allergens"><strong>Atenção aos ingredientes:</strong> ${r.allergens.length ? `contém ${escape(r.allergens.join(', '))}. ` : ''}Confira os rótulos e evite contaminação cruzada. Sem lactose não significa adequado para toda alergia alimentar.</div><p class="note">Sem adição de açúcar; pode conter açúcares naturais. Receita proposta e não testada em cozinha. Tempos são estimados: confirme o ponto antes de servir.</p><button class="text-btn" data-action="print">Imprimir receita →</button></div>`;
}
function cooking() {
  const r = state.detail, n = state.cookStep;
  dialog.innerHTML = `<div class="dialog-bar"><button class="icon-btn" data-action="detail" aria-label="Voltar à receita">${icon('back')}</button><p>Modo preparo</p><button class="icon-btn" data-action="close-recipe" aria-label="Fechar">${icon('close')}</button></div><div class="cook-mode"><h2>${escape(r.title)}</h2><span class="eyebrow">ETAPA ${n + 1} DE ${r.steps.length}</span><div class="progress"><span style="width:${(n + 1) / r.steps.length * 100}%"></span></div><p>${escape(r.steps[n])}</p><div class="cook-controls"><button class="secondary" data-action="previous-step" ${n === 0 ? 'disabled' : ''}>Anterior</button><button class="primary" data-action="next-step">${n === r.steps.length - 1 ? 'Concluir' : 'Próxima etapa'} ${icon('arrow')}</button></div></div>`;
}
function infoModal(title, content) { info.innerHTML = `<div class="dialog-bar"><p>Método 3S</p><button class="icon-btn" data-action="close-info" aria-label="Fechar">${icon('close')}</button></div><div class="info-copy"><h2>${title}</h2>${content}</div>`; if (!info.open) info.showModal(); info.scrollTop = 0; }
function guide() { infoModal('Antes de colocar a mão na massa.', `<p>Uma coleção de receitas e variações propostas a partir de preparações culinárias conhecidas. Ainda não passaram por testes em cozinha; ajuste o preparo observando o ponto indicado.</p><h3>O que os 3S significam aqui?</h3><p>Sem glúten, sem lactose e sem adição de açúcar. Frutas, vegetais e bebidas vegetais podem conter açúcares naturais. Não são receitas “zero carboidrato” nem uma prescrição para diabetes ou qualquer condição clínica.</p><h3>Rótulos e alergênicos</h3><p>Escolha farinhas, aveia, fermentos, temperos e bebidas vegetais com indicação de ausência de glúten. A aveia precisa ser especificamente rotulada sem glúten. Use utensílios e superfícies limpos para evitar contato com trigo, leite e outros alergênicos.</p><p>Ovos, amendoim, castanhas, soja, peixe e gergelim aparecem em algumas receitas e são sinalizados. Verifique também os avisos “pode conter” nos rótulos. Uma receita sem lactose não é automaticamente adequada à alergia à proteína do leite.</p><h3>Preparo e conservação</h3><p>Lave as mãos e separe os utensílios usados com carnes cruas. Use termômetro culinário: aves a 74 °C, carne moída a 71 °C, peixe a 63 °C e preparações de ovos a 71 °C no centro. Reaqueça sobras a 74 °C.</p><p>Refrigere perecíveis em até 2 horas (1 hora em calor acima de 32 °C), em recipientes rasos. Mantenha a geladeira a 4 °C ou menos e consuma sobras refrigeradas em até 3–4 dias. Não confie apenas na aparência ou no cheiro.</p><h3>Use com autonomia e cuidado</h3><p>As porções e os tempos são estimados. Para restrições médicas, confirme a adequação individual com um profissional. As ilustrações representam a categoria, não fotografias do resultado testado.</p><p>Referências: <a href="https://www.foodsafety.gov/food-safety-charts" target="_blank" rel="noopener">FoodSafety.gov</a>, <a href="https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/questions-and-answers-gluten-free-food-labeling-final-rule" target="_blank" rel="noopener">FDA: ingredientes sem glúten</a> e <a href="https://www.nhs.uk/conditions/lactose-intolerance/" target="_blank" rel="noopener">NHS: lactose</a>.</p>`); }
function menu() {
  const breakfast = state.recipes.filter(r => r.category === 'cafe'), main = state.recipes.filter(r => r.category === 'refeicoes'), snack = state.recipes.filter(r => r.category === 'lanches');
  infoModal('30 dias de ideias.', `<p>Inspirações para variar o preparo, não um plano alimentar individual. Ajuste combinações e porções à sua rotina.</p>${Array.from({ length: 30 }, (_, n) => `<section class="day-menu"><h3>Dia ${n + 1}</h3>${[['Café',breakfast[n % breakfast.length]],['Refeição',main[(n * 3) % main.length]],['Lanche',snack[(n * 2) % snack.length]]].map(([label,r]) => `<button data-menu-recipe="${r.id}"><strong>${label}</strong> · ${escape(r.title)} →</button>`).join('')}</section>`).join('')}`);
}
document.addEventListener('click', async event => {
  const target = event.target.closest('button'); if (!target) return;
  if (target.dataset.page) return navigate(target.dataset.page);
  if (target.hasAttribute('data-category')) { state.filter = target.dataset.category; state.page = 'catalog'; state.visible = 24; render(); return; }
  if (target.dataset.recipe) return openRecipe(Number(target.dataset.recipe));
  if (target.dataset.menuRecipe) { info.close(); return openRecipe(Number(target.dataset.menuRecipe)); }
  if (target.dataset.save) {
    const id = Number(target.dataset.save); state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id); persist('m3s-favorites', [...state.favorites]);
    document.querySelectorAll(`[data-save="${id}"]`).forEach(button => { button.classList.toggle('saved', state.favorites.has(id)); button.setAttribute('aria-pressed', String(state.favorites.has(id))); });
    if (state.page === 'favorites') render(); toast(state.favorites.has(id) ? 'Receita salva nas favoritas.' : 'Receita removida das favoritas.'); return;
  }
  if (target.dataset.remove) { event.preventDefault(); state.shopping = state.shopping.filter(i => i.key !== target.dataset.remove); persist('m3s-shopping', state.shopping); render(); return; }
  const action = target.dataset.action;
  if (action === 'toggle-code') { const input = $('#access-code'); input.type = input.type === 'password' ? 'text' : 'password'; target.setAttribute('aria-label', input.type === 'password' ? 'Mostrar código' : 'Ocultar código'); }
  if (action === 'close-recipe') { detailRequest++; dialog.close(); }
  if (action === 'close-info') info.close();
  if (action === 'guide') guide();
  if (action === 'more') { state.visible += 24; render(); }
  if (action === 'quick') { state.quick = !state.quick; state.visible = 24; render(); }
  if (action === 'less' || action === 'plus') { state.factor = Math.max(.5, Math.min(3, state.factor + (action === 'plus' ? .5 : -.5))); detail(); }
  if (action === 'detail') detail();
  if (action === 'cook') { state.cookStep = 0; cooking(); }
  if (action === 'previous-step') { state.cookStep--; cooking(); }
  if (action === 'next-step') { if (state.cookStep < state.detail.steps.length - 1) { state.cookStep++; cooking(); } else { detail(); toast('Preparo concluído. Bom apetite!'); } }
  if (action === 'add-list') {
    const r = state.detail;
    state.shopping = state.shopping.filter(i => i.recipe !== r.id);
    state.shopping.push(...r.ingredients.map((i, n) => ({ key: `${r.id}-${n}`, recipe: r.id, text: ingredientText(i), checked: false })));
    persist('m3s-shopping', state.shopping); toast('Ingredientes adicionados à lista de compras.');
  }
  if (action === 'clear-checked') { state.shopping = state.shopping.filter(i => !i.checked); persist('m3s-shopping', state.shopping); render(); }
  if (action === 'copy-list') { try { await navigator.clipboard.writeText(state.shopping.filter(i => !i.checked && state.recipes.some(r => r.id === i.recipe)).map(i => '□ ' + i.text).join('\n')); toast('Lista copiada.'); } catch { toast('Seu navegador não permitiu copiar a lista.'); } }
  if (action === 'logout' || action === 'switch') {
    try { await api('/api/recipe-access', { method: 'DELETE' }); state.session = null; state.recipes = []; state.detail = null; dialog.close(); showLogin(); } catch (error) { toast(error.message); }
  }
  if (action === 'print') window.print();
  if (action === 'menu' && state.session?.plan === 'complete') menu();
  if (action === 'pantry' && state.session?.plan === 'complete') infoModal('Sua despensa essencial.', '<p>Escolha apenas o que será usado nas receitas da semana. A lista de cada receita contém as quantidades exatas.</p><h3>Base seca</h3><p>Arroz, quinoa, lentilha, grão-de-bico, farinha de arroz, polvilho, fubá e aveia rotulada sem glúten.</p><h3>Para temperar</h3><p>Azeite, alho, cebola, limão, ervas, páprica e canela. Confira a composição das misturas de temperos.</p><h3>Geladeira e feira</h3><p>Ovos, legumes variados, folhas, frutas da estação e as proteínas que você consome. Compre perecíveis em pequenas quantidades.</p><h3>Para os preparos cremosos</h3><p>Bebida vegetal e leite de coco sem adição de açúcar. Confira ausência de leite e glúten; soja e castanhas exigem atenção a alergias.</p><h3>Antes de sair</h3><p>Revise a despensa, abra as receitas escolhidas e use “Adicionar à lista”. Evite comprar todas as alternativas de uma vez.</p>');
  if (action === 'substitutions' && state.session?.plan === 'complete') infoModal('Trocas com intenção.', '<p>Trocas mudam sabor, textura e tempo. Preserve a receita original no primeiro preparo; estas orientações não garantem equivalência em toda massa.</p><h3>Bebidas vegetais</h3><p>Em mingaus e vitaminas, troque a bebida vegetal por outra sem açúcar e sem glúten, no mesmo volume. Coco é mais marcante; versões de castanhas ou soja têm alergênicos próprios.</p><h3>Farinhas não são todas iguais</h3><p>Farinha de arroz, amêndoas, coco e polvilho absorvem líquidos de formas diferentes. Não troque uma pela outra em bolos e pães na proporção 1:1 sem uma receita específica.</p><h3>Frutas</h3><p>Para servir sobre mingaus, use a mesma quantidade em gramas de outra fruta. Em massas, banana ajuda a dar liga: maçã picada não cumpre a mesma função.</p><h3>Ervas e legumes</h3><p>Salsinha e cebolinha podem variar a finalização. Em refogados, troque legumes de textura semelhante mantendo o peso e ajustando o tempo até ficarem macios.</p><h3>Ovos e fermentação</h3><p>Não substitua ovos automaticamente por chia. Ovos estruturam muitas massas e cada troca precisa de ajuste. Fermento químico e biológico também não são intercambiáveis.</p><h3>Leite e açúcar</h3><p>Leite sem lactose ainda contém proteínas do leite. Mel, melado, açúcar de coco e xaropes continuam sendo açúcares adicionados e não são usados nesta coleção.</p>');
  if (action === 'privacy') infoModal('Seus dados, no seu aparelho.', '<p>Favoritas e lista de compras ficam no armazenamento deste navegador. Não são sincronizadas entre aparelhos. Ao limpar os dados do navegador, elas serão apagadas.</p><p>O acesso usa um cookie de sessão válido por sete dias. Você pode sair quando quiser. Os códigos de acesso são compartilhados por plano; não identificam uma compra individual.</p><p>Para carregar receitas e verificar seu plano, é necessária uma conexão à internet. Este app não coleta seu nome, e-mail ou dados de pagamento.</p>');
  if (action === 'install') {
    if (installPrompt) { await installPrompt.prompt(); installPrompt = null; }
    else infoModal('Sua cozinha na tela inicial.', '<h3>No iPhone ou iPad</h3><p>Abra esta página no Safari. Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p><h3>No Android</h3><p>No Chrome, abra o menu ⋮ e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”, quando disponível.</p><p>O atalho abre a sua cozinha com uma experiência de app. Você precisa de internet para acessar as receitas.</p>');
  }
});
document.addEventListener('change', event => {
  if (event.target.id === 'sort') { state.sort = event.target.value; render(); }
  if (event.target.dataset.shopping) { const item = state.shopping.find(i => i.key === event.target.dataset.shopping); if (item) item.checked = event.target.checked; persist('m3s-shopping', state.shopping); event.target.closest('.shopping-row').classList.toggle('checked', event.target.checked); }
});
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
dialog.addEventListener('cancel', () => { detailRequest++; });
async function init() {
  try { state.session = await api('/api/recipe-access'); await loadCatalog(); }
  catch (error) { showLogin(error.status === 401 ? '' : error.message); }
}
init();
