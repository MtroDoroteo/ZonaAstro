async function loadComponent(containerId, url) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${url} (HTTP ${response.status}).`);
    }

    container.innerHTML = await response.text();

    if (containerId === 'header') {
      initializeNavigation(container);
    }
  } catch (error) {
    console.error(`Error al cargar el componente ${url}:`, error);
    container.setAttribute('role', 'alert');
    container.textContent = 'No se pudo cargar este componente. Recarga la página para intentarlo de nuevo.';
  }
}

function initializeNavigation(container) {
  const toggle = container.querySelector('.nav__toggle');
  const nav = container.querySelector('#primary-navigation');
  if (!toggle || !nav) return;

  const setOpen = (isOpen) => {
    const expanded = window.matchMedia('(max-width: 900px)').matches && isOpen;
    nav.classList.toggle('nav--open', expanded);
    toggle.classList.toggle('nav__toggle--active', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Cerrar navegación' : 'Abrir navegación');
    nav.setAttribute('aria-hidden', String(
      window.matchMedia('(max-width: 900px)').matches && !expanded
    ));
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  const mediaQuery = window.matchMedia('(max-width: 900px)');
  const updateForViewport = () => setOpen(false);
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateForViewport);
  } else {
    mediaQuery.addListener(updateForViewport);
  }
  setOpen(false);
}

loadComponent('header', 'header.html');
loadComponent('footer', 'footer.html');
