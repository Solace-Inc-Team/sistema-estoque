import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { RelatoriosController } from './relatorios.controller.js';
import { periodoQuery } from './relatorios.schemas.js';

export function createRelatoriosRouter(service) {
  const router = Router();
  const controller = new RelatoriosController(service);

  router.get('/posicao', controller.posicao);
  router.get('/abaixo-minimo', controller.abaixoMinimo);
  router.get('/movimentacoes', validate({ query: periodoQuery }), controller.movimentacoes);

  return router;
}
