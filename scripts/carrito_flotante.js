(() => {
  function getCartCount() {
    return window.CartStorage.load().reduce((total, item) => total + item.qty, 0);
  }

  window.updateCartBadge = (animate = false) => {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    const total = getCartCount();
    badge.textContent = String(total);
    badge.hidden = total === 0;
    const icon = document.getElementById('floating-cart');
    if (icon) {
      icon.setAttribute(
        'aria-label',
        total === 1 ? 'Ver carrito, 1 artículo' : `Ver carrito, ${total} artículos`
      );
    }

    if (animate) {
      if (!icon) return;
      icon.classList.remove('floating-cart--bump');
      void icon.offsetWidth;
      icon.classList.add('floating-cart--bump');
    }
  };

  window.updateCartBadge();
  window.addEventListener('storage', (event) => {
    if (event.key === window.CartStorage.key) window.updateCartBadge();
  });
})();