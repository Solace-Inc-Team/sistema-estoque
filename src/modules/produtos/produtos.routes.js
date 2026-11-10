import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/schemas.js';
import { ProdutosController } from './produtos.controller.js';
import { atualizarProdutoBody, criarProdutoBody, listarProdutosQuery } from './produtos.schemas.js';

export function createProdutosRouter(service) {
  const router = Router();
  const controller = new ProdutosController(service);

  router.get('/', validate({ query: listarProdutosQuery }), controller.listar);
  router.get('/categorias', controller.categorias);
  router.post('/', validate({ body: criarProdutoBody }), controller.criar);
  router.get('/:id', validate({ params: idParams }), controller.obter);
  router.patch('/:id', validate({ params: idParams, body: atualizarProdutoBody }), controller.atualizar);

  return router;
}
