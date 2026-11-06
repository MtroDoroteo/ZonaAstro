const SHIPPING_COST = 5.00;

const currency = (n) =>
  `$${Number(n).toFixed(2)}`;

/* ---------- Referencias al DOM ---------- */

const listEl = document.getElementById('cart-list');
const emptyEl = document.getElementById('cart-empty');

const totalItemsEl = document.getElementById('cart-total-items');
const subtotalEl = document.getElementById('cart-subtotal');
const shippingEl = document.getElementById('cart-shipping');
const grandTotalEl = document.getElementById('cart-grand-total');

const preorderBtn = document.getElementById('preorder-button');
const preorderMessage = document.getElementById('preorder-message');

let cart = window.CartStorage.load();

/* ---------- Cálculo y resumen ---------- */

function updateSummary() {
  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  // El envío se cobra únicamente cuando hay productos.
  const shipping = totalItems > 0 ? SHIPPING_COST : 0;
  const grandTotal = subtotal + shipping;

  if (totalItemsEl) {
    totalItemsEl.textContent = totalItems;
  }

  if (subtotalEl) {
    subtotalEl.textContent = currency(subtotal);
  }

  if (shippingEl) {
    shippingEl.textContent = currency(shipping);
  }

  if (grandTotalEl) {
    grandTotalEl.textContent = currency(grandTotal);
  }

  if (preorderBtn) {
    preorderBtn.disabled = totalItems === 0;
  }
}

/* ---------- Render ---------- */

function render() {
  listEl.replaceChildren();

  if (cart.length === 0) {
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;

    cart.forEach((item) => {
      listEl.appendChild(buildRow(item));
    });
  }

  updateSummary();
}

function buildRow(item) {
  const row = document.createElement('div');
  row.className = 'cart__row';
  row.dataset.id = item.id;
  row.setAttribute('role', 'row');

  const lineTotal = Number(item.price) * Number(item.qty);

  const productCell = document.createElement('div');
  productCell.className = 'col col--product';
  productCell.setAttribute('role', 'cell');

  const thumbnail = document.createElement('div');
  thumbnail.className = 'product__thumb';
  const imageUrl = getSafeImageUrl(item.image);
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    image.width = 54;
    image.height = 54;
    image.loading = 'lazy';
    image.decoding = 'async';
    thumbnail.appendChild(image);
  } else {
    thumbnail.textContent = '☕';
    thumbnail.setAttribute('aria-hidden', 'true');
  }

  const info = document.createElement('div');
  info.className = 'product__info';
  const name = document.createElement('span');
  name.className = 'product__name';
  name.textContent = item.name;
  info.appendChild(name);
  if (item.variant) {
    const variant = document.createElement('span');
    variant.className = 'product__variant';
    variant.textContent = item.variant;
    info.appendChild(variant);
  }
  productCell.append(thumbnail, info);

  const quantityCell = document.createElement('div');
  quantityCell.className = 'col col--qty';
  quantityCell.setAttribute('role', 'cell');
  quantityCell.setAttribute('aria-label', `Cantidad de ${item.name}`);

  const minusButton = document.createElement('button');
  minusButton.type = 'button';
  minusButton.className = 'qty-btn qty-btn--minus';
  minusButton.setAttribute('aria-label', `Disminuir cantidad de ${item.name}`);
  minusButton.textContent = '−';

  const quantity = document.createElement('span');
  quantity.className = 'qty-value';
  quantity.textContent = String(item.qty);

  const plusButton = document.createElement('button');
  plusButton.type = 'button';
  plusButton.className = 'qty-btn qty-btn--plus';
  plusButton.setAttribute('aria-label', `Aumentar cantidad de ${item.name}`);
  plusButton.textContent = '+';
  quantityCell.append(minusButton, quantity, plusButton);

  const priceCell = document.createElement('div');
  priceCell.className = 'col col--price';
  priceCell.setAttribute('role', 'cell');
  priceCell.setAttribute('aria-label', `Precio por unidad: ${currency(item.price)}`);
  priceCell.textContent = currency(item.price);

  const totalCell = document.createElement('div');
  totalCell.className = 'col col--total';
  totalCell.setAttribute('role', 'cell');
  totalCell.setAttribute('aria-label', `Total de ${item.name}: ${currency(lineTotal)}`);
  totalCell.textContent = currency(lineTotal);

  const removeCell = document.createElement('div');
  removeCell.className = 'col col--remove';
  removeCell.setAttribute('role', 'cell');
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-btn';
  removeButton.setAttribute('aria-label', `Eliminar ${item.name} del carrito`);
  removeButton.textContent = '×';
  removeCell.appendChild(removeButton);

  row.append(productCell, quantityCell, priceCell, totalCell, removeCell);

  minusButton.addEventListener('click', () => changeQty(item.id, -1));

  plusButton.addEventListener('click', () => changeQty(item.id, 1));

  removeButton.addEventListener('click', () => removeItem(item.id));

  return row;
}

function getSafeImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';

  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'https:' ? url.href : '';
  } catch (error) {
    return '';
  }
}

/* ---------- Acciones sobre el carrito ---------- */

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }

  window.CartStorage.save(cart);
  render();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);

  window.CartStorage.save(cart);
  render();
}

/* ---------- Preordenar ---------- */

let isSending = false;

if (preorderBtn) {
  preorderBtn.addEventListener('click', async () => {
    if (isSending) return;

    // Leer nuevamente el carrito antes de continuar.
    cart = window.CartStorage.load();

    const totalItems = cart.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0
    );

    if (totalItems === 0) {
      preorderMessage.textContent =
        'Agrega productos antes de preordenar.';

      render();
      return;
    }

    const subtotal = cart.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    );

    const total = subtotal + SHIPPING_COST;

    isSending = true;
    preorderBtn.disabled = true;
    preorderMessage.textContent = 'Enviando tu preorden...';

    try {
      const result = await enviarPedidoASheets(cart, total);

      // Solo se limpia el carrito si el pedido se registró correctamente.
      cart = [];
      window.CartStorage.save(cart);
      render();

      preorderMessage.textContent =
        `¡Preorden #${result.no_pedido} registrada! ` +
        `${totalItems} artículo(s), total ${currency(total)}. ` +
        'Estado: En proceso.';
    } catch (err) {
      console.error('No se pudo enviar la preorden:', err);

      // El carrito se conserva para que el cliente pueda reintentar.
      preorderMessage.textContent =
        'No pudimos enviar tu preorden. Intenta de nuevo en un momento.';
      preorderBtn.disabled = false;
    } finally {
      isSending = false;
    }
  });
}

/* ---------- Sincronía entre pestañas ---------- */

window.addEventListener('storage', (e) => {
  if (e.key === window.CartStorage.key) {
    cart = window.CartStorage.load();
    render();
  }
});

/* ---------- Inicialización ---------- */

render();