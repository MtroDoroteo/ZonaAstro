/* ============================================================
   CONFIGURACIÓN DE GOOGLE SHEETS
   ============================================================
   1) Abre tu Google Sheet y ve a: Archivo > Compartir > Compartir
      y en "Acceso general" elige "Cualquier persona con el enlace"
      con rol "Lector". (No hace falta publicar en la web).
   2) Copia el ID de la hoja desde la URL:
      https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   3) Cada categoría del menú corresponde a UNA HOJA (pestaña)
      dentro del mismo documento. Escribe aquí el nombre exacto
      de la pestaña para cada categoría (tal como aparece abajo
      en el documento, respetando mayúsculas/acentos).
   4) Cada hoja debe tener estas columnas en la fila 1 (encabezados),
      en cualquier orden (los nombres no distinguen mayúsculas):
        id | Producto | Precio | Descuento | Stock | Imagen
      - "Precio" debe ser un número (ej. 25 o 25.5), sin el símbolo $.
      - "Descuento" es un PORCENTAJE (ej. 10 = 10% de descuento).
        Déjalo vacío o en 0 si el producto no tiene descuento.
      - "Stock" es la cantidad disponible. Si es 0 (o está vacío),
        el producto se muestra como "Agotado" y no se puede ordenar.
      - "Imagen" debe ser una URL pública de la foto del producto.
============================================================ */
const SHEET_ID = '1BqtHK9TeUdt65qcM9dHWEwGZKJNkK__jtxom8QgJH-E';

const CATEGORY_SHEETS = {
  'bebidas-calientes': 'BebidasCalientes',
  'bebidas-frias': 'BebidasFrias',
  'alimentos': 'Alimentos'
};

// Caché simple para no volver a pedir la misma hoja varias veces
const productsCache = {};

function findProductByUid(uid) {
  return Object.values(productsCache).flat().find(p => String(p.uid) === String(uid));
}

// Devuelve true si se agregó, false si ya se alcanzó el stock
function addToCart(producto) {
  const cart = window.CartStorage.load();
  const existing = cart.find(i => i.id === producto.uid);

  if (existing) {
    if (existing.qty >= producto.stock) return false;
    existing.qty += 1;
  } else {
    cart.push({
      id: producto.uid,
      name: producto.nombre,
      price: Math.round(producto.precioFinal * 100) / 100, // ya con descuento
      image: producto.imagen_url,
      qty: 1
    });
  }

  window.CartStorage.save(cart);
  return true;
}

/**
 * Descarga y transforma los datos de una hoja de Google Sheets
 * usando el endpoint público de Google Visualization (gviz).
 * Devuelve un arreglo de productos ya listos para renderizar.
 */
async function fetchProductsFromSheet(sheetName) {
  if (productsCache[sheetName]) {
    return productsCache[sheetName];
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`No se pudo leer la hoja "${sheetName}" (HTTP ${response.status}). Verifica el SHEET_ID y los permisos de acceso.`);
  }

  const rawText = await response.text();

  // La respuesta de gviz viene envuelta así:
  // google.visualization.Query.setResponse({ ... JSON ... });
  // Hay que extraer solo el JSON de en medio.
  const jsonStart = rawText.indexOf('{');
  const jsonEnd = rawText.lastIndexOf('}');
  const data = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));

  if (!data.table || !data.table.cols) {
    throw new Error(`La hoja "${sheetName}" no tiene el formato esperado.`);
  }

  // Los encabezados pueden venir en "label" o, si la hoja no tiene
  // fila de encabezado reconocida, hay que usar los datos crudos.
  const columnNames = data.table.cols.map(col => (col.label || '').trim().toLowerCase());

  const rows = data.table.rows || [];

  const products = rows
    .map((row, index) => {
      const values = {};
      row.c.forEach((cell, i) => {
        values[columnNames[i]] = cell ? cell.v : '';
      });

      const precioLeido = Number.parseFloat(values['precio']);
      const descuentoLeido = Number.parseFloat(values['descuento']);
      const stockLeido = Number.parseFloat(values['stock']);
      const precioBase = Number.isFinite(precioLeido) ? Math.max(0, precioLeido) : 0;
      const descuentoPorcentaje = Number.isFinite(descuentoLeido)
        ? Math.min(100, Math.max(0, descuentoLeido))
        : 0;
      const precioFinal = precioBase - (precioBase * descuentoPorcentaje / 100);
      const stock = Number.isFinite(stockLeido) ? Math.max(0, Math.floor(stockLeido)) : 0;

      return {
        uid: `${sheetName}-${values['id'] !== undefined && values['id'] !== '' ? values['id'] : index}`,
        id: values['id'] !== undefined && values['id'] !== '' ? values['id'] : index,
        nombre: values['producto'] || '',
        precioBase: precioBase,
        precioFinal: precioFinal,
        tieneDescuento: descuentoPorcentaje > 0,
        imagen_url: values['imagen'] || '',
        stock: stock,
        agotado: stock <= 0
      };
    })
    .filter(producto => producto.nombre);

  productsCache[sheetName] = products;
  return products;
}

/**
 * Pinta la lista de productos dentro del grid, generando el
 * mismo HTML de tarjeta que ya tenías, pero con datos reales.
 */
