export class RelatoriosService {
  constructor(repository) {
    this.repository = repository;
  }

  posicao() {
    const itens = this.repository.posicao();
    const porCategoria = new Map();

    for (const item of itens) {
      const categoria = porCategoria.get(item.categoria) ?? { categoria: item.categoria, produtos: 0, unidades: 0, valor_total_centavos: 0 };
      categoria.produtos += 1;
      categoria.unidades += item.estoque_atual;
      categoria.valor_total_centavos += item.valor_total_centavos;
      porCategoria.set(item.categoria, categoria);
    }

    return {
      totais: {
        produtos: itens.length,
        unidades: itens.reduce((soma, i) => soma + i.estoque_atual, 0),
        valor_total_centavos: itens.reduce((soma, i) => soma + i.valor_total_centavos, 0),
        abaixo_minimo: this.repository.abaixoMinimo().length,
      },
      por_categoria: [...porCategoria.values()],
      itens,
    };
  }

  abaixoMinimo() {
    return this.repository.abaixoMinimo();
  }

  movimentacoes({ de, ate }) {
    const hoje = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fim = ate ?? `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
    const inicio = de ?? `${fim.slice(0, 8)}01`;

    return {
      periodo: { de: inicio, ate: fim },
      por_tipo: this.repository.movimentacoesPorTipo({ de: inicio, ate: fim }),
      maiores_saidas: this.repository.maioresSaidas({ de: inicio, ate: fim }),
    };
  }
}
