import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

describe('API de estoque', () => {
  let api;
  let produto;

  before(async () => {
    api = await startTestServer();
    const criado = await api.post('/produtos', {
      sku: 'abc-1',
      nome: 'Produto de teste',
      categoria: 'Testes',
      preco_custo_centavos: 1000,
      estoque_minimo: 5,
      estoque_inicial: 10,
    });
    produto = criado.body;
  });

  after(() => api.close());

  it('cria produto com SKU em maiúsculas e registra o estoque inicial', async () => {
    assert.equal(produto.sku, 'ABC-1');
    assert.equal(produto.estoque_atual, 10);

    const historico = await api.get(`/movimentacoes?produto_id=${produto.id}`);
    assert.equal(historico.body.length, 1);
    assert.equal(historico.body[0].motivo, 'Estoque inicial');
  });

  it('recusa SKU duplicado', async () => {
    const resposta = await api.post('/produtos', { sku: 'ABC-1', nome: 'Outro produto' });
    assert.equal(resposta.status, 409);
  });

  it('registra saída e impede estoque negativo', async () => {
    const saida = await api.post('/movimentacoes', { produto_id: produto.id, tipo: 'SAIDA', quantidade: 4 });
    assert.equal(saida.status, 201);
    assert.equal(saida.body.saldo_apos, 6);

    const excesso = await api.post('/movimentacoes', { produto_id: produto.id, tipo: 'SAIDA', quantidade: 7 });
    assert.equal(excesso.status, 409);

    const atual = await api.get(`/produtos/${produto.id}`);
    assert.equal(atual.body.estoque_atual, 6);
  });

  it('usa o AJUSTE como saldo contado no inventário', async () => {
    const ajuste = await api.post('/movimentacoes', { produto_id: produto.id, tipo: 'AJUSTE', quantidade: 3 });
    assert.equal(ajuste.body.variacao, -3);
    assert.equal(ajuste.body.saldo_apos, 3);
  });

  it('lista produtos abaixo do mínimo e calcula o valor em estoque', async () => {
    const abaixo = await api.get('/relatorios/abaixo-minimo');
    assert.equal(abaixo.body.length, 1);
    assert.equal(abaixo.body[0].faltam, 2);

    const posicao = await api.get('/relatorios/posicao');
    assert.equal(posicao.body.totais.valor_total_centavos, 3 * 1000);
  });

  it('resume as movimentações do período', async () => {
    const hoje = new Date().toLocaleDateString('sv-SE');
    const resumo = await api.get(`/relatorios/movimentacoes?de=${hoje}&ate=${hoje}`);
    const saidas = resumo.body.por_tipo.find((t) => t.tipo === 'SAIDA');
    assert.equal(saidas.unidades, 4);
    assert.equal(resumo.body.maiores_saidas[0].sku, 'ABC-1');
  });

  it('valida os dados de entrada', async () => {
    const zero = await api.post('/movimentacoes', { produto_id: produto.id, tipo: 'ENTRADA', quantidade: 0 });
    assert.equal(zero.status, 400);
    const semProduto = await api.post('/movimentacoes', { produto_id: 999, tipo: 'ENTRADA', quantidade: 1 });
    assert.equal(semProduto.status, 404);
  });
});
