import { api, qs } from '../api.js';
import { clear, emptyState, field, h, openModal, select, showError, toast } from '../dom.js';
import { dateTimeBR } from '../format.js';
import { badgeTipo } from './comum.js';

export async function renderMovimentacoes(container) {
  const produtos = await api.get('/produtos?ativos=true');
  const filtros = { produto_id: '', tipo: '', de: '', ate: '' };
  const lista = h('div', { class: 'panel' });

  async function carregar() {
    const itens = await api.get(`/movimentacoes${qs({ ...filtros, limite: 200 })}`);
    clear(lista);
    if (itens.length === 0) {
      lista.append(emptyState('Nenhuma movimentação', 'Registre entradas, saídas ou ajustes de inventário.'));
      return;
    }
    lista.append(
      h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ['Data', 'Produto', 'Tipo', 'Variação', 'Saldo', 'Motivo'].map((t, i) => h('th', { class: i === 3 || i === 4 ? 'right' : '' }, t)))),
        h('tbody', {}, itens.map((m) =>
          h('tr', {},
            h('td', { class: 'num' }, dateTimeBR(m.criada_em)),
            h('td', {}, m.produto_nome, h('br'), h('small', { class: 'muted' }, m.sku)),
            h('td', {}, badgeTipo(m.tipo)),
            h('td', { class: `right num ${m.variacao < 0 ? 'neg' : 'pos'}` }, `${m.variacao > 0 ? '+' : ''}${m.variacao}`),
            h('td', { class: 'right num' }, m.saldo_apos),
            h('td', {}, m.motivo ?? ''),
          ),
        )),
      )),
    );
  }

  const campoFiltro = (chave) => (e) => { filtros[chave] = e.target.value; carregar(); };

  container.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Movimentações'), h('button', { class: 'btn', onClick: () => abrirMovimentacao(produtos, null, carregar) }, 'Nova movimentação')),
    h('div', { class: 'toolbar' },
      field('Produto', select([{ value: '', label: 'Todos' }, ...produtos.map((p) => ({ value: p.id, label: p.nome }))], '', { onChange: campoFiltro('produto_id') })),
      field('Tipo', select([{ value: '', label: 'Todos' }, { value: 'ENTRADA', label: 'Entrada' }, { value: 'SAIDA', label: 'Saída' }, { value: 'AJUSTE', label: 'Ajuste' }], '', { onChange: campoFiltro('tipo') })),
      field('De', h('input', { type: 'date', onChange: campoFiltro('de') })),
      field('Até', h('input', { type: 'date', onChange: campoFiltro('ate') })),
    ),
    lista,
  );
  await carregar();
}

/** Modal de nova movimentação. Usado também na tela de produtos. */
export function abrirMovimentacao(produtos, produtoId, aoSalvar) {
  const produto = select(produtos.map((p) => ({ value: p.id, label: `${p.sku} — ${p.nome} (saldo ${p.estoque_atual})` })), produtoId, { required: true });
  const tipo = select([{ value: 'ENTRADA', label: 'Entrada (compra, devolução)' }, { value: 'SAIDA', label: 'Saída (consumo, venda)' }, { value: 'AJUSTE', label: 'Ajuste de inventário' }], 'ENTRADA');
  const quantidade = h('input', { type: 'number', min: 0, step: 1, required: true });
  const motivo = h('input', { maxLength: 200, placeholder: 'Opcional' });
  const dica = h('p', { class: 'dica' });

  const atualizarDica = () => {
    dica.textContent = tipo.value === 'AJUSTE' ? 'No ajuste, informe o saldo contado no inventário (não a diferença).' : '';
  };
  tipo.addEventListener('change', atualizarDica);

  const form = h('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      try {
        const m = await api.post('/movimentacoes', { produto_id: Number(produto.value), tipo: tipo.value, quantidade: Number(quantidade.value), motivo: motivo.value || undefined });
        toast(`Movimentação registrada. Novo saldo: ${m.saldo_apos}.`);
        fechar();
        aoSalvar();
      } catch (error) {
        showError(error);
      }
    },
  },
    field('Produto', produto), field('Tipo', tipo), field(tipo.value === 'AJUSTE' ? 'Saldo contado' : 'Quantidade', quantidade), dica, field('Motivo', motivo),
    h('div', { class: 'form-actions' }, h('button', { type: 'submit', class: 'btn' }, 'Registrar')),
  );
  const fechar = openModal('Nova movimentação', form);
}
