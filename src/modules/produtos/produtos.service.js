import { AppError } from '../../utils/AppError.js';

export class ProdutosService {
  constructor({ db, repository, movimentacoesService }) {
    this.db = db;
    this.repository = repository;
    this.movimentacoes = movimentacoesService;
  }

  listar(filtros) {
    return this.repository
      .listar({
        q: filtros.q,
        categoria: filtros.categoria,
        abaixoMinimo: filtros.abaixo_minimo,
        apenasAtivos: filtros.ativos,
      })
      .map(apresentar);
  }

  categorias() {
    return this.repository.categorias();
  }

  obter(id) {
    const produto = this.repository.buscarPorId(id);
    if (!produto) throw AppError.notFound('Produto não encontrado.');
    return apresentar(produto);
  }

  criar({ estoque_inicial, ...dados }) {
    this.#garantirSkuLivre(dados.sku);

    return this.db.transaction(() => {
      const id = this.repository.criar(dados);
      if (estoque_inicial > 0) {
        this.movimentacoes.registrar({
          produto_id: id,
          tipo: 'ENTRADA',
          quantidade: estoque_inicial,
          motivo: 'Estoque inicial',
        });
      }
      return this.obter(id);
    })();
  }

  atualizar(id, alteracoes) {
    const atual = this.obter(id);
    if (alteracoes.sku && alteracoes.sku !== atual.sku) this.#garantirSkuLivre(alteracoes.sku);

    this.repository.atualizar(id, {
      sku: alteracoes.sku ?? atual.sku,
      nome: alteracoes.nome ?? atual.nome,
      categoria: alteracoes.categoria ?? atual.categoria,
      unidade: alteracoes.unidade ?? atual.unidade,
      preco_custo_centavos: alteracoes.preco_custo_centavos ?? atual.preco_custo_centavos,
      estoque_minimo: alteracoes.estoque_minimo ?? atual.estoque_minimo,
      ativo: alteracoes.ativo ?? atual.ativo,
    });
    return this.obter(id);
  }

  #garantirSkuLivre(sku) {
    if (this.repository.buscarPorSku(sku)) {
      throw AppError.conflict(`Já existe um produto com o SKU ${sku}.`);
    }
  }
}

function apresentar(produto) {
  return {
    ...produto,
    ativo: Boolean(produto.ativo),
    abaixo_minimo: produto.estoque_minimo > 0 && produto.estoque_atual <= produto.estoque_minimo,
  };
}
