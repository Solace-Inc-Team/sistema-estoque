import express from 'express';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

/**
 * Monta a aplicação Express. Recebe as dependências por parâmetro
 * (banco e relógio), o que facilita os testes.
 */
export function createApp({ db, clock = () => new Date() }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', createApiRouter({ db, clock }));
  app.use('/api', notFoundHandler);

  app.use(express.static(publicDir));
  app.use(errorHandler);

  return app;
}
