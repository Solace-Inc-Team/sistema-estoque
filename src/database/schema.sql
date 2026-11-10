CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Geral',
  unidade TEXT NOT NULL DEFAULT 'un',
  preco_custo_centavos INTEGER NOT NULL DEFAULT 0 CHECK (preco_custo_centavos >= 0),
  estoque_minimo INTEGER NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  estoque_atual INTEGER NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (categoria);

-- Histórico imutável: cada linha guarda a variação e o saldo resultante.
CREATE TABLE IF NOT EXISTS movimentacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL REFERENCES produtos (id),
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
  quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
  variacao INTEGER NOT NULL,
  saldo_apos INTEGER NOT NULL CHECK (saldo_apos >= 0),
  motivo TEXT,
  criada_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes (produto_id, criada_em);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes (criada_em);
