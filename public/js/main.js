import { startRouter } from './router.js';
import { renderDashboard } from './views/dashboard.js';
import { renderMovimentacoes } from './views/movimentacoes.js';
import { renderProdutos } from './views/produtos.js';
import { renderRelatorios } from './views/relatorios.js';

startRouter(
  [
    { path: 'visao-geral', label: 'Visão geral', render: renderDashboard },
    { path: 'produtos', label: 'Produtos', render: renderProdutos },
    { path: 'movimentacoes', label: 'Movimentações', render: renderMovimentacoes },
    { path: 'relatorios', label: 'Relatórios', render: renderRelatorios },
  ],
  { nav: document.getElementById('nav'), view: document.getElementById('view') },
);
