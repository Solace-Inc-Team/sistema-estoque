import { AppError } from '../utils/AppError.js';

/**
 * Valida body, query e params com schemas Zod.
 * Os dados já validados/convertidos ficam em req.valid.
 */
export function validate({ body, query, params }) {
  const schemas = { body, query, params };

  return (req, _res, next) => {
    const valid = {};
    const details = [];

    for (const [part, schema] of Object.entries(schemas)) {
      if (!schema) continue;
      const input = part === 'body' ? (req.body ?? {}) : req[part];
      const result = schema.safeParse(input);

      if (result.success) {
        valid[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({ campo: issue.path.join('.') || part, mensagem: issue.message });
        }
      }
    }

    if (details.length > 0) {
      return next(AppError.badRequest('Dados inválidos.', details));
    }

    req.valid = valid;
    next();
  };
}
