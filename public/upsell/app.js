const checkoutUrl = window.METODO3S_UPSELL?.checkoutUrl;
if (checkoutUrl) {
  try {
    const url = new URL(checkoutUrl);
    if (url.protocol === 'https:') {
      const button = document.querySelector('.accept');
      button.disabled = false;
      document.querySelector('#checkout-status').textContent = 'Você seguirá para o checkout para concluir a compra.';
      button.addEventListener('click', () => { window.location.assign(url.href); });
    }
  } catch { /* Keep the offer unavailable until a valid checkout is configured. */ }
}
