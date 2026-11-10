import { Router } from 'express';
import { MovimentacoesRepository } from './modules/movimentacoes/movimentacoes.repository.js';
import { createMovimentacoesRouter } from './modules/movimentacoes/movimentacoes.routes.js';
import { MovimentacoesService } from './modules/movimentacoes/movimentacoes.service.js';
import { ProdutosRepository } from './modules/produtos/produtos.repository.js';
import { createProdutosRouter } from './modules/produtos/produtos.routes.js';
import { ProdutosService } from './modules/produtos/produtos.service.js';
import { RelatoriosRepository } from './modules/relatorios/relatorios.repository.js';
import { createRelatoriosRouter } from './modules/relatorios/relatorios.routes.js';
import { RelatoriosService } from './modules/relatorios/relatorios.service.js';

/** Composição das dependências (repository -> service -> controller/rotas). */
export function createServices({ db }) {
  const produtosRepository = new ProdutosRepository(db);
  const movimentacoesService = new MovimentacoesService({
    db,
    repository: new MovimentacoesRepository(db),
    produtosRepository,
  });
  const produtosService = new ProdutosService({ db, repository: produtosRepository, movimentacoesService });
  const relatoriosService = new RelatoriosService(new RelatoriosRepository(db));
  return { produtosService, movimentacoesService, relatoriosService };
}

export function createApiRouter({ db }) {
  const { produtosService, movimentacoesService, relatoriosService } = createServices({ db });
  const router = Router();

  router.use('/produtos', createProdutosRouter(produtosService));
  router.use('/movimentacoes', createMovimentacoesRouter(movimentacoesService));
  router.use('/relatorios', createRelatoriosRouter(relatoriosService));

  return router;
}
