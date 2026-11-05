(() => {
  const date = document.querySelector('#offer-today');
  const banner = document.querySelector('#fixed-offer-bar');
  const format = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const update = () => {
    const today = format.format(new Date());
    date.textContent = today;
    banner.setAttribute('aria-label', `Confira as ofertas de hoje: ${today}. Ver planos`);
  };
  update();
  setInterval(update, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();
