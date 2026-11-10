import { AppError } from '../../utils/AppError.js';

export class MovimentacoesService {
  constructor({ db, repository, produtosRepository }) {
    this.db = db;
    this.repository = repository;
    this.produtosRepository = produtosRepository;
  }

  listar(filtros) {
    return this.repository.listar({
      produtoId: filtros.produto_id,
      tipo: filtros.tipo,
      de: filtros.de,
      ate: filtros.ate,
      limite: filtros.limite,
    });
  }

  /**
   * Registra uma movimentação e atualiza o saldo na mesma transação,
   * garantindo que o estoque nunca fique negativo.
   */
  registrar({ produto_id, tipo, quantidade, motivo }) {
    return this.db.transaction(() => {
      const produto = this.produtosRepository.buscarPorId(produto_id);
      if (!produto) throw AppError.notFound('Produto não encontrado.');
      if (!produto.ativo) throw AppError.conflict('Produto inativo não pode ser movimentado.');

      const variacao = this.#calcularVariacao(tipo, quantidade, produto.estoque_atual);
      const saldo = produto.estoque_atual + variacao;
      if (saldo < 0) {
        throw AppError.conflict(
          `Estoque insuficiente: saldo atual de ${produto.estoque_atual} ${produto.unidade}, saída de ${quantidade}.`,
        );
      }

      this.produtosRepository.atualizarSaldo(produto_id, saldo);
      const id = this.repository.criar({ produto_id, tipo, quantidade, variacao, saldo_apos: saldo, motivo });
      return this.repository.buscarPorId(id);
    })();
  }

  #calcularVariacao(tipo, quantidade, saldoAtual) {
    if (tipo === 'ENTRADA') return quantidade;
    if (tipo === 'SAIDA') return -quantidade;
    return quantidade - saldoAtual; // AJUSTE: quantidade é o saldo contado
  }
}