function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  grid.replaceChildren();

  if (!products.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'products__empty';
    emptyMessage.textContent = 'No hay productos disponibles en esta categoría por ahora.';
    grid.appendChild(emptyMessage);
    return;
  }

  products.forEach(producto => {
    const article = document.createElement('article');
    article.className = 'product-card' + (producto.agotado ? ' product-card--agotado' : '');
    article.dataset.productId = producto.uid;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-card__image';
    const imageUrl = getSafeImageUrl(producto.imagen_url);
    if (imageUrl) {
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = producto.nombre;
      image.width = 130;
      image.height = 150;
      image.loading = 'lazy';
      image.decoding = 'async';
      imageContainer.appendChild(image);
    }

    if (producto.agotado) {
      const badge = document.createElement('span');
      badge.className = 'product-card__badge';
      badge.textContent = 'Agotado';
      imageContainer.appendChild(badge);
    }

    const info = document.createElement('div');
    info.className = 'product-card__info';

    const name = document.createElement('h2');
    name.className = 'product-card__name';
    name.textContent = producto.nombre;

    const footer = document.createElement('div');
    footer.className = 'product-card__footer';

    const price = document.createElement('p');
    price.className = 'product-card__price';
    if (producto.tieneDescuento) {
      const originalPrice = document.createElement('del');
      originalPrice.className = 'product-card__price-original';
      originalPrice.textContent = currency(producto.precioBase);
      price.append(originalPrice, document.createTextNode(' '));
    }
    price.appendChild(document.createTextNode(currency(producto.precioFinal)));

    const button = document.createElement('button');
    button.className = 'product-card__button';
    button.type = 'button';
    button.dataset.action = 'ordenar';
    button.dataset.productId = producto.uid;
    button.disabled = producto.agotado;
    button.textContent = producto.agotado ? 'Agotado' : 'Ordenar';

    footer.append(price, button);
    info.append(name, footer);
    article.append(imageContainer, info);
    grid.appendChild(article);
  });
}

function currency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
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

let categoryRequestId = 0;

/**
 * Carga (o toma de caché) los productos de una categoría y los
 * muestra en pantalla, con estados de carga y error visibles.
 */
async function loadCategory(categoria) {
  const grid = document.getElementById('products-grid');
  const sheetName = CATEGORY_SHEETS[categoria];
  const requestId = ++categoryRequestId;

  if (!sheetName) {
    const errorMessage = document.createElement('p');
    errorMessage.className = 'products__error';
    errorMessage.textContent = `No hay una hoja configurada para la categoría "${categoria}".`;
    grid.replaceChildren(errorMessage);
    grid.setAttribute('aria-busy', 'false');
    return;
  }

  grid.setAttribute('aria-busy', 'true');
  const loadingMessage = document.createElement('p');
  loadingMessage.className = 'products__loading';
  loadingMessage.textContent = 'Cargando productos...';
  grid.replaceChildren(loadingMessage);

  try {
    const products = await fetchProductsFromSheet(sheetName);
    if (requestId !== categoryRequestId) return;
    renderProducts(products);
  } catch (error) {
    console.error('Error al cargar productos desde Google Sheets:', error);
    if (requestId !== categoryRequestId) return;
    const errorMessage = document.createElement('p');
    errorMessage.className = 'products__error';
    errorMessage.textContent = 'Ocurrió un error al cargar los productos. Intenta de nuevo más tarde.';
    grid.replaceChildren(errorMessage);
  } finally {
    if (requestId === categoryRequestId) {
      grid.setAttribute('aria-busy', 'false');
    }
  }
}

// Interacción de la nav de categorías: cambia el estilo activo
// y carga los productos reales de la hoja correspondiente.
document.querySelectorAll('.categories__item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.categories__item').forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed', 'true');
    loadCategory(btn.dataset.category);
  });
});

// Al cargar la página, muestra la categoría marcada como activa
// (o la primera disponible si ninguna lo está).
document.addEventListener('DOMContentLoaded', () => {
  const requestedCategory = new URLSearchParams(window.location.search).get('categoria');
  const requestedBtn = [...document.querySelectorAll('.categories__item')]
    .find((button) => button.dataset.category === requestedCategory);
  const activeBtn = requestedBtn || document.querySelector('.categories__item.is-active');
  if (requestedBtn) {
    document.querySelectorAll('.categories__item').forEach((button) => {
      const isActive = button === requestedBtn;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }
  const initialCategory = activeBtn ? activeBtn.dataset.category : Object.keys(CATEGORY_SHEETS)[0];
  loadCategory(initialCategory);
});

function showAddedFeedback(btn, added) {
  btn.textContent = added ? '¡Agregado!' : 'Máximo en stock';
  btn.disabled = true;
  setTimeout(() => {
    const product = findProductByUid(btn.dataset.productId);
    const cartItem = window.CartStorage.load().find((item) => item.id === btn.dataset.productId);
    const maxedOut = product && cartItem && cartItem.qty >= product.stock;
    btn.textContent = maxedOut ? 'Máximo en stock' : 'Ordenar';
    btn.disabled = Boolean(maxedOut);
  }, 900);
}

document.getElementById('products-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="ordenar"]');
  if (!btn || btn.disabled) return;

  const producto = findProductByUid(btn.dataset.productId);
  if (!producto) return;

  const added = addToCart(producto);
  showAddedFeedback(btn, added);
  if (typeof window.updateCartBadge === 'function') {
    window.updateCartBadge(true);
  }
});