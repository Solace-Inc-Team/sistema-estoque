import { api, qs } from '../api.js';
import { clear, downloadCsv, emptyState, field, h } from '../dom.js';
import { money, todayISO } from '../format.js';
import { badgeTipo } from './comum.js';

export async function renderRelatorios(container) {
  const periodo = { de: `${todayISO().slice(0, 8)}01`, ate: todayISO() };
  const [posicao, abaixo] = await Promise.all([api.get('/relatorios/posicao'), api.get('/relatorios/abaixo-minimo')]);
  const secaoPeriodo = h('div', { class: 'dois-col' });

  async function carregarPeriodo() {
    const dados = await api.get(`/relatorios/movimentacoes${qs(periodo)}`);
    clear(secaoPeriodo).append(
      h('section', { class: 'panel' }, h('h2', {}, 'Movimentações por tipo'),
        dados.por_tipo.length === 0 ? emptyState('Sem movimentações no período') : h('table', {}, h('thead', {}, h('tr', {}, ['Tipo', 'Registros', 'Unidades'].map((t, i) => h('th', { class: i ? 'right' : '' }, t)))),
          h('tbody', {}, dados.por_tipo.map((t) => h('tr', {}, h('td', {}, badgeTipo(t.tipo)), h('td', { class: 'right num' }, t.movimentacoes), h('td', { class: 'right num' }, t.unidades)))))),
      h('section', { class: 'panel' }, h('h2', {}, 'Produtos com mais saídas'),
        dados.maiores_saidas.length === 0 ? emptyState('Sem saídas no período') : h('table', {}, h('tbody', {}, dados.maiores_saidas.map((s) => h('tr', {}, h('td', {}, s.nome, h('br'), h('small', { class: 'muted' }, s.sku)), h('td', { class: 'right num' }, `${s.unidades} un`)))))),
    );
  }

  const exportar = () =>
    downloadCsv('posicao-estoque.csv', [
      ['SKU', 'Produto', 'Categoria', 'Unidade', 'Estoque atual', 'Estoque mínimo', 'Custo unitário', 'Valor total'],
      ...posicao.itens.map((i) => [i.sku, i.nome, i.categoria, i.unidade, i.estoque_atual, i.estoque_minimo, money(i.preco_custo_centavos), money(i.valor_total_centavos)]),
    ]);

  container.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Relatórios'), h('button', { class: 'btn btn-ghost', onClick: exportar }, 'Exportar posição (CSV)')),
    h('section', { class: 'panel' }, h('h2', {}, 'Posição do estoque por categoria'),
      posicao.por_categoria.length === 0 ? emptyState('Sem produtos cadastrados') : h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ['Categoria', 'Produtos', 'Unidades', 'Valor em estoque'].map((t, i) => h('th', { class: i ? 'right' : '' }, t)))),
        h('tbody', {}, posicao.por_categoria.map((c) => h('tr', {}, h('td', {}, c.categoria), h('td', { class: 'right num' }, c.produtos), h('td', { class: 'right num' }, c.unidades), h('td', { class: 'right num' }, money(c.valor_total_centavos))))),
        h('tfoot', {}, h('tr', {}, h('th', {}, 'Total'), h('th', { class: 'right num' }, posicao.totais.produtos), h('th', { class: 'right num' }, posicao.totais.unidades), h('th', { class: 'right num' }, money(posicao.totais.valor_total_centavos))))))),
    h('section', { class: 'panel' }, h('h2', {}, 'Abaixo do estoque mínimo'),
      abaixo.length === 0 ? emptyState('Tudo em dia') : h('table', {}, h('thead', {}, h('tr', {}, ['Produto', 'Atual', 'Mínimo', 'Faltam'].map((t, i) => h('th', { class: i ? 'right' : '' }, t)))),
        h('tbody', {}, abaixo.map((p) => h('tr', {}, h('td', {}, p.nome), h('td', { class: 'right num' }, p.estoque_atual), h('td', { class: 'right num' }, p.estoque_minimo), h('td', { class: 'right num neg' }, p.faltam)))))),
    h('div', { class: 'toolbar' },
      field('De', h('input', { type: 'date', value: periodo.de, onChange: (e) => { periodo.de = e.target.value; carregarPeriodo(); } })),
      field('Até', h('input', { type: 'date', value: periodo.ate, onChange: (e) => { periodo.ate = e.target.value; carregarPeriodo(); } })),
    ),
    secaoPeriodo,
  );
  await carregarPeriodo();
}
