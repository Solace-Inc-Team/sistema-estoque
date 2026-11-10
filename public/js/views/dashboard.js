import { api } from '../api.js';
import { emptyState, h } from '../dom.js';
import { dateTimeBR, money } from '../format.js';
import { badgeTipo, nivel } from './comum.js';

export async function renderDashboard(container) {
  const [posicao, abaixo, recentes] = await Promise.all([
    api.get('/relatorios/posicao'),
    api.get('/relatorios/abaixo-minimo'),
    api.get('/movimentacoes?limite=8'),
  ]);
  const { totais } = posicao;

  const stat = (rotulo, valor, classe = '') =>
    h('div', { class: 'panel stat' }, h('span', {}, rotulo), h('strong', { class: `num ${classe}` }, valor));

  container.append(
    h('h1', {}, 'Visão geral'),
    h(
      'div',
      { class: 'grid' },
      stat('Produtos ativos', totais.produtos),
      stat('Unidades em estoque', totais.unidades.toLocaleString('pt-BR')),
      stat('Valor em estoque (custo)', money(totais.valor_total_centavos)),
      stat('Abaixo do mínimo', totais.abaixo_minimo, totais.abaixo_minimo > 0 ? 'neg' : 'pos'),
    ),
    h(
      'div',
      { class: 'dois-col' },
      h(
        'section',
        { class: 'panel' },
        h('h2', {}, 'Precisam de reposição'),
        abaixo.length === 0
          ? emptyState('Tudo em dia', 'Nenhum produto está abaixo do estoque mínimo.')
          : h(
              'table',
              {},
              h('tbody', {}, abaixo.map((p) =>
                h('tr', {}, h('td', {}, p.nome, h('br'), h('small', { class: 'muted' }, p.sku)), h('td', {}, nivel(p.estoque_atual, p.estoque_minimo)), h('td', { class: 'right num neg' }, `faltam ${p.faltam}`)),
              )),
            ),
      ),
      h(
        'section',
        { class: 'panel' },
        h('h2', {}, 'Últimas movimentações'),
        recentes.length === 0
          ? emptyState('Sem movimentações', 'Registre a primeira entrada na aba Movimentações.')
          : h(
              'table',
              {},
              h('tbody', {}, recentes.map((m) =>
                h('tr', {}, h('td', {}, m.produto_nome, h('br'), h('small', { class: 'muted' }, dateTimeBR(m.criada_em))), h('td', {}, badgeTipo(m.tipo)), h('td', { class: `right num ${m.variacao < 0 ? 'neg' : 'pos'}` }, `${m.variacao > 0 ? '+' : ''}${m.variacao}`)),
              )),
            ),
      ),
    ),
  );
}
