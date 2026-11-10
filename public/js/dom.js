/** Cria elementos DOM sem usar innerHTML (evita XSS). */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      el.className = value;
    } else if (key in el && key !== 'list') {
      el[key] = value;
    } else {
      el.setAttribute(key, value === true ? '' : value);
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function clear(el) {
  el.replaceChildren();
  return el;
}

export function toast(message, kind = 'ok') {
  const box = document.getElementById('toasts');
  const item = h('div', { class: `toast toast-${kind}`, role: 'status' }, message);
  box.append(item);
  setTimeout(() => item.remove(), 3500);
}

export function showError(error) {
  const extra = error.details?.map((d) => d.mensagem).join(' ');
  toast(extra ? `${error.message} ${extra}` : error.message, 'erro');
}

/** Abre um modal e devolve a função que o fecha. */
export function openModal(title, content) {
  const previousFocus = document.activeElement;
  const close = () => {
    overlay.remove();
    previousFocus?.focus?.();
  };

  const overlay = h(
    'div',
    { class: 'overlay', onClick: (e) => e.target === overlay && close() },
    h(
      'div',
      { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('header', {}, h('h2', {}, title), h('button', { class: 'btn-icon', 'aria-label': 'Fechar', onClick: close }, '×')),
      content,
    ),
  );
  overlay.addEventListener('keydown', (e) => e.key === 'Escape' && close());
  document.body.append(overlay);
  overlay.querySelector('input, select, textarea, button')?.focus();
  return close;
}

/** Campo de formulário com rótulo. */
export function field(label, control) {
  return h('label', { class: 'field' }, h('span', {}, label), control);
}

/** Cria um <select> com opções [{value, label}]. */
export function select(options, current, attrs = {}) {
  const el = h('select', attrs);
  for (const opt of options) {
    el.append(h('option', { value: opt.value }, opt.label));
  }
  if (current != null) el.value = String(current);
  return el;
}

export function emptyState(title, hint) {
  return h('div', { class: 'empty' }, h('strong', {}, title), hint ? h('p', {}, hint) : null);
}

export function downloadCsv(filename, rows) {
  const escape = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const link = h('a', { href: URL.createObjectURL(blob), download: filename });
  link.click();
  URL.revokeObjectURL(link.href);
}
