import { createApp } from './app.js';
import { env } from './config/env.js';
import { createDatabase } from './database/connection.js';

const db = createDatabase();
const app = createApp({ db });

const server = app.listen(env.port, () => {
  console.log(`Servidor rodando em http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
