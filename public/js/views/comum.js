import { h } from '../dom.js';

const TIPOS = {
  ENTRADA: ['Entrada', 'badge-ok'],
  SAIDA: ['Saída', 'badge-bad'],
  AJUSTE: ['Ajuste', 'badge-warn'],
};

export function badgeTipo(tipo) {
  const [rotulo, classe] = TIPOS[tipo];
  return h('span', { class: `badge ${classe}` }, rotulo);
}

/** Barra de nível: estoque atual em relação ao dobro do mínimo. */
export function nivel(atual, minimo) {
  const baixo = minimo > 0 && atual <= minimo;
  const pct = minimo > 0 ? Math.min(100, Math.round((atual / (minimo * 2)) * 100)) : 100;
  return h(
    'div',
    { class: `nivel ${baixo ? 'baixo' : ''}`, title: `Mínimo: ${minimo}` },
    h('span', { class: 'num' }, atual),
    h('span', { class: 'trilho' }, h('i', { style: `width:${pct}%` })),
  );
}
