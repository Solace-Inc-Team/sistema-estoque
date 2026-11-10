export class RelatoriosRepository {
  constructor(db) {
    this.db = db;
  }

  posicao() {
    return this.db
      .prepare(
        `SELECT id, sku, nome, categoria, unidade, estoque_atual, estoque_minimo,
                preco_custo_centavos,
                estoque_atual * preco_custo_centavos AS valor_total_centavos
           FROM produtos
          WHERE ativo = 1
          ORDER BY categoria, nome`,
      )
      .all();
  }

  abaixoMinimo() {
    return this.db
      .prepare(
        `SELECT id, sku, nome, categoria, unidade, estoque_atual, estoque_minimo,
                estoque_minimo - estoque_atual AS faltam
           FROM produtos
          WHERE ativo = 1 AND estoque_minimo > 0 AND estoque_atual <= estoque_minimo
          ORDER BY (estoque_atual * 1.0 / estoque_minimo), nome`,
      )
      .all();
  }

  movimentacoesPorTipo({ de, ate }) {
    return this.db
      .prepare(
        `SELECT tipo, COUNT(*) AS movimentacoes, SUM(ABS(variacao)) AS unidades
           FROM movimentacoes
          WHERE date(criada_em) BETWEEN ? AND ?
          GROUP BY tipo
          ORDER BY tipo`,
      )
      .all(de, ate);
  }

  maioresSaidas({ de, ate, limite = 5 }) {
    return this.db
      .prepare(
        `SELECT p.id, p.sku, p.nome, SUM(m.quantidade) AS unidades
           FROM movimentacoes m
           JOIN produtos p ON p.id = m.produto_id
          WHERE m.tipo = 'SAIDA' AND date(m.criada_em) BETWEEN ? AND ?
          GROUP BY p.id
          ORDER BY unidades DESC, p.nome
          LIMIT ?`,
      )
      .all(de, ate, limite);
  }
}
