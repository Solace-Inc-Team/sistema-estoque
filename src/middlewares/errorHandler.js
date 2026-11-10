import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, 'ROTA_NAO_ENCONTRADA', `Rota ${req.method} ${req.originalUrl} não existe.`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'JSON_INVALIDO', message: 'O corpo da requisição não é um JSON válido.' },
    });
  }

  if (typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({
      error: { code: 'CONFLITO', message: 'Operação viola uma regra de integridade dos dados.' },
    });
  }

  console.error(err);
  res.status(500).json({
    error: { code: 'ERRO_INTERNO', message: 'Erro interno do servidor.' },
  });
}
