const choices = { 'pt-BR': 'PT-BR', es: 'ES', en: 'EN' };
const url = new URL(location.href);
let saved;
try { saved = localStorage.getItem('m3s-language'); } catch {}
const requested = url.searchParams.get('lang') || saved || navigator.language.split('-')[0];
export const language = Object.hasOwn(choices, requested) ? requested : 'pt-BR';
const messages = language === 'pt-BR' ? {} : await fetch('/receitas/' + language + '.json').then(response => response.json());
export const t = text => messages[text] ?? text;
document.documentElement.lang = language;
export function languagePicker() {
  return '<select class="language-picker" data-language aria-label="Idioma / Language">' +
    Object.entries(choices).map(([code, label]) => '<option value="' + code + '"' + (code === language ? ' selected' : '') + '>' + label + '</option>').join('') + '</select>';
}
export function changeLanguage(code) {
  if (!Object.hasOwn(choices, code)) return;
  try { localStorage.setItem('m3s-language', code); } catch {}
  url.searchParams.set('lang', code);
  location.assign(url);
}
if (document.querySelector('#app')) {
  document.title = t('Sua cozinha • Método 3S');
  document.querySelector('.loading p').textContent = t('Preparando sua cozinha…');
  for (const dialog of document.querySelectorAll('dialog')) dialog.setAttribute('aria-label', t(dialog.getAttribute('aria-label')));
}
