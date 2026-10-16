const offer = document.querySelector('#offer');
document.querySelectorAll('button').forEach(button => {
  if (/QUERO|SIM,|VER OFERTA|TODAS AS/.test(button.textContent.toUpperCase())) {
    button.addEventListener('click', () => offer.scrollIntoView({ behavior: 'smooth' }));
  }
});
const slides = [...document.querySelectorAll('img[alt^="Receita leve"]')];
const dots = [...document.querySelectorAll('button[aria-label^="Slide "]')];
function showSlide(index) {
  slides.forEach((image, i) => { image.style.opacity = i === index ? '1' : '0'; });
  dots.forEach((button, i) => {
    button.style.backgroundColor = i === index ? 'var(--brand-orange)' : '#d5d8ce';
    button.style.width = i === index ? '32px' : '12px';
    button.setAttribute('aria-pressed', String(i === index));
  });
}
dots.forEach((button, index) => button.addEventListener('click', () => showSlide(index)));
if (slides.length) showSlide(0);
document.querySelectorAll('.preview-demo figure img').forEach(image => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Ampliar: ' + image.alt);
  image.before(button);
  button.append(image);
  button.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'preview-lightbox';
    dialog.setAttribute('aria-label', 'Tela do aplicativo ampliada');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Fechar';
    const enlarged = image.cloneNode();
    dialog.append(close, enlarged);
    document.body.append(dialog);
    dialog.addEventListener('close', () => { dialog.remove(); button.focus(); });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.showModal();
  });
});
