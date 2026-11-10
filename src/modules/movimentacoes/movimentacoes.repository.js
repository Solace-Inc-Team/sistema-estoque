const SELECT_BASE = `
  SELECT m.*, p.sku, p.nome AS produto_nome, p.unidade
    FROM movimentacoes m
    JOIN produtos p ON p.id = m.produto_id`;

export class MovimentacoesRepository {
  constructor(db) {
    this.db = db;
  }

  criar({ produto_id, tipo, quantidade, variacao, saldo_apos, motivo }) {
    const result = this.db
      .prepare(
        `INSERT INTO movimentacoes (produto_id, tipo, quantidade, variacao, saldo_apos, motivo)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(produto_id, tipo, quantidade, variacao, saldo_apos, motivo ?? null);
    return Number(result.lastInsertRowid);
  }

  buscarPorId(id) {
    return this.db.prepare(`${SELECT_BASE} WHERE m.id = ?`).get(id);
  }

  listar({ produtoId, tipo, de, ate, limite = 100 } = {}) {
    const filtros = [];
    const valores = [];
    if (produtoId) {
      filtros.push('m.produto_id = ?');
      valores.push(produtoId);
    }
    if (tipo) {
      filtros.push('m.tipo = ?');
      valores.push(tipo);
    }
    if (de) {
      filtros.push('date(m.criada_em) >= ?');
      valores.push(de);
    }
    if (ate) {
      filtros.push('date(m.criada_em) <= ?');
      valores.push(ate);
    }
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    return this.db
      .prepare(`${SELECT_BASE} ${where} ORDER BY m.id DESC LIMIT ?`)
      .all(...valores, limite);
  }
}
