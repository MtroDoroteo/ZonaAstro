(() => {
  const key = 'orbita_cart';

  function load() {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.error('El contenido guardado del carrito no tiene el formato esperado.');
        return [];
      }

      return parsed
        .filter((item) =>
          item &&
          (typeof item.id === 'string' || typeof item.id === 'number') &&
          typeof item.name === 'string' &&
          Number.isFinite(Number(item.price)) &&
          Number(item.price) >= 0 &&
          Number.isInteger(Number(item.qty)) &&
          Number(item.qty) > 0
        )
        .map((item) => ({
          id: String(item.id),
          name: item.name,
          variant: typeof item.variant === 'string' ? item.variant : '',
          image: typeof item.image === 'string' ? item.image : '',
          price: Number(item.price),
          qty: Number(item.qty)
        }));
    } catch (error) {
      console.error('No se pudo leer el carrito:', error);
      return [];
    }
  }

  function save(cart) {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (error) {
      console.error('No se pudo guardar el carrito:', error);
    }
  }

  window.CartStorage = Object.freeze({ key, load, save });
})();
