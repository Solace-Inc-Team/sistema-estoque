import { createServices } from '../routes.js';
import { createDatabase } from './connection.js';

const db = createDatabase();
const { produtosService, movimentacoesService } = createServices({ db });

if (produtosService.listar({}).length > 0) {
  console.log('Banco já possui dados. Nada a fazer.');
  process.exit(0);
}

const catalogo = [
  ['CAD-001', 'Caderno universitário 96 folhas', 'Papelaria', 'un', 1290, 20, 60],
  ['CAN-010', 'Caneta esferográfica azul', 'Papelaria', 'cx', 2450, 10, 8],
  ['PAP-A4', 'Papel sulfite A4 (resma 500 folhas)', 'Papelaria', 'un', 2890, 30, 120],
  ['CAB-USB', 'Cabo USB-C 1 m', 'Informática', 'un', 1890, 15, 42],
  ['MOU-SF', 'Mouse sem fio', 'Informática', 'un', 4990, 10, 6],
  ['TEC-ABN', 'Teclado ABNT2', 'Informática', 'un', 7990, 8, 14],
  ['CAF-500', 'Café torrado 500 g', 'Copa', 'un', 2190, 24, 18],
  ['ACU-1KG', 'Açúcar refinado 1 kg', 'Copa', 'un', 590, 20, 55],
  ['COP-200', 'Copo descartável 200 ml (c/100)', 'Copa', 'pct', 890, 25, 70],
  ['ALC-1L', 'Álcool 70% 1 L', 'Limpeza', 'un', 990, 12, 30],
  ['DET-500', 'Detergente 500 ml', 'Limpeza', 'un', 349, 24, 3],
  ['PAN-MF', 'Pano de microfibra', 'Limpeza', 'un', 690, 15, 40],
];

for (const [sku, nome, categoria, unidade, preco, minimo, inicial] of catalogo) {
  produtosService.criar({
    sku, nome, categoria, unidade,
    preco_custo_centavos: preco,
    estoque_minimo: minimo,
    estoque_inicial: inicial,
  });
}

const saidas = [['PAP-A4', 25, 'Consumo do escritório'], ['CAF-500', 6, 'Reposição da copa'], ['CAD-001', 12, 'Kit novos colaboradores'], ['COP-200', 10, 'Evento interno']];
const todos = produtosService.listar({});
for (const [sku, quantidade, motivo] of saidas) {
  const produto = todos.find((p) => p.sku === sku);
  movimentacoesService.registrar({ produto_id: produto.id, tipo: 'SAIDA', quantidade, motivo });
}

console.log('Dados de exemplo criados com sucesso.');
