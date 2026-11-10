import { api, qs } from '../api.js';
import { clear, emptyState, field, h, openModal, select, showError, toast } from '../dom.js';
import { centsToInput, money, parseMoneyToCents } from '../format.js';
import { nivel } from './comum.js';
import { abrirMovimentacao } from './movimentacoes.js';

export async function renderProdutos(container) {
  const filtros = { q: '', categoria: '', abaixo_minimo: '' };
  const categorias = await api.get('/produtos/categorias');
  const lista = h('div', { class: 'panel' });
  let temporizador;

  async function carregar() {
    const produtos = await api.get(`/produtos${qs(filtros)}`);
    clear(lista);
    if (produtos.length === 0) {
      lista.append(emptyState('Nenhum produto encontrado', 'Ajuste os filtros ou cadastre um novo produto.'));
      return;
    }
    lista.append(
      h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ['SKU', 'Produto', 'Categoria', 'Estoque', 'Custo unit.', ''].map((t, i) => h('th', { class: i === 4 ? 'right' : '' }, t)))),
        h('tbody', {}, produtos.map((p) =>
          h('tr', { class: p.abaixo_minimo ? 'linha-baixa' : '' },
            h('td', { class: 'num' }, p.sku),
            h('td', {}, p.nome, p.ativo ? null : h('span', { class: 'badge badge-bad' }, 'Inativo')),
            h('td', {}, p.categoria),
            h('td', {}, nivel(p.estoque_atual, p.estoque_minimo), h('small', { class: 'muted' }, ` ${p.unidade}`)),
            h('td', { class: 'right num' }, money(p.preco_custo_centavos)),
            h('td', { class: 'actions' },
              h('button', { class: 'btn btn-ghost btn-sm', disabled: !p.ativo, onClick: () => abrirMovimentacao([p], p.id, carregar) }, 'Movimentar'),
              ' ',
              h('button', { class: 'btn btn-ghost btn-sm', onClick: () => abrirForm(p, carregar) }, 'Editar'),
            ),
          ),
        )),
      )),
    );
  }

  const busca = h('input', {
    type: 'search',
    placeholder: 'Nome ou SKU',
    onInput: (e) => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { filtros.q = e.target.value.trim(); carregar(); }, 250);
    },
  });
  const categoria = select([{ value: '', label: 'Todas' }, ...categorias.map((c) => ({ value: c, label: c }))], '', {
    onChange: (e) => { filtros.categoria = e.target.value; carregar(); },
  });
  const abaixo = h('input', { type: 'checkbox', onChange: (e) => { filtros.abaixo_minimo = e.target.checked ? 'true' : ''; carregar(); } });

  container.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Produtos'), h('button', { class: 'btn', onClick: () => abrirForm(null, carregar) }, 'Novo produto')),
    h('div', { class: 'toolbar' }, field('Buscar', busca), field('Categoria', categoria), h('label', {}, abaixo, ' Só abaixo do mínimo')),
    lista,
  );
  await carregar();
}

function abrirForm(produto, aoSalvar) {
  const sku = h('input', { required: true, minLength: 2, maxLength: 30, value: produto?.sku ?? '' });
  const nome = h('input', { required: true, minLength: 2, maxLength: 120, value: produto?.nome ?? '' });
  const categoria = h('input', { required: true, minLength: 2, maxLength: 60, value: produto?.categoria ?? '' });
  const unidade = h('input', { required: true, maxLength: 10, value: produto?.unidade ?? 'un' });
  const custo = h('input', { inputMode: 'decimal', required: true, value: centsToInput(produto?.preco_custo_centavos ?? 0) });
  const minimo = h('input', { type: 'number', min: 0, step: 1, required: true, value: produto?.estoque_minimo ?? 0 });
  const inicial = h('input', { type: 'number', min: 0, step: 1, value: 0 });
  const ativo = h('input', { type: 'checkbox', checked: produto?.ativo ?? true });

  const form = h('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      const centavos = parseMoneyToCents(custo.value);
      if (Number.isNaN(centavos) || centavos < 0) return toast('Informe um custo válido, como 12,90.', 'erro');
      const dados = {
        sku: sku.value, nome: nome.value, categoria: categoria.value, unidade: unidade.value,
        preco_custo_centavos: centavos, estoque_minimo: Number(minimo.value),
      };
      try {
        if (produto) await api.patch(`/produtos/${produto.id}`, { ...dados, ativo: ativo.checked });
        else await api.post('/produtos', { ...dados, estoque_inicial: Number(inicial.value) });
        toast('Produto salvo.');
        fechar();
        aoSalvar();
      } catch (error) {
        showError(error);
      }
    },
  },
    h('div', { class: 'form-row' }, field('SKU', sku), field('Unidade', unidade)),
    field('Nome', nome),
    h('div', { class: 'form-row' }, field('Categoria', categoria), field('Custo unitário (R$)', custo)),
    h('div', { class: 'form-row' }, field('Estoque mínimo', minimo), produto ? null : field('Estoque inicial', inicial)),
    produto ? h('label', {}, ativo, ' Produto ativo') : null,
    produto ? h('p', { class: 'dica' }, 'Para mudar a quantidade em estoque, use “Movimentar”: assim o histórico fica completo.') : null,
    h('div', { class: 'form-actions' }, h('button', { type: 'submit', class: 'btn' }, 'Salvar')),
  );
  const fechar = openModal(produto ? 'Editar produto' : 'Novo produto', form);
}
