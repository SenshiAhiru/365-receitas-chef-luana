import { language, languagePicker, changeLanguage } from './language.js';
const labels = {
  es: ['Créditos de las fotos','← Volver a las recetas','Fotos ilustrativas de platos similares. Los ingredientes y la presentación pueden variar. Sigue la lista de la receta.','Las fotos se muestran con las licencias de sus autores. Se recortan en las tarjetas. Las demás fotos pertenecen al archivo del sitio.','Fuente original','Foto:'],
  en: ['Photo credits','← Back to recipes','Photos show similar dishes. Ingredients and presentation may vary. Follow the recipe’s ingredient list.','Photos are provided under the licenses listed by their authors. They are cropped on cards. Other photos are from the site’s collection.','Original source','Photo:']
};
document.body.insertAdjacentHTML('afterbegin',languagePicker());
document.querySelector('[data-language]').onchange = event => changeLanguage(event.target.value);
if (labels[language]) {
  const [title, back, intro, licenses, source, credit] = labels[language];
  document.title = title + ' · Método 3S';
  document.querySelector('h1').textContent = title;
  document.querySelector('a').textContent = back;
  const paragraphs = document.querySelectorAll('body > p');
  paragraphs[0].textContent = intro;
  paragraphs[1].textContent = licenses;
  for (const link of document.querySelectorAll('section a:first-of-type')) link.textContent = source;
  for (const p of document.querySelectorAll('section p')) p.textContent = p.textContent.replace(/^Foto:/, credit);
}
