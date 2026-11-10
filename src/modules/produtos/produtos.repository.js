export class ProdutosRepository {
  constructor(db) {
    this.db = db;
  }

  listar({ q, categoria, abaixoMinimo, apenasAtivos } = {}) {
    const filtros = [];
    const valores = [];
    if (q) {
      filtros.push('(nome LIKE ? OR sku LIKE ?)');
      valores.push(`%${q}%`, `%${q}%`);
    }
    if (categoria) {
      filtros.push('categoria = ?');
      valores.push(categoria);
    }
    if (abaixoMinimo) filtros.push('estoque_minimo > 0 AND estoque_atual <= estoque_minimo');
    if (apenasAtivos) filtros.push('ativo = 1');

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    return this.db.prepare(`SELECT * FROM produtos ${where} ORDER BY nome`).all(...valores);
  }

  buscarPorId(id) {
    return this.db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
  }

  buscarPorSku(sku) {
    return this.db.prepare('SELECT * FROM produtos WHERE sku = ?').get(sku);
  }

  categorias() {
    return this.db
      .prepare('SELECT DISTINCT categoria FROM produtos ORDER BY categoria')
      .all()
      .map((linha) => linha.categoria);
  }

  criar({ sku, nome, categoria, unidade, preco_custo_centavos, estoque_minimo }) {
    const result = this.db
      .prepare(
        `INSERT INTO produtos (sku, nome, categoria, unidade, preco_custo_centavos, estoque_minimo)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(sku, nome, categoria, unidade, preco_custo_centavos, estoque_minimo);
    return Number(result.lastInsertRowid);
  }

  atualizar(id, { sku, nome, categoria, unidade, preco_custo_centavos, estoque_minimo, ativo }) {
    this.db
      .prepare(
        `UPDATE produtos
            SET sku = ?, nome = ?, categoria = ?, unidade = ?,
                preco_custo_centavos = ?, estoque_minimo = ?, ativo = ?
          WHERE id = ?`,
      )
      .run(sku, nome, categoria, unidade, preco_custo_centavos, estoque_minimo, ativo ? 1 : 0, id);
  }

  atualizarSaldo(id, saldo) {
    this.db.prepare('UPDATE produtos SET estoque_atual = ? WHERE id = ?').run(saldo, id);
  }
}
