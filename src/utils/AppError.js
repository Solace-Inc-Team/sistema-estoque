export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, 'REQUISICAO_INVALIDA', message, details);
  }

  static notFound(message = 'Recurso não encontrado.') {
    return new AppError(404, 'NAO_ENCONTRADO', message);
  }

  static conflict(message) {
    return new AppError(409, 'CONFLITO', message);
  }
}
