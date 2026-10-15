const checkoutUrl = window.METODO3S_UPSELL?.checkoutUrl;
if (checkoutUrl) {
  try {
    const url = new URL(checkoutUrl);
    if (url.protocol === 'https:') {
      const button = document.querySelector('.accept');
      for (const [key, value] of new URLSearchParams(window.location.search)) {
        if (key.startsWith('utm_') || ['fbclid', 'src', 'sck', 'xcod'].includes(key)) {
          if (!url.searchParams.has(key)) url.searchParams.set(key, value);
        }
      }
      button.href = url.href;
      button.removeAttribute('aria-disabled');
      document.querySelector('#checkout-status').textContent = 'Você seguirá para o checkout para concluir a compra.';
    }
  } catch { /* Keep the offer unavailable until a valid checkout is configured. */ }
}
