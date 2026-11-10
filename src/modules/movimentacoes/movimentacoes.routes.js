import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { MovimentacoesController } from './movimentacoes.controller.js';
import { listarMovimentacoesQuery, registrarMovimentacaoBody } from './movimentacoes.schemas.js';

export function createMovimentacoesRouter(service) {
  const router = Router();
  const controller = new MovimentacoesController(service);

  router.get('/', validate({ query: listarMovimentacoesQuery }), controller.listar);
  router.post('/', validate({ body: registrarMovimentacaoBody }), controller.registrar);

  return router;
}
