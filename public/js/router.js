import { clear, h } from './dom.js';

/**
 * Roteador por hash (#/rota). Cada rota tem { path, label, render }.
 * render(container) pode ser assíncrono.
 */
export function startRouter(routes, { nav, view }) {
  const render = async () => {
    const path = location.hash.replace('#/', '') || routes[0].path;
    const route = routes.find((r) => r.path === path) ?? routes[0];

    for (const link of nav.querySelectorAll('a')) {
      link.toggleAttribute('aria-current', link.dataset.path === route.path);
    }

    clear(view).append(h('p', { class: 'loading' }, 'Carregando…'));
    try {
      const content = h('div', { class: 'page' });
      await route.render(content);
      clear(view).append(content);
    } catch (error) {
      clear(view).append(
        h('div', { class: 'empty' }, h('strong', {}, 'Não foi possível carregar'), h('p', {}, error.message)),
      );
    }
  };

  nav.replaceChildren(...routes.map((r) => h('a', { href: `#/${r.path}`, 'data-path': r.path }, r.label)));
  window.addEventListener('hashchange', render);
  render();
  return render;
}
